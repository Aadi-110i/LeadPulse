/* End-to-end API smoke test against the running LeadPulse server. */
const BASE = process.env.API_BASE || 'http://127.0.0.1:3000';

let token = null;
const results = [];

function check(name, ok, detail = '') {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
}

async function call(method, path, body, headers = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  const text = await res.text();
  try {
    json = JSON.parse(text);
  } catch {
    json = { raw: text.slice(0, 200) };
  }
  return { status: res.status, json };
}

(async () => {
  // --- health -------------------------------------------------------------
  let r = await call('GET', '/api/health');
  check('health returns healthy', r.status === 200 && r.json.status === 'healthy', `db=${r.json?.services?.database} queue=${r.json?.services?.queue}`);

  // --- auth ---------------------------------------------------------------
  r = await call('POST', '/api/auth/signin', { email: 'demo@leadpulse.dev', password: 'demo1234' });
  check('signin with seeded account', r.status === 200 && !!r.json?.data?.token, r.json?.message || '');
  token = r.json?.data?.token ?? null;

  r = await call('GET', '/api/auth/me');
  check('GET /me with token', r.status === 200 && r.json?.data?.user?.email === 'demo@leadpulse.dev', r.json?.message || '');

  const saved = token;
  token = null;
  r = await call('GET', '/api/leads');
  check('protected route rejects missing token', r.status === 401, `status=${r.status}`);
  token = saved;

  r = await call('POST', '/api/auth/signin', { email: 'demo@leadpulse.dev', password: 'wrongpass' });
  check('signin rejects wrong password', r.status === 401, r.json?.message || '');

  r = await call('POST', '/api/auth/signup', { email: 'not-an-email', password: 'short' });
  check('signup validates input', r.status === 400, r.json?.message || '');

  const unique = `probe-${Date.now()}@leadpulse.dev`;
  r = await call('POST', '/api/auth/signup', { email: unique, password: 'probe-pass-123', name: 'Probe' });
  check('signup creates account', r.status === 201 && !!r.json?.data?.token, r.json?.message || '');

  r = await call('POST', '/api/auth/signup', { email: unique, password: 'probe-pass-123' });
  check('signup rejects duplicate account', r.status === 409, r.json?.message || '');

  // --- leads --------------------------------------------------------------
  r = await call('GET', '/api/leads');
  const leads = r.json?.data ?? [];
  check('GET /api/leads returns rows', r.status === 200 && leads.length > 0, `count=${leads.length} total=${r.json?.meta?.total}`);

  r = await call('GET', '/api/leads?status=converted');
  const converted = r.json?.data ?? [];
  check('status filter works', r.status === 200 && converted.every((l) => l.status === 'converted'), `count=${converted.length}`);

  r = await call('GET', '/api/leads?q=rahul');
  check('search filter works', r.status === 200 && (r.json?.data ?? []).length >= 0, `count=${(r.json?.data ?? []).length}`);

  r = await call('GET', '/api/leads?sortBy=name&sortDir=asc');
  const names = (r.json?.data ?? []).map((l) => l.name.toLowerCase());
  const sorted = [...names].sort();
  check('sorting works', r.status === 200 && JSON.stringify(names) === JSON.stringify(sorted), names.slice(0, 2).join(', '));

  r = await call('GET', '/api/leads?status=bogus');
  check('invalid status filter rejected', r.status === 400, r.json?.message || '');

  const leadId = leads[0]?.id;
  r = await call('GET', `/api/leads/${leadId}`);
  check('GET lead detail returns calls', r.status === 200 && Array.isArray(r.json?.data?.calls), `calls=${r.json?.data?.calls?.length}`);

  r = await call('GET', '/api/leads/not-a-real-id');
  check('unknown lead returns 404', r.status === 404, r.json?.message || '');

  const originalStatus = leads[0]?.status;
  r = await call('PATCH', `/api/leads/${leadId}`, { status: 'converted' });
  check('PATCH lead status works', r.status === 200 && r.json?.data?.status === 'converted', `now=${r.json?.data?.status}`);

  r = await call('PATCH', `/api/leads/${leadId}`, { status: 'nonsense' });
  check('PATCH rejects invalid status', r.status === 400, r.json?.message || '');

  if (originalStatus && originalStatus !== 'converted') {
    await call('PATCH', `/api/leads/${leadId}`, { status: originalStatus });
  }

  // --- calls --------------------------------------------------------------
  r = await call('GET', '/api/calls?limit=5');
  check('GET /api/calls returns rows', r.status === 200 && (r.json?.data ?? []).length > 0, `count=${(r.json?.data ?? []).length}`);

  r = await call('POST', '/api/calls', {
    leadId,
    durationSeconds: 184,
    transcript:
      'Hi, we spoke about bulk pricing for our sales team. We take forty inbound calls a day and follow-ups get forgotten. Send me the pricing sheet and I will forward it to our operations lead.',
    outcome: 'Interested',
  });
  const created = r.json?.data;
  check('POST /api/calls logs + summarises', r.status === 202 && !!created?.call?.id && !!created?.call?.summary, `summary="${created?.call?.summary?.slice(0, 60)}..."`);
  check('POST /api/calls queues a follow-up job', r.status === 202 && !!created?.job?.id, `job=${created?.job?.status}`);

  r = await call('POST', '/api/calls', { leadId: 'missing-lead', transcript: 'x' });
  check('POST /api/calls rejects unknown lead', r.status === 404, r.json?.message || '');

  r = await call('POST', '/api/calls', { transcript: 'no lead supplied' });
  check('POST /api/calls requires a lead', r.status === 400, r.json?.message || '');

  // --- stats --------------------------------------------------------------
  r = await call('GET', '/api/stats');
  const stats = r.json?.data ?? {};
  check('GET /api/stats returns overview', r.status === 200 && typeof stats.totalLeads === 'number', `leads=${stats.totalLeads} callsToday=${stats.callsToday} latency=${stats.avgLatencyMs}ms`);
  check('stats include a 14-day trend', Array.isArray(stats.trend) && stats.trend.length > 0, `points=${stats.trend?.length}`);

  r = await call('GET', '/api/stats/activity');
  check('GET /api/stats/activity returns feed', r.status === 200 && (r.json?.data ?? []).length > 0, `count=${(r.json?.data ?? []).length}`);

  r = await call('GET', '/api/stats/observability');
  const obs = r.json?.data ?? {};
  check('GET /api/stats/observability returns jobs + webhooks', r.status === 200 && !!obs.jobs && !!obs.webhooks, `jobs=${obs.jobs?.total} webhooks=${obs.webhooks?.total}`);

  r = await call('GET', '/api/webhooks/events');
  check('GET /api/webhooks/events returns events', r.status === 200 && (r.json?.data ?? []).length > 0, `count=${(r.json?.data ?? []).length}`);

  // --- queue settles ------------------------------------------------------
  console.log('\nwaiting for the follow-up queue to drain...');
  let jobStatus = 'queued';
  for (let i = 0; i < 12; i += 1) {
    await new Promise((res) => setTimeout(res, 1500));
    const obs2 = await call('GET', '/api/stats/observability');
    const job = (obs2.json?.data?.recentJobs ?? []).find((j) => j.id === created?.job?.id);
    if (job) {
      jobStatus = job.status;
      if (job.status === 'sent' || job.status === 'dead_letter' || job.status === 'failed') break;
    }
  }
  check('queued follow-up job reaches a terminal state', jobStatus === 'sent' || jobStatus === 'dead_letter' || jobStatus === 'failed', `status=${jobStatus}`);

  const failed = results.filter((x) => !x.ok);
  console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
  if (failed.length) {
    console.log('FAILURES:');
    failed.forEach((f) => console.log(` - ${f.name} (${f.detail})`));
    process.exit(1);
  }
})().catch((err) => {
  console.error('smoke test crashed:', err);
  process.exit(1);
});

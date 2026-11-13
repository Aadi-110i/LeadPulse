/**
 * The API reference, shared by the marketing site's API section and the
 * full docs surface so the two can never drift apart.
 *
 * Shapes mirror the live server in `server/` — the examples here are the same
 * payloads the running API returns.
 */

export const API_GROUPS = [
  { id: 'calls', label: 'Calls' },
  { id: 'leads', label: 'Leads' },
  { id: 'insights', label: 'Insights' },
  { id: 'auth', label: 'Auth' },
];

export const API_ENDPOINTS = [
  {
    id: 'log-call',
    group: 'calls',
    title: 'Log a call',
    summary:
      'Record a finished customer call. LeadPulse transcribes it, extracts the summary, sentiment and next step, then queues the WhatsApp follow-up.',
    method: 'POST',
    path: '/api/calls',
    auth: true,
    body: {
      lead_id: '08e9b376-5673-42b3-ac60-71fa2e3997f7',
      duration_seconds: 184,
      outcome: 'Interested',
      transcript:
        'Hi, we spoke about bulk pricing for our sales team. We take forty inbound calls a day and follow-ups get forgotten constantly. Send me the pricing sheet and I will forward it to our operations lead.',
    },
    response: {
      status: 202,
      body: {
        status: 'success',
        data: {
          call: {
            id: '5f1c2a80-3b44-4a91-9d77-2b6f0c9e4a11',
            duration_seconds: 184,
            outcome: 'Pricing question',
            summary: 'Send me the pricing sheet and I will forward it to our operations lead.',
            sentiment: 'neutral',
            sentiment_score: 0.5,
            next_step: 'Send pricing sheet',
          },
          job: { id: 'b31d8e42-0c19-4f77-8a21-5d0c7f6e2b39', channel: 'whatsapp', status: 'queued' },
          queue: 'bullmq',
        },
      },
    },
  },
  {
    id: 'list-leads',
    group: 'leads',
    title: 'List leads',
    summary: 'Every lead in the pipeline, with the summary and sentiment from its most recent call.',
    method: 'GET',
    path: '/api/leads',
    auth: true,
    query: [
      { name: 'status', value: 'contacted', description: 'new, contacted, converted or lost' },
      { name: 'q', value: 'rahul', description: 'matches name, company, id or summary' },
      { name: 'sortBy', value: 'updatedAt', description: 'name, status, sentiment, createdAt, updatedAt' },
      { name: 'sortDir', value: 'desc', description: 'asc or desc' },
    ],
    response: {
      status: 200,
      body: {
        status: 'success',
        data: [
          {
            id: '08e9b376-5673-42b3-ac60-71fa2e3997f7',
            externalId: 'lead_262',
            name: 'Nadia Novak',
            company: 'Verdant Farms',
            status: 'contacted',
            aiSummary: 'Interested in bulk pricing.',
            sentiment: 'positive',
            sentimentScore: 0.87,
            followupSent: true,
            nextStep: 'Send pricing sheet',
          },
        ],
        meta: { total: 64 },
      },
    },
  },
  {
    id: 'get-lead',
    group: 'leads',
    title: 'Get lead detail',
    summary: 'One lead plus the full call history behind its current state.',
    method: 'GET',
    path: '/api/leads/{lead_id}',
    auth: true,
    response: {
      status: 200,
      body: {
        status: 'success',
        data: {
          lead: { id: '08e9b376-…', name: 'Nadia Novak', status: 'contacted', sentiment: 'positive' },
          calls: [
            {
              id: '5f1c2a80-…',
              durationSeconds: 184,
              outcome: 'Pricing question',
              summary: 'Interested in bulk pricing.',
              sentiment: 'positive',
              createdAt: '2026-11-06T09:14:22.101Z',
            },
          ],
        },
      },
    },
  },
  {
    id: 'update-lead',
    group: 'leads',
    title: 'Update lead status',
    summary: 'Move a lead through the pipeline. Every transition is recorded against the lead.',
    method: 'PATCH',
    path: '/api/leads/{lead_id}',
    auth: true,
    body: { status: 'converted' },
    response: {
      status: 200,
      body: {
        status: 'success',
        data: {
          id: '08e9b376-…',
          name: 'Nadia Novak',
          status: 'converted',
          updatedAt: '2026-11-06T09:41:03.882Z',
        },
      },
    },
  },
  {
    id: 'stats',
    group: 'insights',
    title: 'Pipeline stats',
    summary: 'The headline numbers for the pipeline — leads, calls today, delivery rate and queue health.',
    method: 'GET',
    path: '/api/stats',
    auth: true,
    response: {
      status: 200,
      body: {
        status: 'success',
        data: {
          totalLeads: 64,
          callsToday: 8,
          avgLatencyMs: 496,
          failedJobs: 12,
          deliveryRate: 0.916,
          conversionRate: 0.643,
          pipeline: { new: 9, contacted: 25, converted: 18, lost: 12 },
          sentiment: { positive: 27, neutral: 23, negative: 14 },
        },
      },
    },
  },
  {
    id: 'observability',
    group: 'insights',
    title: 'Observability',
    summary: 'Queue state, latency distribution and webhook delivery history — the system talking about itself.',
    method: 'GET',
    path: '/api/stats/observability',
    auth: true,
    response: {
      status: 200,
      body: {
        status: 'success',
        data: {
          jobs: { total: 136, sent: 118, failed: 12, queued: 6, deadLetter: 0, maxAttempts: 3 },
          webhooks: { total: 24, delivered: 21, failed: 3 },
          latencyBuckets: [{ bucket: '<500ms', count: 96 }],
          recentJobs: [],
          recentWebhooks: [],
        },
      },
    },
  },
  {
    id: 'signin',
    group: 'auth',
    title: 'Sign in',
    summary: 'Exchange an email and access key for a bearer token. Tokens are valid for seven days.',
    method: 'POST',
    path: '/api/auth/signin',
    auth: false,
    body: { email: 'demo@leadpulse.dev', password: 'demo1234' },
    response: {
      status: 200,
      body: {
        status: 'success',
        data: {
          user: { id: '…', email: 'demo@leadpulse.dev', name: 'Demo Owner', role: 'owner' },
          token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…',
        },
      },
    },
  },
];

export function endpointById(id) {
  return API_ENDPOINTS.find((endpoint) => endpoint.id === id) ?? null;
}

/** Builds a runnable curl command for an endpoint. */
export function curlFor(endpoint, { host = 'https://api.leadpulse.dev', token = 'LP_KEY_••••' } = {}) {
  const url = `${host}${endpoint.path.replace('{lead_id}', '08e9b376-5673-42b3-ac60-71fa2e3997f7')}`;
  const parts = [`curl -X ${endpoint.method} '${url}'`];

  if (endpoint.auth) {
    parts.push(`  -H 'Authorization: Bearer ${token}'`);
  }
  parts.push(`  -H 'Content-Type: application/json'`);

  if (endpoint.body) {
    parts.push(`  -d '${JSON.stringify(endpoint.body, null, 2)}'`);
  }

  return parts.join(' \\\n');
}

export default API_ENDPOINTS;

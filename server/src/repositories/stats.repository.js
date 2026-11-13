import { many, one } from '../db/pool.js';

/**
 * Every figure here is derived from the live database. Nothing is invented —
 * if a table is empty the number is genuinely zero.
 */

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

export const StatsRepository = {
  async overview() {
    const [totals, callsToday, jobs, sentiment, pipeline] = await Promise.all([
      one(`SELECT count(*)::int AS total_leads FROM leads`),
      one(`SELECT count(*)::int AS calls_today FROM calls WHERE created_at >= $1`, [startOfToday()]),
      one(`
        SELECT
          count(*) FILTER (WHERE status = 'sent')::int            AS sent,
          count(*) FILTER (WHERE status = 'failed')::int          AS failed,
          count(*) FILTER (WHERE status = 'queued')::int          AS queued,
          count(*) FILTER (WHERE status = 'dead_letter')::int     AS dead_letter,
          count(*) FILTER (WHERE status = 'processing')::int     AS processing,
          COALESCE(
            AVG(EXTRACT(EPOCH FROM (completed_at - created_at)) * 1000)
              FILTER (WHERE status = 'sent' AND completed_at IS NOT NULL),
            0
          )::float AS avg_latency_ms
        FROM followup_jobs
      `),
      one(`
        SELECT
          count(*) FILTER (WHERE sentiment = 'positive')::int AS positive,
          count(*) FILTER (WHERE sentiment = 'neutral')::int  AS neutral,
          count(*) FILTER (WHERE sentiment = 'negative')::int AS negative
        FROM leads
      `),
      one(`
        SELECT
          count(*) FILTER (WHERE status = 'new')::int       AS new,
          count(*) FILTER (WHERE status = 'contacted')::int AS contacted,
          count(*) FILTER (WHERE status = 'converted')::int AS converted,
          count(*) FILTER (WHERE status = 'lost')::int      AS lost
        FROM leads
      `),
    ]);

    const sent = jobs?.sent ?? 0;
    const failed = (jobs?.failed ?? 0) + (jobs?.dead_letter ?? 0);
    const attempted = sent + failed;

    return {
      totalLeads: totals?.total_leads ?? 0,
      callsToday: callsToday?.calls_today ?? 0,
      avgLatencyMs: Math.round(jobs?.avg_latency_ms ?? 0),
      failedJobs: (jobs?.failed ?? 0) + (jobs?.dead_letter ?? 0),
      queuedJobs: (jobs?.queued ?? 0) + (jobs?.processing ?? 0),
      deliveryRate: attempted === 0 ? 0 : Number((sent / attempted).toFixed(4)),
      conversionRate:
        (pipeline?.converted ?? 0) + (pipeline?.lost ?? 0) === 0
          ? 0
          : Number(((pipeline?.converted ?? 0) / ((pipeline?.converted ?? 0) + (pipeline?.lost ?? 0))).toFixed(4)),
      pipeline: {
        new: pipeline?.new ?? 0,
        contacted: pipeline?.contacted ?? 0,
        converted: pipeline?.converted ?? 0,
        lost: pipeline?.lost ?? 0,
      },
      sentiment: {
        positive: sentiment?.positive ?? 0,
        neutral: sentiment?.neutral ?? 0,
        negative: sentiment?.negative ?? 0,
      },
      jobs: {
        sent,
        failed: jobs?.failed ?? 0,
        queued: jobs?.queued ?? 0,
        processing: jobs?.processing ?? 0,
        deadLetter: jobs?.dead_letter ?? 0,
      },
    };
  },

  /** Calls per day for the last 14 days — the dashboard trend line. */
  async callTrend(days = 14) {
    // A dense series: a day without calls reads as zero instead of vanishing,
    // so the x-axis stays evenly spaced and no day is silently compressed.
    const rows = await many(
      `WITH spine AS (
         SELECT generate_series(
           date_trunc('day', now()) - ($1::int - 1) * interval '1 day',
           date_trunc('day', now()),
           interval '1 day'
         ) AS day
       )
       SELECT
         to_char(s.day, 'YYYY-MM-DD') AS day,
         count(c.id)::int AS calls,
         count(c.id) FILTER (WHERE c.sentiment = 'positive')::int AS positive
       FROM spine s
       LEFT JOIN calls c
         ON c.created_at >= s.day
        AND c.created_at <  s.day + interval '1 day'
        AND c.created_at >= now() - $1::int * interval '1 day'
       GROUP BY s.day
       ORDER BY s.day ASC`,
      [days]
    );
    return rows.map((r) => ({ day: r.day, calls: r.calls, positive: r.positive }));
  },

  /** Newest activity, calls and follow-up jobs merged into one feed. */
  async recentActivity(limit = 12) {
    const rows = await many(
      `SELECT * FROM (
         SELECT
           'call'::text AS kind,
           c.created_at AS at,
           c.lead_id,
           l.name AS lead_name,
           l.external_id AS lead_external_id,
           c.summary AS detail,
           c.sentiment,
           NULL::text AS job_status,
           NULL::text AS error
         FROM calls c JOIN leads l ON l.id = c.lead_id
         UNION ALL
         SELECT
           'job'::text AS kind,
           f.created_at AS at,
           f.lead_id,
           l.name AS lead_name,
           l.external_id AS lead_external_id,
           f.error AS detail,
           NULL::text AS sentiment,
           f.status AS job_status,
           f.error
         FROM followup_jobs f JOIN leads l ON l.id = f.lead_id
       ) events
       ORDER BY at DESC
       LIMIT $1`,
      [limit]
    );

    return rows.map((r) => ({
      kind: r.kind,
      at: r.at,
      leadId: r.lead_id,
      leadName: r.lead_name,
      leadExternalId: r.lead_external_id,
      detail: r.detail,
      sentiment: r.sentiment,
      jobStatus: r.job_status,
      error: r.error,
    }));
  },

  /** Queue + webhook observability for the observability view. */
  async observability() {
    const [jobs, webhooks, latencyBuckets] = await Promise.all([
      one(`
        SELECT
          count(*)::int AS total,
          count(*) FILTER (WHERE status = 'sent')::int        AS sent,
          count(*) FILTER (WHERE status = 'failed')::int      AS failed,
          count(*) FILTER (WHERE status = 'queued')::int      AS queued,
          count(*) FILTER (WHERE status = 'dead_letter')::int AS dead_letter,
          COALESCE(max(attempts), 0)::int                     AS max_attempts
        FROM followup_jobs
      `),
      one(`
        SELECT
          count(*)::int AS total,
          count(*) FILTER (WHERE status = 'delivered')::int AS delivered,
          count(*) FILTER (WHERE status = 'failed')::int    AS failed
        FROM webhook_events
      `),
      many(`
        SELECT
          CASE
            WHEN EXTRACT(EPOCH FROM (completed_at - created_at)) * 1000 < 500   THEN '<500ms'
            WHEN EXTRACT(EPOCH FROM (completed_at - created_at)) * 1000 < 2000  THEN '500ms-2s'
            WHEN EXTRACT(EPOCH FROM (completed_at - created_at)) * 1000 < 5000  THEN '2s-5s'
            ELSE '>5s'
          END AS bucket,
          count(*)::int AS count
        FROM followup_jobs
        WHERE completed_at IS NOT NULL
        GROUP BY 1
      `),
    ]);

    const recentJobs = await many(
      `SELECT
         f.id, f.lead_id, l.name AS lead_name, l.external_id AS lead_external_id,
         f.channel, f.status, f.attempts, f.error, f.created_at, f.completed_at
       FROM followup_jobs f JOIN leads l ON l.id = f.lead_id
       ORDER BY f.created_at DESC
       LIMIT 25`
    );

    const recentWebhooks = await many(
      `SELECT id, event_type, target_url, status, status_code, created_at
       FROM webhook_events ORDER BY created_at DESC LIMIT 15`
    );

    return {
      jobs: {
        total: jobs?.total ?? 0,
        sent: jobs?.sent ?? 0,
        failed: jobs?.failed ?? 0,
        queued: jobs?.queued ?? 0,
        deadLetter: jobs?.dead_letter ?? 0,
        maxAttempts: jobs?.max_attempts ?? 0,
      },
      webhooks: {
        total: webhooks?.total ?? 0,
        delivered: webhooks?.delivered ?? 0,
        failed: webhooks?.failed ?? 0,
      },
      latencyBuckets: latencyBuckets.map((b) => ({ bucket: b.bucket, count: b.count })),
      recentJobs: recentJobs.map((j) => ({
        id: j.id,
        leadId: j.lead_id,
        leadName: j.lead_name,
        leadExternalId: j.lead_external_id,
        channel: j.channel,
        status: j.status,
        attempts: j.attempts,
        error: j.error,
        createdAt: j.created_at,
        completedAt: j.completed_at,
      })),
      recentWebhooks: recentWebhooks.map((w) => ({
        id: w.id,
        eventType: w.event_type,
        targetUrl: w.target_url,
        status: w.status,
        statusCode: w.status_code,
        createdAt: w.created_at,
      })),
    };
  },
};

export default StatsRepository;

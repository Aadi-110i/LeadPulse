import { one } from '../db/pool.js';

const MAX_ATTEMPTS = 3;

/**
 * Follow-up job lifecycle. The queue driver only decides *when* a job runs;
 * every state transition lives here so both drivers behave identically.
 */

function mapJob(row) {
  if (!row) return null;
  return {
    id: row.id,
    leadId: row.lead_id,
    channel: row.channel,
    status: row.status,
    attempts: row.attempts,
    error: row.error,
    payload: row.payload,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

/**
 * Simulated WhatsApp Business API delivery.
 *
 * Three deterministic outcomes, keyed off the job id so the observable rate is
 * stable across restarts:
 *
 *   - a blocked recipient (negative sentiment) fails the first attempt and
 *     clears on the retry — the retry is what the queue backoff exists for;
 *   - a small slice of recipients have opted out permanently, so every attempt
 *     fails and the job dead-letters;
 *   - a small slice hits a transient upstream 503 that clears on the retry.
 */
function attemptDelivery(jobId, leadSentiment, attempt) {
  if (leadSentiment === 'negative' && attempt === 1) {
    return { ok: false, error: 'Recipient was unreachable — delivery deferred.' };
  }

  const bucket = parseInt(jobId.replace(/-/g, '').slice(0, 4), 16) % 100;

  if (bucket < 2) {
    return { ok: false, error: 'Recipient opted out of automated follow-ups.' };
  }

  if (bucket < 7 && attempt === 1) {
    return { ok: false, error: 'WhatsApp Business API returned 503: channel temporarily unavailable' };
  }

  return { ok: true };
}

export const FollowupService = {
  async createJob({ leadId, channel = 'whatsapp', payload = {} }) {
    const row = await one(
      `INSERT INTO followup_jobs (lead_id, channel, status, attempts, payload)
       VALUES ($1, $2, 'queued', 0, $3)
       RETURNING *`,
      [leadId, channel, JSON.stringify(payload)]
    );
    return mapJob(row);
  },

  async getJob(id) {
    const row = await one(`SELECT * FROM followup_jobs WHERE id = $1`, [id]);
    return mapJob(row);
  },

  /** Runs one delivery attempt and records the outcome. */
  async processJob(jobId) {
    const job = await FollowupService.getJob(jobId);
    if (!job) return { status: 'missing' };
    if (job.status === 'sent') return { status: 'sent', job };

    const lead = await one(`SELECT id, name, phone, sentiment FROM leads WHERE id = $1`, [job.leadId]);
    if (!lead) {
      await one(
        `UPDATE followup_jobs SET status = 'failed', error = 'Lead no longer exists', completed_at = now() WHERE id = $1`,
        [jobId]
      );
      return { status: 'failed', error: 'Lead no longer exists' };
    }

    const attempt = job.attempts + 1;
    const result = attemptDelivery(jobId, lead.sentiment, attempt);

    if (result.ok) {
      await one(
        `UPDATE followup_jobs SET status = 'sent', attempts = $2, error = '', completed_at = now() WHERE id = $1`,
        [jobId, attempt]
      );
      await one(`UPDATE leads SET followup_sent = true, updated_at = now() WHERE id = $1`, [job.leadId]);
      return { status: 'sent', jobId, leadId: job.leadId };
    }

    const exhausted = attempt >= MAX_ATTEMPTS;
    await one(
      `UPDATE followup_jobs
       SET status = $2, attempts = $3, error = $4, completed_at = CASE WHEN $5 THEN now() ELSE NULL END
       WHERE id = $1`,
      [jobId, exhausted ? 'dead_letter' : 'queued', attempt, result.error, exhausted]
    );

    return {
      status: exhausted ? 'dead_letter' : 'retry',
      error: result.error,
      jobId,
      leadId: job.leadId,
      attempts: attempt,
    };
  },

  maxAttempts: MAX_ATTEMPTS,
};

export default FollowupService;

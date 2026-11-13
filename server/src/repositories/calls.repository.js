import { many, one } from '../db/pool.js';

const CALL_COLUMNS = `
  id, lead_id, duration_seconds, transcript, outcome,
  summary, sentiment, sentiment_score, next_step, created_at
`;

function mapCall(row) {
  if (!row) return null;
  return {
    id: row.id,
    leadId: row.lead_id,
    leadName: row.lead_name ?? undefined,
    leadExternalId: row.lead_external_id ?? undefined,
    durationSeconds: row.duration_seconds,
    transcript: row.transcript,
    outcome: row.outcome,
    summary: row.summary,
    sentiment: row.sentiment,
    sentimentScore: Number(row.sentiment_score),
    nextStep: row.next_step,
    createdAt: row.created_at,
  };
}

export const CallsRepository = {
  async list({ leadId, limit = 50 } = {}) {
    const values = [];
    let where = '';

    if (leadId) {
      values.push(leadId);
      where = `WHERE c.lead_id = $${values.length}`;
    }

    values.push(limit);
    const limitIdx = values.length;

    const rows = await many(
      `SELECT ${CALL_COLUMNS.split(',').map((c) => `c.${c.trim()}`).join(', ')},
              l.name AS lead_name, l.external_id AS lead_external_id
       FROM calls c
       JOIN leads l ON l.id = c.lead_id
       ${where}
       ORDER BY c.created_at DESC
       LIMIT $${limitIdx}`,
      values
    );
    return rows.map(mapCall);
  },

  async findById(id) {
    const row = await one(`SELECT ${CALL_COLUMNS} FROM calls WHERE id = $1`, [id]);
    return mapCall(row);
  },

  async create({ leadId, durationSeconds, transcript, outcome, summary, sentiment, sentimentScore, nextStep }) {
    const row = await one(
      `INSERT INTO calls
         (lead_id, duration_seconds, transcript, outcome, summary, sentiment, sentiment_score, next_step)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       RETURNING ${CALL_COLUMNS}`,
      [leadId, durationSeconds, transcript, outcome, summary, sentiment, sentimentScore, nextStep]
    );
    return mapCall(row);
  },

  async countSince(since) {
    const row = await one(`SELECT count(*)::int AS count FROM calls WHERE created_at >= $1`, [since]);
    return row?.count ?? 0;
  },
};

export default CallsRepository;

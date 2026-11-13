import { many, one } from '../db/pool.js';

const LEAD_COLUMNS = `
  id, external_id, name, company, phone, email, status,
  ai_summary, sentiment, sentiment_score, followup_sent, next_step,
  created_at, updated_at
`;

function mapLead(row) {
  if (!row) return null;
  return {
    id: row.id,
    externalId: row.external_id,
    name: row.name,
    company: row.company,
    phone: row.phone,
    email: row.email,
    status: row.status,
    aiSummary: row.ai_summary,
    sentiment: row.sentiment,
    sentimentScore: Number(row.sentiment_score),
    followupSent: row.followup_sent,
    nextStep: row.next_step,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SORTABLE = {
  name: 'name',
  status: 'status',
  sentiment: 'sentiment_score',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
};

export const LeadsRepository = {
  async list({ status, q, sortBy = 'updatedAt', sortDir = 'desc', limit = 100, offset = 0 } = {}) {
    const conditions = [];
    const values = [];

    if (status && status !== 'all') {
      values.push(status);
      conditions.push(`status = $${values.length}`);
    }

    if (q && q.trim()) {
      values.push(`%${q.trim().toLowerCase()}%`);
      const idx = values.length;
      conditions.push(
        `(lower(name) LIKE $${idx} OR lower(company) LIKE $${idx} OR lower(external_id) LIKE $${idx} OR lower(ai_summary) LIKE $${idx})`
      );
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const column = SORTABLE[sortBy] ?? 'updated_at';
    const direction = String(sortDir).toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    const totalRes = await one(`SELECT count(*)::int AS total FROM leads ${where}`, values);

    values.push(limit);
    const limitIdx = values.length;
    values.push(offset);
    const offsetIdx = values.length;

    const rows = await many(
      `SELECT ${LEAD_COLUMNS} FROM leads ${where}
       ORDER BY ${column} ${direction}, id ASC
       LIMIT $${limitIdx} OFFSET $${offsetIdx}`,
      values
    );

    return { data: rows.map(mapLead), total: totalRes?.total ?? 0 };
  },

  async findById(id) {
    const row = await one(`SELECT ${LEAD_COLUMNS} FROM leads WHERE id = $1`, [id]);
    return mapLead(row);
  },

  async findByExternalId(externalId) {
    const row = await one(`SELECT ${LEAD_COLUMNS} FROM leads WHERE external_id = $1`, [externalId]);
    return mapLead(row);
  },

  async updateStatus(id, status) {
    const row = await one(
      `UPDATE leads SET status = $2, updated_at = now()
       WHERE id = $1
       RETURNING ${LEAD_COLUMNS}`,
      [id, status]
    );
    return mapLead(row);
  },

  /** Applies a fresh call analysis to the lead row. */
  async updateSummary(id, { summary, sentiment, sentimentScore, nextStep }) {
    const row = await one(
      `UPDATE leads
       SET ai_summary = $2, sentiment = $3, sentiment_score = $4, next_step = $5, updated_at = now()
       WHERE id = $1
       RETURNING ${LEAD_COLUMNS}`,
      [id, summary ?? '', sentiment, sentimentScore, nextStep]
    );
    return mapLead(row);
  },

  async markFollowupSent(id) {
    const row = await one(
      `UPDATE leads SET followup_sent = true, updated_at = now()
       WHERE id = $1
       RETURNING ${LEAD_COLUMNS}`,
      [id]
    );
    return mapLead(row);
  },

  async countByStatus() {
    const rows = await many(`SELECT status, count(*)::int AS count FROM leads GROUP BY status`);
    return rows.reduce((acc, r) => ({ ...acc, [r.status]: r.count }), {});
  },
};

export default LeadsRepository;

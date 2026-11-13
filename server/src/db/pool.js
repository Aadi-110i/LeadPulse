import pg from 'pg';
import env from '../config/env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

pool.on('error', (err) => {
  console.error('[db] idle client error:', err.message);
});

export function query(text, params) {
  return pool.query(text, params);
}

/** True when a trivial round-trip succeeds. Used by the health endpoint. */
export async function isDatabaseReady() {
  try {
    await pool.query('select 1');
    return true;
  } catch {
    return false;
  }
}

/** Wraps a single-row query. */
export async function one(text, params) {
  const { rows } = await pool.query(text, params);
  return rows[0] ?? null;
}

/** Wraps a multi-row query. */
export async function many(text, params) {
  const { rows } = await pool.query(text, params);
  return rows;
}

export async function closePool() {
  await pool.end();
}

export default { pool, query, one, many, isDatabaseReady, closePool };

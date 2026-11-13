import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool } from './pool.js';

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');

async function ensureMigrationsTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      name       text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `);
}

export async function runMigrations({ silent = false } = {}) {
  await ensureMigrationsTable();

  const { rows } = await pool.query('SELECT name FROM schema_migrations');
  const applied = new Set(rows.map((r) => r.name));

  const files = (await fs.readdir(migrationsDir)).filter((f) => f.endsWith('.sql')).sort();

  const pending = files.filter((f) => !applied.has(f));
  if (pending.length === 0) {
    if (!silent) console.log(`[migrate] up to date (${files.length} migration(s))`);
    return { applied: [], total: files.length };
  }

  for (const file of pending) {
    const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      if (!silent) console.log(`[migrate] applied ${file}`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw new Error(`Migration ${file} failed: ${err.message}`, { cause: err });
    } finally {
      client.release();
    }
  }

  return { applied: pending, total: files.length };
}

// Allow `node server/src/db/migrate.js` as a standalone entry point.
if (process.argv[1] && process.argv[1].endsWith('migrate.js')) {
  runMigrations()
    .then(({ applied }) => {
      console.log(`[migrate] done — ${applied.length} applied`);
      return pool.end();
    })
    .catch((err) => {
      console.error('[migrate] failed:', err.message);
      process.exit(1);
    });
}

export default runMigrations;

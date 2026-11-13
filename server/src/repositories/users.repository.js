import { one } from '../db/pool.js';

function mapUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    createdAt: row.created_at,
  };
}

export const UsersRepository = {
  async findByEmail(email) {
    const row = await one(
      `SELECT id, email, password_hash, name, role, created_at FROM users WHERE lower(email) = lower($1)`,
      [email]
    );
    return row ? { ...mapUser(row), passwordHash: row.password_hash } : null;
  },

  async findById(id) {
    const row = await one(
      `SELECT id, email, password_hash, name, role, created_at FROM users WHERE id = $1`,
      [id]
    );
    return row ? { ...mapUser(row), passwordHash: row.password_hash } : null;
  },

  async create({ email, passwordHash, name, role = 'owner' }) {
    const row = await one(
      `INSERT INTO users (email, password_hash, name, role)
       VALUES ($1,$2,$3,$4)
       RETURNING id, email, password_hash, name, role, created_at`,
      [email, passwordHash, name ?? email.split('@')[0], role]
    );
    return { ...mapUser(row), passwordHash: row.password_hash };
  },
};

export default UsersRepository;

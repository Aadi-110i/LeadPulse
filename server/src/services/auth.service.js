import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import env from '../config/env.js';
import { UsersRepository } from '../repositories/users.repository.js';
import { UnauthorizedError, ConflictError } from '../utils/errors.js';

export class AuthService {
  static async register({ email, password, name }) {
    const existing = await UsersRepository.findByEmail(email);
    if (existing) {
      throw new ConflictError('This account already exists.');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await UsersRepository.create({ email, passwordHash, name });

    return { user: AuthService.sanitizeUser(user), token: AuthService.generateToken(user) };
  }

  static async login({ email, password }) {
    const user = await UsersRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or access key.');
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or access key.');
    }

    return { user: AuthService.sanitizeUser(user), token: AuthService.generateToken(user) };
  }

  static async findById(id) {
    const user = await UsersRepository.findById(id);
    return user ? AuthService.sanitizeUser(user) : null;
  }

  static generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email, role: user.role }, env.jwtSecret, {
      expiresIn: env.jwtExpiresIn,
    });
  }

  /** Seconds until the token expires — the UI renders this as "Session Active". */
  static sessionTtl() {
    const match = /^(\d+)([smhd])$/.exec(env.jwtExpiresIn);
    if (!match) return 604800;
    const value = Number(match[1]);
    const unit = { s: 1, m: 60, h: 3600, d: 86400 }[match[2]];
    return value * unit;
  }

  static sanitizeUser(user) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
    };
  }
}

export default AuthService;

import jwt from 'jsonwebtoken';
import { UserModel } from '../models/user.model.js';
import { UnauthorizedError, ConflictError, ValidationError } from '../utils/errors.js';
import bcrypt from 'bcryptjs';

export class AuthService {
  static async register({ email, password, name }) {
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const user = await UserModel.create({ email, password, name });
    const token = this.generateToken(user);

    return { user: this.sanitizeUser(user), token };
  }

  static async login({ email, password }) {
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = this.generateToken(user);
    return { user: this.sanitizeUser(user), token };
  }

  static generateToken(user) {
    return jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'super-secret-nebula-key',
      { expiresIn: '7d' }
    );
  }

  static sanitizeUser(user) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}

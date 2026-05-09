import { AuthService } from '../services/auth.service.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { z } from 'zod';
import { ValidationError } from '../utils/errors.js';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export const login = asyncHandler(async (req, res) => {
  const validation = loginSchema.safeParse(req.body);
  if (!validation.success) {
    throw new ValidationError('Invalid input', validation.error.errors);
  }

  const result = await AuthService.login(req.body);
  res.json({
    status: 'success',
    data: result
  });
});

export const register = asyncHandler(async (req, res) => {
  const validation = registerSchema.safeParse(req.body);
  if (!validation.success) {
    throw new ValidationError('Invalid input', validation.error.errors);
  }

  const result = await AuthService.register(req.body);
  res.status(201).json({
    status: 'success',
    data: result
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    status: 'success',
    data: { user: req.user }
  });
});

import express from 'express';
import { z } from 'zod';
import { AuthService } from '../services/auth.service.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { ValidationError } from '../utils/errors.js';

const router = express.Router();

const credentials = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(6, 'Access key must be at least 6 characters.'),
});

const signup = credentials.extend({
  name: z.string().min(1).max(80).optional(),
});

router.post(
  '/signup',
  asyncHandler(async (req, res) => {
    const parsed = signup.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', parsed.error.issues.map((i) => i.message));
    }

    const result = await AuthService.register(parsed.data);
    res.status(201).json({ status: 'success', data: result });
  })
);

router.post(
  '/signin',
  asyncHandler(async (req, res) => {
    const parsed = credentials.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', parsed.error.issues.map((i) => i.message));
    }

    const result = await AuthService.login(parsed.data);
    res.json({ status: 'success', data: result });
  })
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await AuthService.findById(req.user.id);
    if (!user) {
      res.status(401).json({ status: 'error', message: 'Session no longer valid.' });
      return;
    }
    res.json({ status: 'success', data: { user, sessionTtl: AuthService.sessionTtl() } });
  })
);

/** Demo account metadata, so the sign-in page can offer a one-click demo. */
router.get('/demo', (req, res) => {
  res.json({
    status: 'success',
    data: { email: 'demo@leadpulse.dev', password: 'demo1234' },
  });
});

export default router;

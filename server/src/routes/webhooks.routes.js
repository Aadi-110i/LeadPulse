import express from 'express';
import { StatsRepository } from '../repositories/stats.repository.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

/** Webhook delivery log — the outbound side of the event system. */
router.get(
  '/events',
  asyncHandler(async (req, res) => {
    const { recentWebhooks } = await StatsRepository.observability();
    res.json({ status: 'success', data: recentWebhooks });
  })
);

export default router;

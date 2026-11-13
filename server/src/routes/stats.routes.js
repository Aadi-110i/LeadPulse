import express from 'express';
import { StatsRepository } from '../repositories/stats.repository.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = express.Router();
router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const overview = await StatsRepository.overview();
    const trend = await StatsRepository.callTrend(14);
    res.json({ status: 'success', data: { ...overview, trend } });
  })
);

router.get(
  '/activity',
  asyncHandler(async (req, res) => {
    const activity = await StatsRepository.recentActivity(
      Math.min(Number(req.query.limit) || 12, 50)
    );
    res.json({ status: 'success', data: activity });
  })
);

router.get(
  '/observability',
  asyncHandler(async (req, res) => {
    const observability = await StatsRepository.observability();
    res.json({ status: 'success', data: observability });
  })
);

export default router;

import express from 'express';
import { z } from 'zod';
import { LeadsRepository } from '../repositories/leads.repository.js';
import { CallsRepository } from '../repositories/calls.repository.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { isUuid } from '../utils/helpers.js';

const router = express.Router();
router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, q, sortBy, sortDir, limit, offset } = req.query;

    if (status && !['all', 'new', 'contacted', 'converted', 'lost'].includes(String(status))) {
      throw new ValidationError('Unknown status filter.');
    }

    const result = await LeadsRepository.list({
      status: status ? String(status) : 'all',
      q: q ? String(q) : '',
      sortBy: sortBy ? String(sortBy) : 'updatedAt',
      sortDir: sortDir ? String(sortDir) : 'desc',
      limit: Math.min(Number(limit) || 100, 500),
      offset: Number(offset) || 0,
    });

    res.json({ status: 'success', data: result.data, meta: { total: result.total } });
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    if (!isUuid(req.params.id)) throw new NotFoundError('Lead not found.');

    const lead = await LeadsRepository.findById(req.params.id);
    if (!lead) throw new NotFoundError('Lead not found.');

    const calls = await CallsRepository.list({ leadId: lead.id, limit: 20 });
    res.json({ status: 'success', data: { lead, calls } });
  })
);

router.patch(
  '/:id',
  asyncHandler(async (req, res) => {
    const parsed = z
      .object({ status: z.enum(['new', 'contacted', 'converted', 'lost']) })
      .safeParse(req.body);

    if (!parsed.success) {
      throw new ValidationError('Status must be new, contacted, converted or lost.');
    }

    if (!isUuid(req.params.id)) throw new NotFoundError('Lead not found.');

    const existing = await LeadsRepository.findById(req.params.id);
    if (!existing) throw new NotFoundError('Lead not found.');

    const lead = await LeadsRepository.updateStatus(existing.id, parsed.data.status);
    res.json({ status: 'success', data: lead });
  })
);

export default router;

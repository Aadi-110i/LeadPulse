import express from 'express';
import { z } from 'zod';
import { CallsRepository } from '../repositories/calls.repository.js';
import { LeadsRepository } from '../repositories/leads.repository.js';
import { summariseCall } from '../services/summary.service.js';
import { FollowupService } from '../services/followup.service.js';
import { enqueueFollowup } from '../services/queue/index.js';
import { asyncHandler } from '../middleware/error-handler.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { NotFoundError, ValidationError } from '../utils/errors.js';
import { isUuid } from '../utils/helpers.js';

const router = express.Router();
router.use(authenticate);

const callSchema = z.object({
  leadId: z.string().min(1).optional(),
  leadExternalId: z.string().min(1).optional(),
  durationSeconds: z.coerce.number().int().min(0).max(86_400).default(0),
  transcript: z.string().max(20_000).default(''),
  outcome: z.string().max(120).default(''),
});

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const calls = await CallsRepository.list({
      leadId: req.query.leadId ? String(req.query.leadId) : undefined,
      limit: Math.min(Number(req.query.limit) || 50, 200),
    });
    res.json({ status: 'success', data: calls });
  })
);

/**
 * Logs a call, summarises it, refreshes the lead, and queues the WhatsApp
 * follow-up. Returns the whole chain so the dashboard can update in one step.
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const parsed = callSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError('Invalid input', parsed.error.issues.map((i) => i.message));
    }

    const { leadId, leadExternalId, durationSeconds, transcript, outcome } = parsed.data;
    if (!leadId && !leadExternalId) {
      throw new ValidationError('A leadId or leadExternalId is required.');
    }
    if (leadId && !isUuid(leadId)) {
      throw new NotFoundError('Lead not found.');
    }

    const lead = leadId
      ? await LeadsRepository.findById(leadId)
      : await LeadsRepository.findByExternalId(leadExternalId);

    if (!lead) throw new NotFoundError('Lead not found.');

    const analysis = summariseCall({ transcript, outcome });

    const call = await CallsRepository.create({
      leadId: lead.id,
      durationSeconds,
      transcript,
      outcome: analysis.outcome,
      summary: analysis.summary,
      sentiment: analysis.sentiment,
      sentimentScore: analysis.sentimentScore,
      nextStep: analysis.nextStep,
    });

    const updatedLead = await LeadsRepository.updateSummary?.(lead.id, analysis) ?? lead;

    const job = await FollowupService.createJob({
      leadId: lead.id,
      channel: 'whatsapp',
      payload: {
        to: lead.phone,
        template: 'follow_up',
        summary: analysis.summary,
        nextStep: analysis.nextStep,
      },
    });

    const queued = await enqueueFollowup({ jobId: job.id });

    res.status(202).json({
      status: 'success',
      data: { call, lead: updatedLead, job, queue: queued.driver },
    });
  })
);

export default router;

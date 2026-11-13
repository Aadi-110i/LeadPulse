import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

const QUEUE_NAME = 'leadpulse-followups';

/** Redis-backed queue. Real BullMQ, real retries, real dead-letter handling. */
export class BullMqQueue {
  constructor({ url, handler }) {
    this.name = 'bullmq';
    this.handler = handler;

    this.connection = new IORedis(url, {
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
    });

    this.queue = new Queue(QUEUE_NAME, { connection: this.connection });

    this.worker = new Worker(
      QUEUE_NAME,
      async (job) => this.handler(job.data),
      { connection: this.connection, concurrency: 4 }
    );

    this.worker.on('failed', (job, err) => {
      console.error(`[queue] job ${job?.id ?? 'unknown'} failed: ${err?.message}`);
    });

    this.worker.on('error', (err) => {
      console.error('[queue] worker error:', err.message);
    });
  }

  async enqueue(data, { attempts = 3 } = {}) {
    const job = await this.queue.add('followup', data, {
      attempts,
      backoff: { type: 'exponential', delay: 1500 },
      removeOnComplete: 200,
      removeOnFail: 200,
    });
    return { id: job.id, driver: this.name };
  }

  async stats() {
    const counts = await this.queue.getJobCounts('waiting', 'active', 'completed', 'failed');
    return {
      driver: this.name,
      pending: (counts.waiting ?? 0) + (counts.active ?? 0),
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
    };
  }

  async close() {
    await this.worker.close();
    await this.queue.close();
    await this.connection.quit();
  }
}

export default BullMqQueue;

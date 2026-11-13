import path from 'node:path';
import { fileURLToPath } from 'node:url';
import IORedis from 'ioredis';
import env from '../../config/env.js';
import { BullMqQueue } from './bullmq.driver.js';
import { FileQueue } from './file.driver.js';
import { FollowupService } from '../followup.service.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const fallbackFile = path.resolve(here, '../../../.data/queue.json');

/** The queue instance the running API talks to. */
let activeQueue = null;

export function setActiveQueue(queue) {
  activeQueue = queue;
}

export function getActiveQueue() {
  return activeQueue;
}

/** Hands a follow-up job to whichever driver is live. */
export async function enqueueFollowup({ jobId }) {
  if (!activeQueue) {
    console.warn('[queue] no driver active — job left queued in the database');
    return { id: null, driver: 'none' };
  }
  return activeQueue.enqueue({ jobId });
}

async function redisReachable(url) {
  const client = new IORedis(url, {
    lazyConnect: true,
    connectTimeout: 2500,
    maxRetriesPerRequest: 1,
    retryStrategy: () => null,
  });

  try {
    await client.connect();
    const pong = await client.ping();
    return pong === 'PONG';
  } catch {
    return false;
  } finally {
    client.disconnect();
  }
}

/** The job handler is identical for both drivers — only the scheduling differs. */
async function handleJob(data) {
  const result = await FollowupService.processJob(data.jobId);

  if (result.status === 'retry') {
    const error = new Error(result.error);
    error.retryable = true;
    throw error;
  }

  return result;
}

/**
 * Picks the queue driver at boot.
 * Redis + BullMQ when Redis answers; the file-backed driver otherwise.
 */
export async function createQueue() {
  if (await redisReachable(env.redisUrl)) {
    const queue = new BullMqQueue({ url: env.redisUrl, handler: handleJob });
    console.log('[queue] driver=bullmq (redis)');
    return queue;
  }

  console.warn('[queue] redis unreachable — driver=file');
  const queue = new FileQueue({ filePath: fallbackFile, handler: handleJob });
  await queue.init();
  queue.start();
  return queue;
}

export default createQueue;

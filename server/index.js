import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

import env from './src/config/env.js';
import { isDatabaseReady } from './src/db/pool.js';
import { runMigrations } from './src/db/migrate.js';
import { createQueue, setActiveQueue } from './src/services/queue/index.js';
import { errorHandler } from './src/middleware/error-handler.js';

import authRoutes from './src/routes/auth.routes.js';
import leadsRoutes from './src/routes/leads.routes.js';
import callsRoutes from './src/routes/calls.routes.js';
import statsRoutes from './src/routes/stats.routes.js';
import webhooksRoutes from './src/routes/webhooks.routes.js';

const app = express();

app.set('trust proxy', 1);
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '1mb' }));

app.use(
  '/api/auth',
  rateLimit({ windowMs: 60_000, limit: 60, standardHeaders: 'draft-7', legacyHeaders: false })
);

let queue = null;

app.use('/api/auth', authRoutes);
app.use('/api/leads', leadsRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/webhooks', webhooksRoutes);

app.get('/api/health', async (req, res) => {
  const database = await isDatabaseReady();
  let queueState = { driver: 'uninitialised', pending: 0 };
  try {
    queueState = await queue.stats();
  } catch {
    /* queue not ready — reported as such */
  }

  const ok = database;
  res.status(ok ? 200 : 503).json({
    status: ok ? 'healthy' : 'degraded',
    services: {
      database: database ? 'up' : 'down',
      queue: queueState.driver,
    },
    queue: queueState,
    timestamp: new Date().toISOString(),
  });
});

app.use(errorHandler);

async function boot() {
  try {
    await runMigrations();
  } catch (err) {
    console.error('[boot] migrations failed:', err.message);
    console.error('[boot] the API will start in degraded mode');
  }

  try {
    queue = await createQueue();
    setActiveQueue(queue);
  } catch (err) {
    console.error('[boot] queue failed to start:', err.message);
  }

  app.listen(env.port, () => {
    console.log(`LeadPulse API listening on http://localhost:${env.port}`);
  });
}

boot();

export default app;

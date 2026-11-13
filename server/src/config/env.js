import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../.env') });

const isProd = process.env.NODE_ENV === 'production';

function required(name, fallback) {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  isProd,
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',

  databaseUrl: required('DATABASE_URL', 'postgres://leadpulse:leadpulse@127.0.0.1:5433/leadpulse'),
  redisUrl: process.env.REDIS_URL ?? 'redis://127.0.0.1:6379',

  jwtSecret: required('JWT_SECRET', 'leadpulse_dev_secret_change_me_in_production'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',

  followupDelaySeconds: Number(process.env.FOLLOWUP_DELAY_SECONDS ?? 5),
  whatsappSender: process.env.WHATSAPP_SENDER ?? '+14155550100',
};

export default env;

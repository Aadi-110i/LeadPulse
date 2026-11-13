-- LeadPulse schema
-- Every statement is idempotent so the migration runner can be re-run safely.

CREATE TABLE IF NOT EXISTS users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         text NOT NULL,
  password_hash text NOT NULL,
  name          text NOT NULL DEFAULT '',
  role          text NOT NULL DEFAULT 'owner' CHECK (role IN ('owner', 'agent', 'admin')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_email_lower_key ON users (lower(email));

CREATE TABLE IF NOT EXISTS leads (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id    text NOT NULL UNIQUE,
  name           text NOT NULL,
  company        text NOT NULL DEFAULT '',
  phone          text NOT NULL DEFAULT '',
  email          text NOT NULL DEFAULT '',
  status         text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'converted', 'lost')),
  ai_summary     text NOT NULL DEFAULT '',
  sentiment      text NOT NULL DEFAULT 'neutral' CHECK (sentiment IN ('positive', 'neutral', 'negative')),
  sentiment_score real NOT NULL DEFAULT 0.5,
  followup_sent  boolean NOT NULL DEFAULT false,
  next_step      text NOT NULL DEFAULT '',
  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS leads_status_idx ON leads (status);
CREATE INDEX IF NOT EXISTS leads_created_at_idx ON leads (created_at DESC);

CREATE TABLE IF NOT EXISTS calls (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id           uuid NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
  duration_seconds  integer NOT NULL DEFAULT 0,
  transcript        text NOT NULL DEFAULT '',
  outcome           text NOT NULL DEFAULT 'unknown',
  summary           text NOT NULL DEFAULT '',
  sentiment         text NOT NULL DEFAULT 'neutral',
  sentiment_score   real NOT NULL DEFAULT 0.5,
  next_step         text NOT NULL DEFAULT '',
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS calls_lead_id_idx ON calls (lead_id);
CREATE INDEX IF NOT EXISTS calls_created_at_idx ON calls (created_at DESC);

CREATE TABLE IF NOT EXISTS followup_jobs (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id      uuid NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
  channel      text NOT NULL DEFAULT 'whatsapp',
  status       text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'sent', 'failed', 'dead_letter')),
  attempts     integer NOT NULL DEFAULT 0,
  error        text NOT NULL DEFAULT '',
  payload      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS followup_jobs_lead_id_idx ON followup_jobs (lead_id);
CREATE INDEX IF NOT EXISTS followup_jobs_status_idx ON followup_jobs (status);

CREATE TABLE IF NOT EXISTS api_keys (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  label       text NOT NULL DEFAULT '',
  prefix      text NOT NULL,
  hashed_key  text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS api_keys_user_id_idx ON api_keys (user_id);

-- Webhook delivery log — the observable side of outbound events.
CREATE TABLE IF NOT EXISTS webhook_events (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type   text NOT NULL,
  target_url   text NOT NULL DEFAULT '',
  status       text NOT NULL DEFAULT 'delivered' CHECK (status IN ('delivered', 'failed', 'pending')),
  status_code  integer NOT NULL DEFAULT 200,
  payload      jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS webhook_events_created_at_idx ON webhook_events (created_at DESC);

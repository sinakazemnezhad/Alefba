-- Alefbâ G3 · D1 schema (Gate 3 instruct MVP + API alpha)
-- Apply: wrangler d1 execute alefba-g3 --remote --file=./schema.sql
-- Local:  wrangler d1 execute alefba-g3 --local  --file=./schema.sql

PRAGMA foreign_keys = ON;

-- Founding interest (replaces interest.jsonl on PERSIST_DIR)
CREATE TABLE IF NOT EXISTS interest_leads (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  lane          TEXT NOT NULL CHECK (lane IN ('invest', 'participate', 'donate')),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  role          TEXT,
  amount        TEXT,
  note          TEXT,
  tier          TEXT,
  lang          TEXT,
  ref           TEXT,
  show_on_wall  INTEGER NOT NULL DEFAULT 1 CHECK (show_on_wall IN (0, 1)),
  is_test       INTEGER NOT NULL DEFAULT 0 CHECK (is_test IN (0, 1)),
  source_ip     TEXT,
  user_agent    TEXT
);

CREATE INDEX IF NOT EXISTS idx_interest_leads_created ON interest_leads (created_at);
CREATE INDEX IF NOT EXISTS idx_interest_leads_lane ON interest_leads (lane);
CREATE INDEX IF NOT EXISTS idx_interest_leads_email ON interest_leads (email);

-- Instruct API waitlist (replaces api-waitlist.jsonl)
CREATE TABLE IF NOT EXISTS api_waitlist (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  name          TEXT,
  email         TEXT NOT NULL,
  use_case      TEXT,
  lang          TEXT,
  partner_tier  TEXT DEFAULT 'waitlist',
  status        TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'invited', 'active', 'rejected'))
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_api_waitlist_email ON api_waitlist (email);

-- G3 design partners (gate: 3 active partners)
CREATE TABLE IF NOT EXISTS design_partners (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  org_name      TEXT NOT NULL,
  contact_name  TEXT,
  contact_email TEXT NOT NULL,
  vertical      TEXT,
  status        TEXT NOT NULL DEFAULT 'prospect'
    CHECK (status IN ('prospect', 'active', 'paused', 'churned')),
  notes         TEXT
);

CREATE INDEX IF NOT EXISTS idx_design_partners_status ON design_partners (status);

-- API keys (Settings-only surface — never hero)
CREATE TABLE IF NOT EXISTS api_keys (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  partner_id    INTEGER REFERENCES design_partners (id),
  key_prefix    TEXT NOT NULL,
  key_hash      TEXT NOT NULL,
  label         TEXT,
  scopes        TEXT NOT NULL DEFAULT 'chat:alpha',
  revoked_at    TEXT,
  last_used_at  TEXT
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys (key_prefix);

-- Usage metering (G3+ receipts for commercial gate)
CREATE TABLE IF NOT EXISTS api_usage (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  key_id        INTEGER REFERENCES api_keys (id),
  route         TEXT NOT NULL,
  model         TEXT,
  input_tokens  INTEGER,
  output_tokens INTEGER,
  latency_ms    INTEGER,
  status        TEXT NOT NULL DEFAULT 'ok'
);

CREATE INDEX IF NOT EXISTS idx_api_usage_created ON api_usage (created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_key ON api_usage (key_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- Advanced Security Suite — Supabase SQL Migration
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────────────────────────────────
-- 1. THREAT EVENTS TABLE
--    Stores all security events: bot detections, anomalies, honeypot hits
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS threat_events (
  id            BIGSERIAL PRIMARY KEY,
  event_type    TEXT        NOT NULL,
  severity      TEXT        NOT NULL DEFAULT 'medium',
  context       JSONB       DEFAULT '{}',
  session_id    TEXT,
  client_hint   TEXT,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_threat_events_type       ON threat_events (event_type);
CREATE INDEX IF NOT EXISTS idx_threat_events_severity   ON threat_events (severity);
CREATE INDEX IF NOT EXISTS idx_threat_events_created_at ON threat_events (created_at DESC);

ALTER TABLE threat_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read threat_events" ON threat_events;
CREATE POLICY "Authenticated can read threat_events"
  ON threat_events FOR SELECT
  USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Anyone can insert threat_events" ON threat_events;
CREATE POLICY "Anyone can insert threat_events"
  ON threat_events FOR INSERT
  WITH CHECK (true);

-- ─────────────────────────────────────────────────────────────────────────
-- 2. CANARY TOKENS TABLE
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS canary_tokens (
  id                    BIGSERIAL PRIMARY KEY,
  token_id              TEXT        NOT NULL UNIQUE,
  triggered             BOOLEAN     NOT NULL DEFAULT false,
  triggered_at          TIMESTAMPTZ,
  attempts_at_creation  INTEGER     DEFAULT 0,
  ip_hint               TEXT,
  expires_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE canary_tokens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can read canary_tokens" ON canary_tokens;
CREATE POLICY "Authenticated can read canary_tokens"
  ON canary_tokens FOR SELECT
  USING (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────────────────
-- 3. RATE LIMITS TABLE (Server-Side, per-IP hash)
-- ─────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rate_limits (
  id            BIGSERIAL PRIMARY KEY,
  ip_hash       TEXT        NOT NULL,
  endpoint      TEXT        NOT NULL,
  window_start  TIMESTAMPTZ NOT NULL,
  request_count INTEGER     NOT NULL DEFAULT 1,
  blocked       BOOLEAN     NOT NULL DEFAULT false,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(ip_hash, endpoint, window_start)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_ip_endpoint ON rate_limits (ip_hash, endpoint);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window ON rate_limits (window_start);

ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────────────────────────────────
-- 4. ENHANCE admin_audit_logs TABLE
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE admin_audit_logs
  ADD COLUMN IF NOT EXISTS before_snapshot  JSONB,
  ADD COLUMN IF NOT EXISTS after_snapshot   JSONB,
  ADD COLUMN IF NOT EXISTS session_id       TEXT,
  ADD COLUMN IF NOT EXISTS client_hint      TEXT,
  ADD COLUMN IF NOT EXISTS user_agent       TEXT;

ALTER TABLE admin_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can insert audit logs" ON admin_audit_logs;
CREATE POLICY "Authenticated can insert audit logs"
  ON admin_audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated can read audit logs" ON admin_audit_logs;
CREATE POLICY "Authenticated can read audit logs"
  ON admin_audit_logs FOR SELECT
  USING (auth.role() = 'authenticated');

-- ─────────────────────────────────────────────────────────────────────────
-- 5. ENHANCE site_settings TABLE
-- ─────────────────────────────────────────────────────────────────────────
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS last_admin_login        TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deadman_threshold_days  INTEGER DEFAULT 30,
  ADD COLUMN IF NOT EXISTS security_mode           TEXT DEFAULT 'standard';

-- ─────────────────────────────────────────────────────────────────────────
-- 6. AUTO-UPDATE last_admin_login ON SUCCESSFUL LOGIN
-- ─────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_last_admin_login()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.action = 'ADMIN_LOGIN_SUCCESS' THEN
    UPDATE site_settings SET last_admin_login = NOW() WHERE id = 1;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_update_last_admin_login ON admin_audit_logs;
CREATE TRIGGER trg_update_last_admin_login
  AFTER INSERT ON admin_audit_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_last_admin_login();

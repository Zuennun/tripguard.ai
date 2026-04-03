-- ============================================================
-- SaveMyHoliday – Schema Migration v3
-- Accountless MVP. Migration-safe for existing Supabase project.
-- bookings table already exists — extend safely with ALTER TABLE.
-- New tables are created with IF NOT EXISTS.
-- ============================================================


-- ────────────────────────────────────────────────────────────
-- 1. BOOKINGS (existing table — ALTER only)
-- ────────────────────────────────────────────────────────────

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS locale               TEXT         NOT NULL DEFAULT 'de',
  ADD COLUMN IF NOT EXISTS booking_com_url      TEXT,
  ADD COLUMN IF NOT EXISTS lowest_found_price   NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS last_checked_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_alert_sent_at   TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS alert_count          SMALLINT     NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS confirmed_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paused_at            TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS cancelled_at         TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS free_cancel_deadline DATE,
  ADD COLUMN IF NOT EXISTS updated_at           TIMESTAMPTZ  NOT NULL DEFAULT now();

-- status and created_at likely already exist, so only add if missing.
-- If status column does not exist yet, uncomment the next line:
-- ALTER TABLE bookings ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';

-- ── Status constraint
-- Added with NOT VALID so existing rows are not scanned immediately.
-- VALIDATE CONSTRAINT below runs a full table scan — safe but may lock briefly on large tables.
-- On a small MVP table this is fine to run immediately.
DO $$ BEGIN
  ALTER TABLE bookings
    ADD CONSTRAINT bookings_status_valid
    CHECK (status IN ('pending','active','paused','expired','cancelled','deleted'))
    NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
ALTER TABLE bookings VALIDATE CONSTRAINT bookings_status_valid;

-- ── Locale constraint
DO $$ BEGIN
  ALTER TABLE bookings
    ADD CONSTRAINT bookings_locale_valid
    CHECK (locale IN ('de','en'))
    NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
ALTER TABLE bookings VALIDATE CONSTRAINT bookings_locale_valid;

-- ── Currency constraint (only add if not already present)
DO $$ BEGIN
  ALTER TABLE bookings
    ADD CONSTRAINT bookings_currency_valid
    CHECK (currency IN ('EUR','USD','GBP','CHF','JPY','AUD','CAD','SEK','NOK','DKK','AED'))
    NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
ALTER TABLE bookings VALIDATE CONSTRAINT bookings_currency_valid;

-- ── Date integrity: checkout must be after checkin when both are present.
-- NULL is allowed for MVP (some users may not know exact dates yet),
-- but if both are provided the relationship must hold at DB level.
DO $$ BEGIN
  ALTER TABLE bookings
    ADD CONSTRAINT bookings_dates_valid
    CHECK (
      checkin_date  IS NULL OR
      checkout_date IS NULL OR
      checkout_date > checkin_date
    )
    NOT VALID;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
ALTER TABLE bookings VALIDATE CONSTRAINT bookings_dates_valid;

-- ── Partial index for cron: only active bookings with future checkouts.
-- This is the only index the daily cron query hits.
CREATE INDEX IF NOT EXISTS idx_bookings_active_checkout
  ON bookings(checkout_date)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_bookings_email
  ON bookings(email);

-- ── Auto-update updated_at trigger
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS bookings_set_updated_at ON bookings;
CREATE TRIGGER bookings_set_updated_at
  BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();


-- ────────────────────────────────────────────────────────────
-- 2. BOOKING TOKENS (new table)
--
-- Two purposes with different lifecycle rules:
--
--   confirm  → single-use, expires in 72 hours
--              valid when: expires_at > now() AND revoked_at IS NULL AND used_at IS NULL
--
--   manage   → reusable, long-lived (set to 1 year by application)
--              valid when: expires_at > now() AND revoked_at IS NULL
--              use_count + last_used_at are informational only
--
-- Application rules:
--   - Generate both tokens at booking creation time
--   - On confirm: mark used_at = now(), then activate booking
--   - On manage: increment use_count + set last_used_at on every access
--   - On "resend link": revoke old manage token, insert new one
--   - Never reuse a consumed confirm token
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS booking_tokens (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id   UUID        NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  token        TEXT        NOT NULL UNIQUE,
  purpose      TEXT        NOT NULL CHECK (purpose IN ('confirm', 'manage')),

  -- Expiry is mandatory — no eternal tokens.
  -- Application sets: confirm = now() + interval '72 hours'
  --                   manage  = now() + interval '1 year'
  expires_at   TIMESTAMPTZ NOT NULL,

  -- confirm tokens: set on first use, then invalid
  used_at      TIMESTAMPTZ,

  -- manage tokens: informational access tracking
  use_count    INT         NOT NULL DEFAULT 0 CHECK (use_count >= 0),
  last_used_at TIMESTAMPTZ,

  -- Revocation: set when user requests a new manage link or booking is deleted
  revoked_at   TIMESTAMPTZ,

  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_booking_tokens_token
  ON booking_tokens(token);

CREATE INDEX IF NOT EXISTS idx_booking_tokens_booking_purpose
  ON booking_tokens(booking_id, purpose);


-- ────────────────────────────────────────────────────────────
-- 3. PRICE CHECKS (new table)
-- One row per scraping attempt per booking.
-- Must be usable for debugging scraper issues and auditing results.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS price_checks (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id     UUID          NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  checked_at     TIMESTAMPTZ   NOT NULL DEFAULT now(),

  -- What we queried
  provider       TEXT,                      -- e.g. 'booking.com'
  checked_url    TEXT,                      -- URL sent to scraper

  -- Result
  found          BOOLEAN       NOT NULL DEFAULT false,
  price          NUMERIC(10,2),
  currency       TEXT,
  result_url     TEXT,                      -- URL of the found offer

  -- Comparison snapshot (booking.price at time of check — may drift over time)
  original_price NUMERIC(10,2),
  delta          NUMERIC(10,2),             -- price - original_price; negative = cheaper

  -- Diagnostics
  http_status    SMALLINT,
  duration_ms    INT CHECK (duration_ms >= 0),
  error          TEXT          CHECK (char_length(error) <= 1000)
);

CREATE INDEX IF NOT EXISTS idx_price_checks_booking_id
  ON price_checks(booking_id, checked_at DESC);


-- ────────────────────────────────────────────────────────────
-- 4. ALERTS (new table)
-- One row per alert email sent.
--
-- Deduplication rules (enforced at DB level):
--   UNIQUE (booking_id, new_price) — same booking, same price → blocked by DB.
--   Application also checks: last_alert_sent_at on bookings before inserting.
--
-- Anti-spam rules (enforced by application, not DB):
--   - minimum savings threshold (e.g. €5)
--   - minimum gap between alerts (e.g. 24h) using bookings.last_alert_sent_at
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
  id             UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id     UUID          NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  price_check_id UUID          REFERENCES price_checks(id) ON DELETE SET NULL,

  -- What triggered the alert
  new_price      NUMERIC(10,2) NOT NULL CHECK (new_price >= 0),
  old_price      NUMERIC(10,2) NOT NULL CHECK (old_price >= 0),
  savings        NUMERIC(10,2) GENERATED ALWAYS AS (old_price - new_price) STORED,
  currency       TEXT          NOT NULL,
  provider       TEXT,                      -- where cheaper price was found
  result_url     TEXT,                      -- direct link to the offer

  -- Dedup: same booking + same new price = duplicate alert, DB rejects it
  UNIQUE (booking_id, new_price),

  -- Delivery
  sent_at        TIMESTAMPTZ   NOT NULL DEFAULT now(),
  email_id       TEXT                       -- Resend message ID for delivery audit
);

CREATE INDEX IF NOT EXISTS idx_alerts_booking_id
  ON alerts(booking_id, sent_at DESC);


-- ────────────────────────────────────────────────────────────
-- 5. PAGE VISITS (new table)
-- Privacy-first founder analytics: path, country, referrer host, device type.
-- No raw IP addresses are stored.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS page_visits (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  path           TEXT        NOT NULL,
  page_title     TEXT,
  referrer_host  TEXT,
  origin_country TEXT,
  locale         TEXT,
  device_type    TEXT        CHECK (device_type IN ('desktop','mobile','tablet')),
  user_agent     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_visits_created_at
  ON page_visits(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_page_visits_path
  ON page_visits(path);

CREATE INDEX IF NOT EXISTS idx_page_visits_country
  ON page_visits(origin_country);


-- ────────────────────────────────────────────────────────────
-- 6. AFFILIATE CLICKS (new table)
-- One token per alert email. Token used in /go/[token] redirect.
-- Tracks whether the user actually clicked to rebook.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  token       TEXT        NOT NULL UNIQUE,  -- used in /go/[token]

  -- Attribution
  booking_id  UUID        REFERENCES bookings(id) ON DELETE SET NULL,
  alert_id    UUID        REFERENCES alerts(id)   ON DELETE SET NULL,

  -- Destination
  destination TEXT        NOT NULL,
  provider    TEXT,                          -- e.g. 'booking.com'

  -- Click tracking (first click only sets clicked_at)
  clicked_at  TIMESTAMPTZ,
  click_count SMALLINT    NOT NULL DEFAULT 0 CHECK (click_count >= 0),

  -- Optional flexible metadata: UTM params, user-agent, etc.
  -- Avoids future schema migrations for analytics fields.
  metadata    JSONB,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_token
  ON affiliate_clicks(token);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_alert_id
  ON affiliate_clicks(alert_id);


-- ────────────────────────────────────────────────────────────
-- 6. JOB RUNS (new table)
-- Lightweight cron observability. One row per execution.
-- Insert at job start (status='running'), update at end.
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS job_runs (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  job              TEXT        NOT NULL,    -- e.g. 'check-prices'
  started_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at      TIMESTAMPTZ,
  status           TEXT        CHECK (status IN ('running', 'success', 'error')),
  bookings_checked INT,
  alerts_sent      INT,
  error            TEXT        CHECK (char_length(error) <= 2000),

  -- Duration in ms. Computed only when finished_at is set.
  -- EXTRACT(EPOCH) returns fractional seconds as FLOAT8; multiply first,
  -- then round and cast — avoids integer truncation before the multiply.
  duration_ms INT GENERATED ALWAYS AS (
    CASE
      WHEN finished_at IS NOT NULL
      THEN ROUND(EXTRACT(EPOCH FROM (finished_at - started_at)) * 1000)::INT
      ELSE NULL
    END
  ) STORED
);

CREATE INDEX IF NOT EXISTS idx_job_runs_job
  ON job_runs(job, started_at DESC);

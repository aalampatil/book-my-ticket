-- ─────────────────────────────────────────────────────────────
-- ChaiCode Cinema — Database Setup
-- Run once to initialise or migrate your schema.
-- ─────────────────────────────────────────────────────────────
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- Seats table (64 seats, 8 rows × 8 cols)
CREATE TABLE IF NOT EXISTS seats (
  id SERIAL PRIMARY KEY,
  isbooked SMALLINT NOT NULL DEFAULT 0,
  name VARCHAR(100),
  -- name of person who booked
  booked_by VARCHAR(255),
  -- email of authenticated user who booked
  booked_at TIMESTAMPTZ -- when the seat was booked
);
-- Add booked_by / booked_at columns to existing seats table (safe migration)
DO $$ BEGIN IF NOT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_name = 'seats'
    AND column_name = 'booked_by'
) THEN
ALTER TABLE seats
ADD COLUMN booked_by VARCHAR(255);
ALTER TABLE seats
ADD COLUMN booked_at TIMESTAMPTZ;
END IF;
END $$;
-- Seed 64 seats if the table is empty
INSERT INTO seats (isbooked)
SELECT 0
FROM generate_series(1, 64)
WHERE NOT EXISTS (
    SELECT 1
    FROM seats
    LIMIT 1
  );
-- Update booked_at automatically when a seat is booked
CREATE OR REPLACE FUNCTION set_booked_at() RETURNS TRIGGER AS $$ BEGIN IF NEW.isbooked = 1
  AND OLD.isbooked = 0 THEN NEW.booked_at = NOW();
END IF;
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS trg_booked_at ON seats;
CREATE TRIGGER trg_booked_at BEFORE
UPDATE ON seats FOR EACH ROW EXECUTE FUNCTION set_booked_at();
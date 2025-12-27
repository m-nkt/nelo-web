-- Migration: Add new fields to users table for hybrid chat flow
-- Run this migration if you already have a users table

-- Add new columns if they don't exist
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS daily_chat_count INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS state VARCHAR(50) DEFAULT 'new',
  ADD COLUMN IF NOT EXISTS goal TEXT,
  ADD COLUMN IF NOT EXISTS blacklist_score INTEGER DEFAULT 0;

-- Update existing records: set points = points_balance if points is 0
UPDATE users SET points = points_balance WHERE points = 0 OR points IS NULL;

-- Update existing records: set state = 'registered' if they have language_learning
UPDATE users SET state = 'registered' WHERE language_learning IS NOT NULL AND state = 'new';

-- Create index for state column (for faster queries)
CREATE INDEX IF NOT EXISTS idx_users_state ON users(state);

-- Create index for daily_chat_count (for rate limiting)
CREATE INDEX IF NOT EXISTS idx_users_daily_chat ON users(phone_number, updated_at);


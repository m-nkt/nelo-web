-- Migration: Add deep profile fields for Phase 1 registration
-- Run this migration if you already have a users table

-- Add new columns if they don't exist
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS job_title VARCHAR(100),
  ADD COLUMN IF NOT EXISTS matching_goal TEXT;

-- Create index for interests (for faster queries)
CREATE INDEX IF NOT EXISTS idx_users_interests ON users USING GIN (interests);

-- Update existing users to have empty interests array if null
UPDATE users 
SET interests = '[]'::jsonb 
WHERE interests IS NULL;


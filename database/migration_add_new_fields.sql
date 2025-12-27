-- Migration: Add new fields for refined registration flow
-- Run this migration if you already have a users table

-- Add new columns if they don't exist
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS target_language VARCHAR(50),
  ADD COLUMN IF NOT EXISTS native_language VARCHAR(50),
  ADD COLUMN IF NOT EXISTS user_level VARCHAR(50),
  ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}'::jsonb;

-- Migrate existing data (if any)
UPDATE users 
SET 
  target_language = language_learning,
  native_language = language_teaching,
  user_level = level,
  preferences = jsonb_build_object(
    'gender', gender,
    'age', age_range
  )
WHERE target_language IS NULL AND language_learning IS NOT NULL;

-- Create index for preferences (for faster queries)
CREATE INDEX IF NOT EXISTS idx_users_preferences ON users USING GIN (preferences);

-- Create index for target_language (for matching)
CREATE INDEX IF NOT EXISTS idx_users_target_language ON users(target_language);


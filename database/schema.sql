-- Database schema for Language Matching Service

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  language_learning VARCHAR(50), -- Deprecated, use target_language
  language_teaching VARCHAR(50), -- Deprecated, use native_language
  level VARCHAR(50), -- Deprecated, use user_level
  target_language VARCHAR(50), -- Language user wants to practice/talk in
  native_language VARCHAR(50), -- User's native language
  user_level VARCHAR(50), -- Beginner, Intermediate, Advanced, Native
  interests JSONB DEFAULT '[]'::jsonb, -- Array of hobbies/interests
  job_title VARCHAR(100), -- User's job title or profession
  matching_goal TEXT, -- Why they're here (business, travel, casual, etc.)
  preferences JSONB, -- User preferences (gender, age, business-focused, native speakers, etc.)
  preferred_time TEXT,
  gender VARCHAR(20),
  age_range VARCHAR(20),
  video_call_ok BOOLEAN DEFAULT false,
  points_balance INTEGER DEFAULT 0,
  points INTEGER DEFAULT 0, -- Alias for points_balance (仕様メモ対応)
  daily_chat_count INTEGER DEFAULT 0, -- 1日のAI利用回数
  state VARCHAR(50) DEFAULT 'new', -- ユーザーの状態: new, registration, profile_extraction, registered
  goal TEXT, -- 学習目的（Geminiで抽出）
  blacklist_score INTEGER DEFAULT 0, -- ブラックリストスコア（ドタキャン等で増加）
  trust_score INTEGER DEFAULT 100,
  calendar_access_token TEXT,
  calendar_refresh_token TEXT,
  calendar_id VARCHAR(255),
  calendar_expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- User states table (for registration flow)
CREATE TABLE IF NOT EXISTS user_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  state JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_phone VARCHAR(20) NOT NULL,
  user2_phone VARCHAR(20) NOT NULL,
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 15,
  google_meet_link TEXT,
  points_used INTEGER DEFAULT 100,
  status VARCHAR(20) DEFAULT 'pending',
  cancelled_by VARCHAR(20),
  cancellation_reason TEXT,
  confirmation_received BOOLEAN DEFAULT false, -- 24時間前の確認フラグ
  reminder_24h_sent BOOLEAN DEFAULT false, -- 24時間前リマインド送信済み
  reminder_1h_sent BOOLEAN DEFAULT false, -- 1時間前リマインド送信済み
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user1_phone) REFERENCES users(phone_number),
  FOREIGN KEY (user2_phone) REFERENCES users(phone_number)
);

-- Point transactions table
CREATE TABLE IF NOT EXISTS point_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_phone VARCHAR(20) NOT NULL,
  amount INTEGER NOT NULL,
  transaction_type VARCHAR(50) NOT NULL,
  appointment_id UUID,
  stripe_payment_intent_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (user_phone) REFERENCES users(phone_number),
  FOREIGN KEY (appointment_id) REFERENCES appointments(id)
);

-- Message logs table (for rate limiting)
CREATE TABLE IF NOT EXISTS message_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) NOT NULL,
  message_text TEXT,
  ai_used BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (phone_number) REFERENCES users(phone_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone_number);
CREATE INDEX IF NOT EXISTS idx_users_languages ON users(language_learning, language_teaching);
CREATE INDEX IF NOT EXISTS idx_appointments_users ON appointments(user1_phone, user2_phone);
CREATE INDEX IF NOT EXISTS idx_appointments_scheduled ON appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_point_transactions_user ON point_transactions(user_phone);
CREATE INDEX IF NOT EXISTS idx_message_logs_phone_date ON message_logs(phone_number, created_at);


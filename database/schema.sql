-- AthletiX Database Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  age INTEGER,
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
  district TEXT,
  sport TEXT,
  photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Test attempts table
CREATE TABLE IF NOT EXISTS test_attempts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  test_type TEXT NOT NULL CHECK (test_type IN (
    'verticalJump', 'sitUps', 'pushUps', 'pullUps', 
    'shuttleRun', 'enduranceRun', 'flexibilityTest', 
    'agilityLadder', 'heightWeight'
  )),
  video_url TEXT,
  analysis_result JSONB,
  metrics JSONB NOT NULL DEFAULT '{}',
  form_score INTEGER DEFAULT 0 CHECK (form_score >= 0 AND form_score <= 100),
  badge TEXT DEFAULT 'Good',
  recommendations TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EMG readings table
CREATE TABLE IF NOT EXISTS emg_readings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  test_attempt_id UUID REFERENCES test_attempts(id) ON DELETE CASCADE,
  emg_value INTEGER NOT NULL,
  muscle_activity FLOAT NOT NULL,
  fatigue_level FLOAT NOT NULL,
  activation_detected BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_test_attempts_test_type ON test_attempts(test_type);
CREATE INDEX IF NOT EXISTS idx_test_attempts_created_at ON test_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_emg_readings_user_id ON emg_readings(user_id);
CREATE INDEX IF NOT EXISTS idx_emg_readings_timestamp ON emg_readings(timestamp);

-- Row Level Security (RLS) policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emg_readings ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own test attempts" ON test_attempts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own test attempts" ON test_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own EMG readings" ON emg_readings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own EMG readings" ON emg_readings FOR INSERT WITH CHECK (auth.uid() = user_id);
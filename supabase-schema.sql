-- AthletiX Database Schema for Supabase

-- Test Attempts Table
CREATE TABLE test_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  test_type TEXT NOT NULL,
  video_url TEXT,
  analysis_result JSONB,
  metrics JSONB,
  form_score INTEGER NOT NULL,
  badge TEXT NOT NULL,
  recommendations TEXT[] NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- EMG Readings Table
CREATE TABLE emg_readings (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  test_attempt_id TEXT REFERENCES test_attempts(id),
  emg_value REAL NOT NULL,
  muscle_activity REAL NOT NULL,
  fatigue_level REAL NOT NULL,
  activation_detected BOOLEAN NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_test_attempts_user_id ON test_attempts(user_id);
CREATE INDEX idx_test_attempts_test_type ON test_attempts(test_type);
CREATE INDEX idx_test_attempts_created_at ON test_attempts(created_at DESC);
CREATE INDEX idx_emg_readings_user_id ON emg_readings(user_id);
CREATE INDEX idx_emg_readings_test_attempt_id ON emg_readings(test_attempt_id);

-- Row Level Security (RLS) policies
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emg_readings ENABLE ROW LEVEL SECURITY;

-- Allow users to access their own data
CREATE POLICY "Users can access their own test attempts" ON test_attempts
  FOR ALL USING (auth.uid()::text = user_id);

CREATE POLICY "Users can access their own EMG readings" ON emg_readings
  FOR ALL USING (auth.uid()::text = user_id);
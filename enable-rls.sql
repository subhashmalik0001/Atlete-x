-- Re-enable RLS for proper user data isolation
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emg_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for authenticated users
CREATE POLICY "Users can view own test attempts" ON test_attempts 
  FOR SELECT USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can insert own test attempts" ON test_attempts 
  FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Users can view own EMG readings" ON emg_readings 
  FOR SELECT USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can insert own EMG readings" ON emg_readings 
  FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);
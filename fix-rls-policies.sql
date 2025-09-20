-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own test attempts" ON test_attempts;
DROP POLICY IF EXISTS "Users can insert own test attempts" ON test_attempts;
DROP POLICY IF EXISTS "Users can view own EMG readings" ON emg_readings;
DROP POLICY IF EXISTS "Users can insert own EMG readings" ON emg_readings;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Re-enable RLS 
ALTER TABLE test_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE emg_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create correct RLS policies with proper type casting
CREATE POLICY "Users can view own test attempts" ON test_attempts 
  FOR SELECT USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can insert own test attempts" ON test_attempts 
  FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Users can view own EMG readings" ON emg_readings 
  FOR SELECT USING (auth.uid() = user_id::uuid);

CREATE POLICY "Users can insert own EMG readings" ON emg_readings 
  FOR INSERT WITH CHECK (auth.uid() = user_id::uuid);

CREATE POLICY "Users can view own profile" ON profiles 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles 
  FOR UPDATE USING (auth.uid() = id);
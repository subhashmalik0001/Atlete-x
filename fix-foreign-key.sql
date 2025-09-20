-- Remove foreign key constraint temporarily for testing
ALTER TABLE test_attempts DROP CONSTRAINT IF EXISTS test_attempts_user_id_fkey;
ALTER TABLE emg_readings DROP CONSTRAINT IF EXISTS emg_readings_user_id_fkey;
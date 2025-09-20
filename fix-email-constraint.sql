-- Make email field optional in profiles table
ALTER TABLE profiles ALTER COLUMN email DROP NOT NULL;
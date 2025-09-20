-- Remove gender check constraint to allow empty values
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_gender_check;
-- User Sync Database Trigger
-- This trigger automatically syncs new Auth users to the custom users table

-- Function to sync new auth users to custom users table
CREATE OR REPLACE FUNCTION sync_auth_user_to_custom_table()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert new user into custom users table
  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    onboarding_completed,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1),
      'User'
    ),
    COALESCE(NEW.raw_user_meta_data->>'role', 'client')::text,
    COALESCE((NEW.raw_user_meta_data->>'onboarding_completed')::boolean, false),
    NEW.created_at,
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      EXCLUDED.name
    ),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS sync_auth_user_trigger ON auth.users;
CREATE TRIGGER sync_auth_user_trigger
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION sync_auth_user_to_custom_table();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA auth TO postgres;
GRANT SELECT ON auth.users TO postgres;

-- Note: This trigger will automatically sync users when they:
-- 1. Sign up with email/password
-- 2. Sign in with OAuth (Google, etc.)
-- 3. Update their profile information
-- 4. Confirm their email address

-- The trigger handles:
-- - Creating new user records in the custom table
-- - Updating existing records if they already exist
-- - Extracting name from various metadata fields
-- - Setting default role as 'client'
-- - Handling onboarding status
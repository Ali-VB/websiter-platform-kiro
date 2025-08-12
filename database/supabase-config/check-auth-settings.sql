-- Check if email confirmation is required
-- This will help us understand the signup flow

-- Check recent auth users and their confirmation status
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;
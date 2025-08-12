-- Debug authentication issue
-- Check auth users vs profile users

-- 1. Check all auth users
SELECT 
  'auth_users' as source,
  id,
  email,
  email_confirmed_at,
  created_at,
  user_metadata
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 2. Check all profile users  
SELECT 
  'profile_users' as source,
  id,
  email,
  name,
  role,
  created_at
FROM public.users 
ORDER BY created_at DESC 
LIMIT 10;

-- 3. Find auth users without profiles
SELECT 
  au.id,
  au.email,
  au.email_confirmed_at,
  au.created_at as auth_created,
  u.id as profile_exists
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
WHERE u.id IS NULL
  AND au.email_confirmed_at IS NOT NULL
ORDER BY au.created_at DESC;

-- 4. Test if current user can insert their own profile
-- (Replace with actual user ID when testing)
-- INSERT INTO public.users (id, email, name, role) 
-- VALUES (auth.uid(), 'test@example.com', 'Test User', 'client');
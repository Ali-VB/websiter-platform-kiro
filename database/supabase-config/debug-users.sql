-- Debug: Check current users and auth state
SELECT 
  au.id,
  au.email,
  au.created_at as auth_created,
  u.id as profile_id,
  u.name as profile_name,
  u.role,
  u.created_at as profile_created
FROM auth.users au
LEFT JOIN public.users u ON au.id = u.id
ORDER BY au.created_at DESC
LIMIT 10;

-- Check current RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'users';

-- Test if we can insert a user manually (this will help identify the exact issue)
-- Don't run this unless you want to test - replace with actual auth.uid()
-- INSERT INTO public.users (id, email, name, role) 
-- VALUES (auth.uid(), 'test@example.com', 'Test User', 'client');
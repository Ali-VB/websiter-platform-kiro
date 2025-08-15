-- SIMPLE SECURITY AUDIT: Check security policies one by one
-- Run this to verify security coverage

-- 1. Check RLS is enabled
SELECT '=== RLS STATUS ===' as step;
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users';

-- 2. List all current policies
SELECT '=== CURRENT POLICIES ===' as step;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users' ORDER BY policyname;

-- 3. Check table permissions
SELECT '=== TABLE PERMISSIONS ===' as step;
SELECT grantee, privilege_type FROM information_schema.role_table_grants 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY grantee, privilege_type;

-- 4. Test admin user
SELECT '=== ADMIN USER CHECK ===' as step;
SELECT email, role FROM public.users WHERE email = 'websiter.clickapp@gmail.com';

-- 5. Count users by role
SELECT '=== USER ROLES ===' as step;
SELECT role, COUNT(*) as count FROM public.users GROUP BY role;

-- 6. Policy coverage check
SELECT '=== POLICY COVERAGE ===' as step;
SELECT 'SELECT policies:' as type, COUNT(*) as count 
FROM pg_policies WHERE tablename = 'users' AND cmd = 'SELECT';

SELECT 'INSERT policies:' as type, COUNT(*) as count 
FROM pg_policies WHERE tablename = 'users' AND cmd = 'INSERT';

SELECT 'UPDATE policies:' as type, COUNT(*) as count 
FROM pg_policies WHERE tablename = 'users' AND cmd = 'UPDATE';

SELECT 'DELETE policies:' as type, COUNT(*) as count 
FROM pg_policies WHERE tablename = 'users' AND cmd = 'DELETE';

SELECT 'ALL policies:' as type, COUNT(*) as count 
FROM pg_policies WHERE tablename = 'users' AND cmd = 'ALL';

-- 7. Security summary
SELECT '=== SECURITY SUMMARY ===' as step;
SELECT 'Total policies:' as metric, COUNT(*) as value FROM pg_policies WHERE tablename = 'users';

SELECT 'RLS enabled:' as metric, 
CASE WHEN rowsecurity THEN 'YES' ELSE 'NO' END as value 
FROM pg_tables WHERE tablename = 'users';

SELECT 'Admin configured:' as metric,
CASE WHEN COUNT(*) > 0 THEN 'YES' ELSE 'NO' END as value
FROM public.users WHERE email = 'websiter.clickapp@gmail.com' AND role = 'admin';
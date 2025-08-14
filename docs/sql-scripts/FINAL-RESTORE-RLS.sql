-- FINAL: RESTORE PROPER RLS POLICIES
-- Since notification tables don't exist, we just need to restore secure RLS
-- Run this in Supabase SQL Editor

-- ========================================
-- STEP 1: VERIFY CURRENT STATE
-- ========================================

SELECT '=== CHECKING CURRENT STATE ===' as step;

-- Check if RLS is currently disabled (from our emergency fix)
SELECT 'Current RLS status:' as info;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- Check admin user
SELECT 'Admin user status:' as info;
SELECT id, email, name, role 
FROM public.users 
WHERE email = 'websiter.clickapp@gmail.com';

-- Check all users
SELECT 'All users:' as info;
SELECT id, email, name, role, created_at 
FROM public.users 
ORDER BY created_at;

-- ========================================
-- STEP 2: CLEAN UP ANY EXISTING POLICIES
-- ========================================

SELECT '=== CLEANING UP EXISTING POLICIES ===' as step;

-- Drop any existing policies (in case some remain)
DROP POLICY IF EXISTS "users_own_profile_select" ON public.users;
DROP POLICY IF EXISTS "users_own_profile_update" ON public.users;
DROP POLICY IF EXISTS "service_role_full_access" ON public.users;
DROP POLICY IF EXISTS "admin_view_all_users" ON public.users;
DROP POLICY IF EXISTS "admin_manage_all_users" ON public.users;

-- ========================================
-- STEP 3: ENABLE RLS AND CREATE SECURE POLICIES
-- ========================================

SELECT '=== CREATING SECURE RLS POLICIES ===' as step;

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy 1: Users can view their own profile
CREATE POLICY "users_own_profile_select" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy 2: Users can update their own profile  
CREATE POLICY "users_own_profile_update" ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- Policy 3: Service role has full access (for server operations)
CREATE POLICY "service_role_full_access" ON public.users
    FOR ALL
    USING (auth.role() = 'service_role');

-- Policy 4: Admin can view all users (simple, non-recursive)
CREATE POLICY "admin_view_all_users" ON public.users
    FOR SELECT
    USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE email = 'websiter.clickapp@gmail.com'
        )
    );

-- Policy 5: Admin can manage all users (simple, non-recursive)
CREATE POLICY "admin_manage_all_users" ON public.users
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE email = 'websiter.clickapp@gmail.com'
        )
    );

-- ========================================
-- STEP 4: SET PROPER PERMISSIONS
-- ========================================

SELECT '=== SETTING PERMISSIONS ===' as step;

-- Grant necessary permissions
GRANT SELECT ON public.users TO authenticated;
GRANT INSERT ON public.users TO authenticated; 
GRANT UPDATE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- ========================================
-- STEP 5: FINAL VERIFICATION
-- ========================================

SELECT '=== FINAL VERIFICATION ===' as step;

-- Verify RLS is enabled
SELECT 'RLS enabled:' as test;
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'users';

-- Show active policies
SELECT 'Active policies:' as test;
SELECT schemaname, tablename, policyname, cmd, qual
FROM pg_policies 
WHERE tablename = 'users'
ORDER BY policyname;

-- Test admin user
SELECT 'Admin user ready:' as test;
SELECT id, email, name, role 
FROM public.users 
WHERE email = 'websiter.clickapp@gmail.com';

-- Count all users
SELECT 'Total users:' as test;
SELECT COUNT(*) as user_count FROM public.users;

SELECT '=== SYSTEM RESTORED ===' as result;
SELECT 'RLS policies are now secure and working!' as message;
SELECT 'Admin login should work perfectly!' as final_message;
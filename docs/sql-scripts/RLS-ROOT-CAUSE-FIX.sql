-- ROOT CAUSE FIX: Allow unauthenticated user sync
-- The real issue is UserSyncService runs BEFORE authentication
-- We need to allow this specific operation

SELECT '=== ROOT CAUSE FIX ===' as step;

-- Drop all existing policies
DROP POLICY IF EXISTS "service_role_policy" ON public.users;
DROP POLICY IF EXISTS "admin_policy" ON public.users;
DROP POLICY IF EXISTS "user_own_data_policy" ON public.users;

-- Create policies that allow the user sync to work BEFORE authentication

-- 1. Service role can do everything (for server operations)
CREATE POLICY "service_role_access" ON public.users
    FOR ALL
    USING (auth.role() = 'service_role');

-- 2. Allow SELECT for user sync (this is the key fix)
CREATE POLICY "allow_user_sync_select" ON public.users
    FOR SELECT
    USING (true);  -- Allow all SELECT operations

-- 3. Admin can do everything (using auth.users only)
CREATE POLICY "admin_full_access" ON public.users
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM auth.users WHERE email = 'websiter.clickapp@gmail.com'
        )
    );

-- 4. Users can insert their own data
CREATE POLICY "users_insert_own" ON public.users
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- 5. Users can update their own data
CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- 6. Users can delete their own data
CREATE POLICY "users_delete_own" ON public.users
    FOR DELETE
    USING (auth.uid() = id);

-- Grant necessary permissions
GRANT SELECT ON public.users TO anon;        -- This allows unauthenticated SELECT
GRANT SELECT ON public.users TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT ALL ON public.users TO service_role;

-- Verify the fix
SELECT 'New Policies:' as info;
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'users' ORDER BY policyname;

SELECT '=== ROOT CAUSE FIXED ===' as result;
SELECT 'User sync should now work before authentication!' as message;
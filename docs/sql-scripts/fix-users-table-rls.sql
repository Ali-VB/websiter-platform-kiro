-- Fix Users Table RLS Policies
-- This script ensures admins can access the users table properly

-- First, let's check if RLS is enabled on users table
-- If you get permission errors, RLS might be blocking admin access

-- Enable RLS on users table (if not already enabled)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can manage all users" ON public.users;
DROP POLICY IF EXISTS "Service role can manage all users" ON public.users;

-- Policy 1: Users can view their own profile
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT
    USING (auth.uid() = id);

-- Policy 2: Users can update their own profile
CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE
    USING (auth.uid() = id);

-- Policy 3: Admins can view all users
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Policy 4: Admins can manage all users (insert, update, delete)
CREATE POLICY "Admins can manage all users" ON public.users
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() 
            AND role = 'admin'
        )
    );

-- Policy 5: Service role can do everything (for server-side operations)
CREATE POLICY "Service role can manage all users" ON public.users
    FOR ALL
    USING (auth.role() = 'service_role');

-- Grant necessary permissions to authenticated users
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT INSERT ON public.users TO authenticated;

-- Grant full access to service role
GRANT ALL ON public.users TO service_role;

-- Ensure the users table has proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- Test query to verify admin access (run this as an admin user)
-- SELECT COUNT(*) FROM public.users;

-- If you still get 403 errors, you might need to:
-- 1. Ensure your admin user has role = 'admin' in the users table
-- 2. Check that VITE_SUPABASE_SERVICE_ROLE_KEY is set correctly
-- 3. Verify the service role key has the right permissions

-- Debug: Check current user's role
-- SELECT id, email, role FROM public.users WHERE id = auth.uid();
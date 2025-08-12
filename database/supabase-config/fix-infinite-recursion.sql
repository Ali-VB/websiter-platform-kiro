-- Fix infinite recursion in RLS policies
-- The issue is that admin policies check the users table, creating circular references

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

-- Create simple, non-recursive policies
CREATE POLICY "Users can read own profile" ON public.users 
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users 
  FOR UPDATE USING (auth.uid() = id);

-- For now, let's remove admin policies to avoid recursion
-- We can add them back later with a different approach if needed

-- Alternative: Create a simple admin policy that doesn't cause recursion
-- This assumes you'll manually set admin users or use a different method
CREATE POLICY "Service role can do everything" ON public.users 
  FOR ALL USING (auth.role() = 'service_role');

-- If you need admin functionality, you can create a separate admin_users table
-- or use Supabase's built-in role system
-- Quick Admin Fix
-- Run these queries in your Supabase SQL Editor to fix the 403 error

-- Step 1: Check your current user ID and role
SELECT 
    auth.uid() as current_user_id,
    u.email,
    u.role,
    u.name
FROM public.users u 
WHERE u.id = auth.uid();

-- Step 2: If the above query returns no results, your user isn't in the users table
-- Replace 'your-email@example.com' with your actual email
INSERT INTO public.users (id, email, name, role, onboarding_completed, created_at, updated_at)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'name', split_part(au.email, '@', 1)),
    'admin',
    true,
    au.created_at,
    NOW()
FROM auth.users au
WHERE au.email = 'your-email@example.com'  -- REPLACE WITH YOUR EMAIL
ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    updated_at = NOW();

-- Step 3: If your user exists but isn't admin, update the role
-- Replace 'your-email@example.com' with your actual email
UPDATE public.users 
SET role = 'admin', updated_at = NOW()
WHERE email = 'your-email@example.com';  -- REPLACE WITH YOUR EMAIL

-- Step 4: Verify the fix
SELECT 
    id,
    email,
    name,
    role,
    onboarding_completed
FROM public.users 
WHERE role = 'admin';

-- Step 5: Test access (this should work without errors now)
SELECT COUNT(*) as total_users FROM public.users;

-- If you still get 403 errors after this, the issue is with RLS policies
-- In that case, run the fix-users-table-rls.sql script
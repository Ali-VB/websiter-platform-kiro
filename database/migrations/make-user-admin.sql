-- Script to make a user an admin
-- INSTRUCTIONS: Replace 'your-email@example.com' with your actual email address

-- First, let's check if the users table has a role column
-- If not, we'll add it
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'client' 
CHECK (role IN ('client', 'admin'));

-- Method 1: Update by email (RECOMMENDED)
-- Replace 'your-email@example.com' with your actual email
UPDATE public.users 
SET role = 'admin' 
WHERE email = 'your-email@example.com';

-- Method 2: Alternative - Update by user ID if you know it
-- UPDATE public.users 
-- SET role = 'admin' 
-- WHERE id = 'your-user-id-here';

-- Method 3: Make the first user admin (if you're the only user)
-- UPDATE public.users 
-- SET role = 'admin' 
-- WHERE id = (SELECT id FROM public.users ORDER BY created_at LIMIT 1);

-- Verify the update worked
SELECT id, email, role, created_at 
FROM public.users 
WHERE role = 'admin';
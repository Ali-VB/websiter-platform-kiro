-- Create Test Client User for Notifications
-- Run this if you have no client users to test notifications with

-- First, check if you have any client users
SELECT COUNT(*) as client_count FROM public.users WHERE role = 'client';

-- If you have 0 client users, you can create a test one
-- NOTE: This creates a user in the public.users table only (not auth.users)
-- This is just for testing notifications - they won't be able to actually log in

-- Option 1: Create a simple test client user
INSERT INTO public.users (
    id,
    name,
    email,
    role,
    onboarding_completed,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'Test Client',
    'testclient@example.com',
    'client',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;

-- Option 2: If you want to create multiple test users
INSERT INTO public.users (id, name, email, role, onboarding_completed, created_at, updated_at) VALUES
(gen_random_uuid(), 'John Doe', 'john@example.com', 'client', true, NOW(), NOW()),
(gen_random_uuid(), 'Jane Smith', 'jane@example.com', 'client', true, NOW(), NOW()),
(gen_random_uuid(), 'Bob Johnson', 'bob@example.com', 'client', false, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Verify the users were created
SELECT 
    id,
    name,
    email,
    role,
    onboarding_completed
FROM public.users 
WHERE role = 'client'
ORDER BY name;
-- VERIFICATION SCRIPT - Run this FIRST to check existing system
-- This script only reads data and doesn't modify anything

-- Check if notifications table exists
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') 
        THEN '✅ Notifications table EXISTS' 
        ELSE '❌ Notifications table DOES NOT EXIST' 
    END as notifications_table_status;

-- Check existing tables (to make sure we don't break anything)
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check existing RLS policies on notifications (if table exists)
SELECT 
    '🔒 Existing RLS Policies on notifications:' as info;

SELECT 
    policyname,
    permissive,
    roles,
    cmd as command_type,
    CASE 
        WHEN qual IS NOT NULL THEN 'Has USING clause' 
        ELSE 'No USING clause' 
    END as using_clause,
    CASE 
        WHEN with_check IS NOT NULL THEN 'Has WITH CHECK clause' 
        ELSE 'No WITH CHECK clause' 
    END as with_check_clause
FROM pg_policies 
WHERE tablename = 'notifications'
ORDER BY policyname;

-- Check users table structure (to ensure our policies will work)
SELECT 
    '👥 Users table info:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check auth.users structure (to ensure foreign key will work)
SELECT 
    '🔐 Auth users info:' as info;

SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth'
ORDER BY ordinal_position;

-- Count existing data (if notifications table exists)
SELECT 
    CASE 
        WHEN EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') 
        THEN (SELECT COUNT(*)::text FROM notifications) || ' notifications exist'
        ELSE 'Notifications table does not exist yet'
    END as existing_notifications_count;
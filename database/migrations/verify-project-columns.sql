-- Verify project table columns
-- Run this to check if the new columns exist and their exact names

-- Check all columns in projects table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check specifically for our new columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND table_schema = 'public'
AND column_name IN ('estimated_hours', 'estimated_days', 'hours_needed', 'target_completion_date', 'admin_todos', 'admin_notes')
ORDER BY column_name;

-- Test if we can select from projects table with new columns
SELECT id, title, estimated_hours, estimated_days, hours_needed, target_completion_date, admin_todos, admin_notes
FROM public.projects 
LIMIT 1;
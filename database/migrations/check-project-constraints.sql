-- Check existing constraints on projects table
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'projects'::regclass;

-- Check the current status values in the database
SELECT DISTINCT status, COUNT(*) as count
FROM projects 
GROUP BY status 
ORDER BY status;

-- Check if there are any invalid status values
SELECT id, title, status 
FROM projects 
WHERE status NOT IN ('new', 'submitted', 'waiting_for_confirmation', 'confirmed', 'in_progress', 'in_design', 'review', 'final_delivery', 'completed')
LIMIT 10;
-- Update project status enum to support the new workflow
-- Run this in your Supabase SQL Editor

-- Step 1: Drop the existing check constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Step 2: Add new check constraint with all the status values we need
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
CHECK (status IN ('submitted', 'waiting_for_confirmation', 'confirmed', 'new', 'in_progress', 'completed'));

-- Step 3: Update any existing 'new' status to 'submitted' for consistency
UPDATE projects 
SET status = 'submitted' 
WHERE status = 'new';

-- Now we can use these status values:
-- 'submitted' - Initial project submission (needs admin confirmation)
-- 'waiting_for_confirmation' - Admin is reviewing  
-- 'confirmed' - Admin has confirmed, work can begin
-- 'in_progress' - Work is being done
-- 'completed' - Project is finished

-- Verify the changes
SELECT DISTINCT status FROM projects;
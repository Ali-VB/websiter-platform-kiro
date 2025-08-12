-- Add unique constraint to prevent duplicate projects for the same request
-- This will prevent multiple projects from being created for the same website request

-- First, let's check if there are any existing duplicates and remove them
WITH duplicate_projects AS (
  SELECT 
    id,
    request_id,
    ROW_NUMBER() OVER (PARTITION BY request_id ORDER BY created_at ASC) as rn
  FROM projects
)
DELETE FROM projects 
WHERE id IN (
  SELECT id FROM duplicate_projects WHERE rn > 1
);

-- Now add the unique constraint
ALTER TABLE projects 
ADD CONSTRAINT unique_project_per_request 
UNIQUE (request_id);

-- Add an index for better performance
CREATE INDEX IF NOT EXISTS idx_projects_request_id ON projects(request_id);

-- Verify the constraint was added
SELECT 
  conname as constraint_name,
  contype as constraint_type
FROM pg_constraint 
WHERE conrelid = 'projects'::regclass 
  AND conname = 'unique_project_per_request';
-- Add enhanced project management fields
-- This script adds time estimation, todo list, and admin notes fields to projects table

-- Add time estimation fields
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS estimated_hours INTEGER DEFAULT 0;

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS estimated_days INTEGER DEFAULT 0;

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS hours_needed DECIMAL(4,2) DEFAULT 0;

ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS target_completion_date DATE;

-- Add todo list field (JSONB for storing array of todo items)
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS admin_todos JSONB DEFAULT '[]';

-- Add admin notes field
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS admin_notes TEXT DEFAULT '';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_target_completion_date ON public.projects(target_completion_date);
CREATE INDEX IF NOT EXISTS idx_projects_estimated_hours ON public.projects(estimated_hours);

-- Verify the columns were added correctly
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'projects' 
AND table_schema = 'public'
AND column_name IN ('estimated_hours', 'estimated_days', 'hours_needed', 'target_completion_date', 'admin_todos', 'admin_notes')
ORDER BY column_name;
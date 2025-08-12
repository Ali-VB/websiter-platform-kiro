-- Add price field to projects table
-- Run this in your Supabase SQL Editor

ALTER TABLE projects 
ADD COLUMN price DECIMAL(10,2) DEFAULT 0;

-- Verify the change
\d projects;
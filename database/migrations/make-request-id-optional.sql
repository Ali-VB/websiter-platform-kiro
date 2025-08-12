-- SQL command to make request_id optional in projects table
-- Run this in your Supabase SQL Editor

ALTER TABLE projects 
ALTER COLUMN request_id DROP NOT NULL;

-- Verify the change
\d projects;
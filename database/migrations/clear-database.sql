-- SQL commands to clear all projects from the database
-- Run these in your Supabase SQL Editor

-- Clear all projects
DELETE FROM projects;

-- Verify the table is empty
SELECT COUNT(*) as remaining_projects FROM projects;

-- Optional: Reset the auto-increment if you have one
-- ALTER SEQUENCE projects_id_seq RESTART WITH 1;
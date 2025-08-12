-- Drop unnecessary tables for simple approach
-- Run this in your Supabase SQL Editor

-- Drop tasks table (we don't need task management)
DROP TABLE IF EXISTS tasks CASCADE;

-- Drop website_requests table (we store everything in projects now)
DROP TABLE IF EXISTS website_requests CASCADE;

-- Drop any other quote-related tables if they exist
DROP TABLE IF EXISTS project_quotes CASCADE;
DROP TABLE IF EXISTS quotes CASCADE;

-- Verify tables are dropped
\dt
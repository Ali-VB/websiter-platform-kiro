-- Fix RLS policy to allow clients to create projects for themselves
-- Run this in your Supabase SQL Editor

-- Add policy to allow clients to insert projects for themselves
CREATE POLICY "Clients can insert their own projects" ON projects
    FOR INSERT WITH CHECK (client_id = auth.uid());

-- Verify the policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'projects';
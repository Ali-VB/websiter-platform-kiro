-- Add all onboarding fields to projects table
-- Run this in your Supabase SQL Editor

ALTER TABLE projects 
ADD COLUMN price DECIMAL(10,2) DEFAULT 0,
ADD COLUMN website_type VARCHAR(50) DEFAULT 'business',
ADD COLUMN contact_info JSONB DEFAULT '{}',
ADD COLUMN website_purpose JSONB DEFAULT '{}',
ADD COLUMN additional_features JSONB DEFAULT '[]',
ADD COLUMN website_inspiration JSONB DEFAULT '[]',
ADD COLUMN design_preferences JSONB DEFAULT '{}',
ADD COLUMN payment_option VARCHAR(20) DEFAULT 'full',
ADD COLUMN onboarding_data JSONB DEFAULT '{}';

-- Verify the changes
\d projects;
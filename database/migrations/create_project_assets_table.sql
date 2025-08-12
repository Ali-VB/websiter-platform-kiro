-- Create project_assets table
CREATE TABLE IF NOT EXISTS project_assets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    size BIGINT NOT NULL,
    type TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('logo', 'images', 'content', 'brand')),
    file_path TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_project_assets_project_id ON project_assets(project_id);
CREATE INDEX IF NOT EXISTS idx_project_assets_client_id ON project_assets(client_id);
CREATE INDEX IF NOT EXISTS idx_project_assets_category ON project_assets(category);
CREATE INDEX IF NOT EXISTS idx_project_assets_created_at ON project_assets(created_at);

-- Enable RLS (Row Level Security)
ALTER TABLE project_assets ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Clients can only see their own assets
CREATE POLICY "Clients can view their own assets" ON project_assets
    FOR SELECT USING (auth.uid() = client_id);

-- Clients can insert their own assets
CREATE POLICY "Clients can insert their own assets" ON project_assets
    FOR INSERT WITH CHECK (auth.uid() = client_id);

-- Clients can delete their own assets
CREATE POLICY "Clients can delete their own assets" ON project_assets
    FOR DELETE USING (auth.uid() = client_id);

-- Admins can view all assets
CREATE POLICY "Admins can view all assets" ON project_assets
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Admins can delete any assets
CREATE POLICY "Admins can delete any assets" ON project_assets
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Create storage bucket for project assets
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-assets', 'project-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
-- Allow authenticated users to upload files
CREATE POLICY "Allow authenticated uploads" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'project-assets' AND auth.role() = 'authenticated');

-- Allow users to view files
CREATE POLICY "Allow public access" ON storage.objects
    FOR SELECT USING (bucket_id = 'project-assets');

-- Allow users to delete their own files (we'll handle this in the application)
CREATE POLICY "Allow authenticated deletes" ON storage.objects
    FOR DELETE USING (bucket_id = 'project-assets' AND auth.role() = 'authenticated');
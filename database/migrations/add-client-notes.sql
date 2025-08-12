-- Add client notes table for admin task management
CREATE TABLE IF NOT EXISTS client_notes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id TEXT NOT NULL, -- Can be user ID or email
    client_email TEXT NOT NULL,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES users(id),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_notes_client_id ON client_notes(client_id);
CREATE INDEX IF NOT EXISTS idx_client_notes_client_email ON client_notes(client_email);
CREATE INDEX IF NOT EXISTS idx_client_notes_created_at ON client_notes(created_at);

-- Add RLS policies
ALTER TABLE client_notes ENABLE ROW LEVEL SECURITY;

-- Allow admins to manage all client notes
CREATE POLICY "Admins can manage all client notes" ON client_notes
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Add trigger to update updated_at
CREATE OR REPLACE FUNCTION update_client_notes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_notes_updated_at
    BEFORE UPDATE ON client_notes
    FOR EACH ROW
    EXECUTE FUNCTION update_client_notes_updated_at();
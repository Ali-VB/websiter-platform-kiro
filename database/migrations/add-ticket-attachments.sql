-- Add ticket attachments table
-- This script adds support for file attachments to support tickets

-- Create ticket_attachments table
CREATE TABLE IF NOT EXISTS public.ticket_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_ticket_id ON public.ticket_attachments(ticket_id);
CREATE INDEX IF NOT EXISTS idx_ticket_attachments_uploaded_by ON public.ticket_attachments(uploaded_by);

-- Row Level Security (RLS) policies
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Clients can read attachments for their own tickets
DROP POLICY IF EXISTS "Clients can read own ticket attachments" ON public.ticket_attachments;
CREATE POLICY "Clients can read own ticket attachments" ON public.ticket_attachments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.support_tickets 
        WHERE id = ticket_id AND client_id = auth.uid()
    )
);

-- Clients can upload attachments to their own tickets
DROP POLICY IF EXISTS "Clients can upload to own tickets" ON public.ticket_attachments;
CREATE POLICY "Clients can upload to own tickets" ON public.ticket_attachments FOR INSERT WITH CHECK (
    auth.uid() = uploaded_by AND
    EXISTS (
        SELECT 1 FROM public.support_tickets 
        WHERE id = ticket_id AND client_id = auth.uid()
    )
);

-- Admins can read all attachments
DROP POLICY IF EXISTS "Admins can read all attachments" ON public.ticket_attachments;
CREATE POLICY "Admins can read all attachments" ON public.ticket_attachments FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Admins can upload attachments to any ticket
DROP POLICY IF EXISTS "Admins can upload to any ticket" ON public.ticket_attachments;
CREATE POLICY "Admins can upload to any ticket" ON public.ticket_attachments FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Admins can delete any attachment
DROP POLICY IF EXISTS "Admins can delete any attachment" ON public.ticket_attachments;
CREATE POLICY "Admins can delete any attachment" ON public.ticket_attachments FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Create storage bucket for ticket attachments (if not exists)
-- Note: This needs to be run in Supabase dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('ticket-attachments', 'ticket-attachments', true)
-- ON CONFLICT (id) DO NOTHING;

-- Verify the table was created correctly
SELECT 'ticket_attachments' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ticket_attachments' AND table_schema = 'public'
ORDER BY ordinal_position;
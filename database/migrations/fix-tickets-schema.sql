-- Fix Support Tickets Schema
-- This script will properly recreate the support ticket tables with all columns

-- Drop existing tables and recreate them properly
DROP TABLE IF EXISTS public.ticket_responses CASCADE;
DROP TABLE IF EXISTS public.support_tickets CASCADE;

-- Support Tickets table
CREATE TABLE public.support_tickets (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
    subject TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Technical Issue', 'Design Change', 'Content Update', 'General Question')),
    priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ticket Responses table
CREATE TABLE public.ticket_responses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    is_admin_response BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for better performance
CREATE INDEX idx_support_tickets_client_id ON public.support_tickets(client_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX idx_support_tickets_priority ON public.support_tickets(priority);
CREATE INDEX idx_support_tickets_created_at ON public.support_tickets(created_at);
CREATE INDEX idx_ticket_responses_ticket_id ON public.ticket_responses(ticket_id);
CREATE INDEX idx_ticket_responses_created_at ON public.ticket_responses(created_at);

-- Row Level Security (RLS) policies
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_responses ENABLE ROW LEVEL SECURITY;

-- Support Tickets policies
CREATE POLICY "Clients can read own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Clients can create own tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = client_id);
CREATE POLICY "Admins can CRUD all tickets" ON public.support_tickets FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Ticket Responses policies
CREATE POLICY "Users can read responses for their tickets" ON public.ticket_responses FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.support_tickets 
        WHERE id = ticket_id AND (client_id = auth.uid() OR EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        ))
    )
);

CREATE POLICY "Users can create responses for their tickets" ON public.ticket_responses FOR INSERT WITH CHECK (
    auth.uid() = user_id AND (
        EXISTS (
            SELECT 1 FROM public.support_tickets 
            WHERE id = ticket_id AND client_id = auth.uid()
        ) OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    )
);

CREATE POLICY "Admins can CRUD all responses" ON public.ticket_responses FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = auth.uid() AND role = 'admin'
    )
);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at on support_tickets
CREATE TRIGGER update_support_tickets_updated_at
    BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Force refresh the schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Verify the tables were created correctly
SELECT 'support_tickets' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'support_tickets' AND table_schema = 'public'
UNION ALL
SELECT 'ticket_responses' as table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ticket_responses' AND table_schema = 'public'
ORDER BY table_name, column_name;
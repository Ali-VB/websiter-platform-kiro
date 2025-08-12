-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users) - only if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        CREATE TABLE public.users (
          id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
          email TEXT NOT NULL UNIQUE,
          name TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'client' CHECK (role IN ('client', 'admin')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          onboarding_completed BOOLEAN DEFAULT FALSE,
          preferences JSONB DEFAULT '{}'::jsonb
        );
    END IF;
END $$;

-- Website requests table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'website_requests') THEN
        CREATE TABLE public.website_requests (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
          website_type TEXT NOT NULL CHECK (website_type IN ('company_portfolio', 'personal_resume', 'ecommerce', 'landing_page', 'blog_magazine', 'contact_mini_site')),
          features JSONB NOT NULL DEFAULT '[]'::jsonb,
          customization JSONB NOT NULL DEFAULT '{}'::jsonb,
          client_details JSONB NOT NULL DEFAULT '{}'::jsonb,
          template_id UUID DEFAULT NULL,
          status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'quoted', 'in_progress', 'completed')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Projects table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') THEN
        CREATE TABLE public.projects (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          request_id UUID REFERENCES public.website_requests(id) ON DELETE CASCADE NOT NULL,
          client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
          admin_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed')),
          priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
        );
    END IF;
END $$;

-- Tasks table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') THEN
        CREATE TABLE public.tasks (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
          title TEXT NOT NULL,
          description TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed')),
          assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
          due_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Payments table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'payments') THEN
        CREATE TABLE public.payments (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
          client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
          stripe_payment_intent_id TEXT DEFAULT NULL,
          amount INTEGER NOT NULL, -- Amount in cents
          currency TEXT NOT NULL DEFAULT 'cad',
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')),
          payment_type TEXT NOT NULL CHECK (payment_type IN ('initial', 'final', 'maintenance')),
          payment_method TEXT DEFAULT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          processed_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
          metadata JSONB DEFAULT '{}'::jsonb
        );
    END IF;
END $$;

-- Support tickets table
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'support_tickets') THEN
        CREATE TABLE public.support_tickets (
          id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
          client_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
          project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
          subject TEXT NOT NULL,
          description TEXT NOT NULL,
          priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
          status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
          assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    END IF;
END $$;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers (only if they don't exist)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_website_requests_updated_at') THEN
        CREATE TRIGGER update_website_requests_updated_at BEFORE UPDATE ON public.website_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_projects_updated_at') THEN
        CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_tasks_updated_at') THEN
        CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_support_tickets_updated_at') THEN
        CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Row Level Security Policies

-- Users table policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can read all users" ON public.users;
CREATE POLICY "Admins can read all users" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Website requests policies
ALTER TABLE public.website_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can CRUD own requests" ON public.website_requests;
CREATE POLICY "Clients can CRUD own requests" ON public.website_requests FOR ALL USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Admins can read all requests" ON public.website_requests;
CREATE POLICY "Admins can read all requests" ON public.website_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Admins can update all requests" ON public.website_requests;
CREATE POLICY "Admins can update all requests" ON public.website_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Projects policies
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can read own projects" ON public.projects;
CREATE POLICY "Clients can read own projects" ON public.projects FOR SELECT USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Admins can CRUD all projects" ON public.projects;
CREATE POLICY "Admins can CRUD all projects" ON public.projects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Tasks policies
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can read own project tasks" ON public.tasks;
CREATE POLICY "Clients can read own project tasks" ON public.tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
);

DROP POLICY IF EXISTS "Admins can CRUD all tasks" ON public.tasks;
CREATE POLICY "Admins can CRUD all tasks" ON public.tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Payments policies
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can read own payments" ON public.payments;
CREATE POLICY "Clients can read own payments" ON public.payments FOR SELECT USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Admins can CRUD all payments" ON public.payments;
CREATE POLICY "Admins can CRUD all payments" ON public.payments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Support tickets policies
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Clients can CRUD own tickets" ON public.support_tickets;
CREATE POLICY "Clients can CRUD own tickets" ON public.support_tickets FOR ALL USING (auth.uid() = client_id);

DROP POLICY IF EXISTS "Admins can CRUD all tickets" ON public.support_tickets;
CREATE POLICY "Admins can CRUD all tickets" ON public.support_tickets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_website_requests_client_id ON public.website_requests(client_id);
CREATE INDEX IF NOT EXISTS idx_website_requests_status ON public.website_requests(status);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON public.payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON public.payments(client_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_client_id ON public.support_tickets(client_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
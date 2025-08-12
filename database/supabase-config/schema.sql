-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
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

-- Website requests table
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

-- Projects table
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

-- Tasks table
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

-- Payments table
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

-- Support tickets table
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

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_website_requests_updated_at BEFORE UPDATE ON public.website_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies

-- Users can read their own profile and admins can read all
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Admins can read all users" ON public.users FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Website requests - clients can CRUD their own, admins can read all
ALTER TABLE public.website_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can CRUD own requests" ON public.website_requests FOR ALL USING (auth.uid() = client_id);
CREATE POLICY "Admins can read all requests" ON public.website_requests FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Admins can update all requests" ON public.website_requests FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Projects - clients can read their own, admins can CRUD all
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can read own projects" ON public.projects FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Admins can CRUD all projects" ON public.projects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Tasks - clients can read tasks for their projects, admins can CRUD all
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can read own project tasks" ON public.tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_id AND client_id = auth.uid())
);
CREATE POLICY "Admins can CRUD all tasks" ON public.tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Payments - clients can read their own, admins can CRUD all
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can read own payments" ON public.payments FOR SELECT USING (auth.uid() = client_id);
CREATE POLICY "Admins can CRUD all payments" ON public.payments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Support tickets - clients can CRUD their own, admins can CRUD all
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Clients can CRUD own tickets" ON public.support_tickets FOR ALL USING (auth.uid() = client_id);
CREATE POLICY "Admins can CRUD all tickets" ON public.support_tickets FOR ALL USING (
  EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
);

-- Create indexes for better performance
CREATE INDEX idx_website_requests_client_id ON public.website_requests(client_id);
CREATE INDEX idx_website_requests_status ON public.website_requests(status);
CREATE INDEX idx_projects_client_id ON public.projects(client_id);
CREATE INDEX idx_projects_status ON public.projects(status);
CREATE INDEX idx_tasks_project_id ON public.tasks(project_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_payments_project_id ON public.payments(project_id);
CREATE INDEX idx_payments_client_id ON public.payments(client_id);
CREATE INDEX idx_support_tickets_client_id ON public.support_tickets(client_id);
CREATE INDEX idx_support_tickets_status ON public.support_tickets(status);
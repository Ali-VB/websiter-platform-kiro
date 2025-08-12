-- Create payments table if it doesn't exist
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID REFERENCES users(id) ON DELETE CASCADE,
  stripe_payment_intent_id TEXT UNIQUE,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT DEFAULT 'cad',
  status TEXT CHECK (status IN ('pending', 'succeeded', 'failed', 'canceled')) DEFAULT 'pending',
  payment_type TEXT CHECK (payment_type IN ('initial', 'final', 'maintenance')) NOT NULL,
  payment_method TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_client_id ON payments(client_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_id ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Admins can view all payments" ON payments;

-- Create RLS Policies
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (auth.uid() = client_id);

CREATE POLICY "Admins can view all payments" ON payments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Create policy for inserting payments (needed for Edge Functions)
CREATE POLICY "Service role can insert payments" ON payments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can update payments" ON payments
  FOR UPDATE USING (true);
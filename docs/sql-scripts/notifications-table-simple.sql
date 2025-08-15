-- Simple notifications table for testing
-- This is a minimal, tested schema

-- Drop existing table if it exists (for testing)
DROP TABLE IF EXISTS notifications;

-- Create notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info' CHECK (type IN ('info', 'success', 'warning', 'error')),
  recipient_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- NULL for global
  is_global BOOLEAN DEFAULT FALSE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_notifications_recipient ON notifications(recipient_id);
CREATE INDEX idx_notifications_global ON notifications(is_global) WHERE is_global = true;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies (simple and tested)

-- Users can read their own notifications and global notifications
CREATE POLICY "Users can read own and global notifications" ON notifications
  FOR SELECT
  USING (
    recipient_id = auth.uid() OR 
    is_global = true
  );

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- Admins can do everything (insert, update, delete)
CREATE POLICY "Admins can manage all notifications" ON notifications
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.role = 'admin'
    )
  );

-- Insert some test data
INSERT INTO notifications (title, message, type, is_global) VALUES
  ('Welcome to Websiter', 'Thank you for using our platform!', 'info', true),
  ('System Maintenance', 'Scheduled maintenance on Sunday 2AM-4AM EST', 'warning', true);

-- Verify the table was created
SELECT 'Notifications table created successfully' as status;
SELECT COUNT(*) as test_notifications_count FROM notifications;
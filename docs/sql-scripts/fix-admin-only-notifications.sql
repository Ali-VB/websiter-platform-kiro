-- Fix RLS policies to allow client-triggered admin-only notifications
-- This allows clients to create notifications specifically for admin users
-- Clients will NOT see these notifications, only admins will

-- Drop the global notification policy we created earlier
DROP POLICY IF EXISTS "Users can create global notifications" ON notifications;

-- Create new policy: Allow users to create notifications for admin users
CREATE POLICY "Users can create notifications for admins" ON notifications
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    recipient_id IS NOT NULL AND
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = recipient_id 
      AND users.role = 'admin'
    )
  );

-- Verify policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'notifications'
ORDER BY policyname;
-- Fix RLS policies to allow client-triggered admin notifications
-- This allows clients to create global notifications (for admin notifications)
-- while still protecting user-specific notifications

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage all notifications" ON notifications;

-- Recreate admin policy (unchanged)
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

-- New policy: Allow any authenticated user to create global notifications
-- This enables client actions to trigger admin notifications
CREATE POLICY "Users can create global notifications" ON notifications
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    is_global = true AND 
    recipient_id IS NULL
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
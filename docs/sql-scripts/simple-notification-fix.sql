-- Simple fix: Allow authenticated users to create notifications for admin users
-- This is the minimal change needed to make client->admin notifications work

-- First, let's see what policies currently exist
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'notifications';

-- Add a new policy that allows creating notifications for admin users
CREATE POLICY "Allow creating notifications for admin users" ON notifications
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND 
    (
      -- Allow creating notifications for admin users
      (recipient_id IS NOT NULL AND EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = recipient_id 
        AND users.role = 'admin'
      ))
      OR
      -- Keep existing global notification capability
      (is_global = true AND recipient_id IS NULL)
    )
  );

-- Verify the new policy was created
SELECT policyname, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'notifications'
ORDER BY policyname;
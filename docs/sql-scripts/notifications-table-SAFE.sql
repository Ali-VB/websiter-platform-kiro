-- SAFE notifications table creation script
-- This script will NOT destroy existing data or policies
-- It only creates the notifications table if it doesn't exist

-- Check if notifications table already exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'notifications') THEN
        -- Create notifications table only if it doesn't exist
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

        RAISE NOTICE 'Notifications table created successfully';
    ELSE
        RAISE NOTICE 'Notifications table already exists, skipping creation';
    END IF;
END $$;

-- Create RLS policies only if they don't exist
DO $$ 
BEGIN
    -- Check and create "Users can read own and global notifications" policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Users can read own and global notifications'
    ) THEN
        CREATE POLICY "Users can read own and global notifications" ON notifications
          FOR SELECT
          USING (
            recipient_id = auth.uid() OR 
            is_global = true
          );
        RAISE NOTICE 'Created policy: Users can read own and global notifications';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can read own and global notifications';
    END IF;

    -- Check and create "Users can update own notifications" policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Users can update own notifications'
    ) THEN
        CREATE POLICY "Users can update own notifications" ON notifications
          FOR UPDATE
          USING (recipient_id = auth.uid())
          WITH CHECK (recipient_id = auth.uid());
        RAISE NOTICE 'Created policy: Users can update own notifications';
    ELSE
        RAISE NOTICE 'Policy already exists: Users can update own notifications';
    END IF;

    -- Check and create "Admins can manage all notifications" policy
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'notifications' 
        AND policyname = 'Admins can manage all notifications'
    ) THEN
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
        RAISE NOTICE 'Created policy: Admins can manage all notifications';
    ELSE
        RAISE NOTICE 'Policy already exists: Admins can manage all notifications';
    END IF;
END $$;

-- Insert test data only if table is empty
DO $$ 
BEGIN
    IF (SELECT COUNT(*) FROM notifications) = 0 THEN
        INSERT INTO notifications (title, message, type, is_global) VALUES
          ('Welcome to Websiter', 'Thank you for using our platform!', 'info', true),
          ('System Maintenance', 'Scheduled maintenance on Sunday 2AM-4AM EST', 'warning', true);
        RAISE NOTICE 'Inserted test notifications';
    ELSE
        RAISE NOTICE 'Notifications table already has data, skipping test data insertion';
    END IF;
END $$;

-- Final verification
SELECT 
    'Notifications system setup complete' as status,
    COUNT(*) as notification_count 
FROM notifications;

-- Show existing policies for verification
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
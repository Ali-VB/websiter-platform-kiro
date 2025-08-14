# 🔔 Notification System Setup Guide

## Step 1: Create the Database Table

1. **Open Supabase Dashboard**

   - Go to your Supabase project dashboard
   - Click on **SQL Editor** in the left sidebar

2. **Run the SQL Script**

   - Copy the contents of `docs/sql-scripts/create-notifications-table-simple.sql`
   - Paste it into the SQL Editor
   - Click **"Run"** to execute

3. **Verify Table Creation**
   - You should see "Notifications table created successfully!" message
   - The table `public.notifications` should now exist

## Step 2: Test the System

1. **Go to Admin Dashboard**

   - Navigate to **Notifications** section
   - You'll see a **Debug Panel** at the top

2. **Run Debug Tests**
   - Click **"Test Table Exists"** - should show PASSED
   - Click **"Test Create Global"** - should create a test notification
   - Click **"Test Load Notifications"** - should load notifications

## Step 3: Create Your First Notification

1. **Click "Create Notification"** button
2. **Fill in the form:**
   - **Title**: "Welcome to our platform!"
   - **Message**: "We're excited to work with you on your website project."
   - **Type**: Info
   - **Recipients**: All Users (Global)
3. **Click "Create Notification"**

## Step 4: Verify Client Side

1. **Sign in as a client** (or open in incognito)
2. **Check the notification bell** in the navbar
3. **You should see:**
   - Red badge with unread count
   - Notification in the dropdown when clicked

## Troubleshooting

### Error: "Could not find the 'is_global' column"

- **Solution**: The notifications table doesn't exist. Run Step 1 above.

### Error: "Permission denied"

- **Solution**: Make sure you're signed in as an admin user
- Check that your user has `role = 'admin'` in the users table

### Error: "RLS policy violation"

- **Solution**: The RLS policies weren't created properly
- Re-run the SQL script from Step 1

### No notifications showing for clients

- **Solution**:
  1. Make sure you created a global notification (is_global = true)
  2. Check that the client is authenticated
  3. Verify RLS policies allow clients to see global notifications

## SQL Commands for Manual Testing

```sql
-- Check if table exists
SELECT * FROM information_schema.tables WHERE table_name = 'notifications';

-- Check your admin user ID
SELECT id, email, role FROM public.users WHERE role = 'admin';

-- Manually create a test notification (replace 'your-admin-id')
INSERT INTO public.notifications (title, message, type, is_global, sender_id)
VALUES ('Test', 'Manual test notification', 'info', true, 'your-admin-id');

-- Check notifications
SELECT * FROM public.notifications ORDER BY created_at DESC;

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'notifications';
```

## Next Steps

Once the system is working:

1. **Remove Debug Panel**: Delete the `<NotificationDebug />` line from NotificationManagement.tsx
2. **Create Real Notifications**: Use the admin interface to create meaningful notifications
3. **Test Automatic Notifications**: Create a project or make a payment to see automatic admin notifications

## Features Available

- ✅ **Global Notifications**: Send to all users
- ✅ **User-specific Notifications**: Send to individual clients
- ✅ **Real-time Updates**: Instant notification delivery
- ✅ **Pagination**: Handle 10+ notifications efficiently
- ✅ **Automatic Admin Notifications**: Project creation, payments
- ✅ **Mark as Read**: Individual and bulk operations
- ✅ **Notification Types**: Info, Success, Warning, Error

# Debug Save Issues - Project Management Modal

## 🐛 Current Issue

Save functionality not working despite running SQL migration script.

## 🔍 Debugging Steps

### 1. Verify Database Columns

Run this SQL in Supabase Dashboard to check if columns exist:

```sql
-- Check all columns in projects table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'projects'
AND table_schema = 'public'
ORDER BY ordinal_position;
```

**Expected new columns:**

- `estimated_hours` (INTEGER)
- `estimated_days` (INTEGER)
- `hours_needed` (DECIMAL)
- `target_completion_date` (DATE)
- `admin_todos` (JSONB)
- `admin_notes` (TEXT)

### 2. Test Database Connection

1. Open project management modal
2. Click "Test DB Connection" button (added for debugging)
3. Check browser console for errors

### 3. Check Browser Console

Open browser DevTools → Console and look for:

- ❌ Database errors
- 🔍 Debug logs showing data being sent
- Network errors in Network tab

### 4. Verify Project ID

1. Click "Log Project Data" button
2. Check console for project ID format
3. Ensure it's a valid UUID

### 5. Check RLS Policies

Run this SQL to check if Row Level Security is blocking updates:

```sql
-- Check RLS policies on projects table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'projects';

-- Test if current user can update projects
SELECT current_user, auth.uid();
```

### 6. Manual Database Test

Try updating a project manually in Supabase:

```sql
-- Replace 'your-project-id' with actual project ID
UPDATE public.projects
SET estimated_hours = 40,
    admin_notes = 'test note',
    admin_todos = '[{"id":"1","text":"test","completed":false}]'
WHERE id = 'your-project-id';
```

## 🔧 Common Issues & Solutions

### Issue 1: Columns Don't Exist

**Symptoms:** Error about unknown column
**Solution:** Re-run the migration script:

```sql
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS estimated_hours INTEGER DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS estimated_days INTEGER DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS hours_needed DECIMAL(4,2) DEFAULT 0;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS target_completion_date DATE;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS admin_todos JSONB DEFAULT '[]';
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS admin_notes TEXT DEFAULT '';
```

### Issue 2: RLS Policy Blocking Updates

**Symptoms:** Permission denied errors
**Solution:** Check if admin user has update permissions:

```sql
-- Allow admins to update all projects
CREATE POLICY "Admins can update projects" ON public.projects
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);
```

### Issue 3: TypeScript Type Mismatch

**Symptoms:** TypeScript errors about unknown properties
**Solution:** Database types updated in `src/types/database.ts`

### Issue 4: Invalid Project ID

**Symptoms:** No rows affected by update
**Solution:** Verify project ID is correct UUID format

### Issue 5: Network/Connection Issues

**Symptoms:** Network errors in browser
**Solution:** Check Supabase connection and API keys

## 🎯 Quick Test Procedure

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Open project management modal**
4. **Click "Test DB Connection"** - should show success message
5. **Try saving time estimation** - watch console for errors
6. **Check Network tab** for failed requests

## 📋 Debug Information to Collect

When reporting issues, include:

- Browser console errors (screenshots)
- Network tab showing failed requests
- Result of database column verification SQL
- Current user role and permissions
- Project ID being updated

## 🚀 Expected Behavior

When working correctly:

1. Click save button
2. See "Saving..." state
3. Console shows: "✅ Time estimation updated successfully"
4. Modal data persists when reopened
5. No page refresh or errors

## 🔍 Debug Tools Added

Temporary debug section in modal with:

- **Test DB Connection**: Verifies database access
- **Log Project Data**: Shows current project data in console

Remove debug section after fixing the issue.

# Websiter Simplification Plan

## Current Problem

The system has become overly complex with multiple concepts that should be simplified:

- Website requests (REMOVE)
- Quotes (REMOVE)
- Complex status workflows (SIMPLIFY)
- Multiple transformations (CONSOLIDATE)

## Simple Approach - What We Keep

### 1. Core Tables

- `users` - Client and admin users
- `projects` - Main project records
- `tasks` - Optional project tasks

### 2. Simple Project Workflow

1. **Client completes onboarding** → Creates project directly
2. **Admin views project** → Can confirm/start/complete
3. **Client sees progress** → Simple status updates

### 3. Simple Project Status

- `new` - Just created from onboarding
- `in_progress` - Admin confirmed and working
- `completed` - Project finished

### 4. Simple Data Flow

```
Onboarding → Project (with client info) → Admin Dashboard → Status Updates
```

## What We Need to Remove/Fix

### 1. Database Schema Changes

- Make `request_id` nullable in projects table ✅ (Done)
- Remove dependency on `website_requests` table
- Remove `quote` related fields

### 2. Remove Complex Logic

- Remove quote confirmation workflows
- Remove website request transformations
- Remove complex status mappings
- Remove `isQuote` logic

### 3. Simplify Admin Dashboard

- Show projects with client info from `users` table
- Simple status management (new → in_progress → completed)
- Remove quote-related UI components

### 4. Fix Client Info Display

- Get client name/email from `users` table via `client_id`
- Remove fallbacks to `website_requests` table

## Implementation Steps

### Step 1: Fix Database Queries

- Update `ProjectService.getAllProjects()` to properly join with users
- Remove website_requests joins
- Ensure client info comes from users table

### Step 2: Simplify Project Transformations

- Create ONE transformation function
- Remove all quote-related logic
- Use only users table for client info

### Step 3: Clean Admin Components

- Remove quote confirmation UI
- Simplify status management
- Fix client info display

### Step 4: Test Simple Flow

- Onboarding creates project
- Admin sees project with client info
- Admin can update status
- Client sees status updates

## Success Criteria

- ✅ Onboarding creates project successfully
- ❌ Admin dashboard shows client name/email
- ❌ No quote-related UI appears
- ❌ Status management works simply
- ❌ No complex transformations needed

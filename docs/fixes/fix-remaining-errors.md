# Remaining Errors to Fix

## Summary of Issues:

1. **useWebsiteRequests references** - Need to remove all imports and usage
2. **Quote property references** - Project interface no longer has quote property
3. **Old status references** - Many components still reference old statuses like 'submitted', 'review', 'in_design', etc.
4. **Unused imports** - CheckIcon, formatCurrency functions not being used

## Quick Fixes Needed:

### 1. Remove useWebsiteRequests imports:

- App.tsx ✅ (fixed)
- AdminSidebar.tsx ✅ (already commented)

### 2. Replace project.quote with project.price:

- InvoiceModal.tsx ✅ (fixed)
- ProjectCard.tsx ✅ (fixed)
- ProjectManagementList.tsx - Need to fix sorting
- ProjectMetrics.tsx - Need to fix calculations
- ProjectStats.tsx - Need to fix calculations
- pdfGenerator.ts - Need to fix PDF generation

### 3. Fix status references:

- ProjectCard.tsx ✅ (partially fixed)
- ProjectFilters.tsx - Remove old status filters
- ProjectMetrics.tsx - Update status calculations
- ProjectStats.tsx - Update status display
- ProjectViewModal.tsx - Update status conditions

### 4. Remove unused imports:

- ProjectManageModal.tsx - Remove CheckIcon
- ProjectDetails.tsx - Remove formatCurrency
- ProjectViewModal.tsx - Remove formatCurrency

### 5. Fix component references:

- ClientDashboard.tsx - Remove requests prop from ProjectsList
- DashboardSidebar.tsx - Remove requests reference

## Simple Approach Reminder:

- Only 3 statuses: 'new', 'in_progress', 'completed'
- No quote property - use price instead
- No website_requests - everything in projects table
- No tasks - simplified workflow

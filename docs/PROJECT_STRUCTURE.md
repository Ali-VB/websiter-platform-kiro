# Project Structure

This document outlines the organized file structure of the Websiter project.

## 📁 Root Directory Structure

```
websiter/
├── 📁 src/                     # Source code
│   ├── 📁 components/          # React components
│   ├── 📁 hooks/              # Custom React hooks
│   ├── 📁 services/           # API services and integrations
│   ├── 📁 types/              # TypeScript type definitions
│   ├── 📁 utils/              # Utility functions
│   └── 📁 lib/                # Third-party library configurations
├── 📁 public/                  # Static assets
├── 📁 database/               # Database related files
│   ├── 📁 migrations/         # SQL migration files
│   ├── 📁 supabase-config/    # Supabase configuration files
│   └── 📄 invoices_schema.sql # Invoice schema
├── 📁 docs/                   # Documentation
│   ├── 📁 development/        # Development notes and guides
│   ├── 📁 setup/             # Setup and configuration guides
│   ├── 📁 fixes/             # Bug fixes and improvements documentation
│   └── 📁 sql-scripts/       # SQL utility scripts
├── 📁 supabase/              # Supabase local development
│   └── 📁 functions/         # Edge functions
├── 📁 scripts/               # Build and utility scripts (if any remain)
├── 📄 package.json           # Node.js dependencies and scripts
├── 📄 README.md              # Main project documentation
├── 📄 .gitignore             # Git ignore rules
├── 📄 .env.example           # Environment variables template
└── 📄 vite.config.ts         # Vite configuration
```

## 📂 Detailed Directory Descriptions

### `/src` - Source Code

- **components/**: All React components organized by feature

  - `admin/` - Admin dashboard components
  - `auth/` - Authentication components
  - `common/` - Shared/reusable components
  - `dashboard/` - Client dashboard components
  - `onboarding/` - Project creation flow components

- **hooks/**: Custom React hooks for state management and API calls
- **services/**: External service integrations (Supabase, Stripe, etc.)
- **types/**: TypeScript type definitions and interfaces
- **utils/**: Helper functions and utilities
- **lib/**: Third-party library configurations

### `/database` - Database Files

- **migrations/**: SQL migration files for database schema changes
- **supabase-config/**: Supabase-specific configuration and schema files
- **invoices_schema.sql**: Invoice-related database schema

### `/docs` - Documentation

- **development/**: Development notes, implementation guides, and technical documentation
- **setup/**: Setup guides for Stripe, user workflows, and initial configuration
- **fixes/**: Documentation of bug fixes and improvements
- **sql-scripts/**: Utility SQL scripts and database helpers

### `/supabase` - Supabase Local Development

- **functions/**: Supabase Edge Functions
- **config.toml**: Local Supabase configuration (moved to database/supabase-config/)

## 🗂️ File Organization Principles

1. **Separation of Concerns**: Each directory has a specific purpose
2. **Feature-Based Organization**: Components are grouped by feature/domain
3. **Documentation Centralization**: All docs are in the `/docs` folder
4. **Database Centralization**: All database-related files are in `/database`
5. **Clean Root**: Minimal files in the root directory for better navigation

## 📋 File Naming Conventions

- **Components**: PascalCase (e.g., `UserDashboard.tsx`)
- **Hooks**: camelCase starting with 'use' (e.g., `useAuth.tsx`)
- **Services**: camelCase (e.g., `authService.ts`)
- **Types**: camelCase (e.g., `userTypes.ts`)
- **Documentation**: UPPER_SNAKE_CASE (e.g., `SETUP_GUIDE.md`)
- **SQL Files**: kebab-case (e.g., `create-users-table.sql`)

## 🔄 Migration from Old Structure

The following files were reorganized:

### Moved to `/docs/development/`:

- All `.md` files (except README.md)
- Development notes and implementation guides

### Moved to `/docs/setup/`:

- STRIPE_SETUP.md
- USER_WORKFLOW.md

### Moved to `/docs/sql-scripts/`:

- Loose `.sql` files from root
- Utility `.js` scripts

### Moved to `/database/migrations/`:

- SQL migration files from `/scripts`

### Moved to `/database/supabase-config/`:

- Supabase configuration files
- Schema files from `/supabase`

This organization makes the project much more maintainable and easier to navigate for new developers.

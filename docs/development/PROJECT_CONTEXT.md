# Websiter Project - Complete Context Document

## 🎯 Project Overview

**Websiter** is a user-friendly web application designed to make website creation easy and affordable for non-technical clients while providing freelance WordPress/web developers with powerful project management tools. The platform features a simplified, accessible interface with AI-powered assistance, fixed-price packages, flexible payment options, and comprehensive onboarding.

### Key Value Propositions

- **For Clients**: "Professional WordPress Sites Without the Meetings"
- **For Developers**: Streamlined project management with Kanban boards and client communication
- **Business Model**: Fixed-price packages with transparent pricing and flexible payment options

---

## 🏗️ Technical Architecture

### Tech Stack

- **Frontend**: React 19.1.0 + TypeScript + Vite
- **Styling**: Tailwind CSS 3.4.17 + Framer Motion 12.23.6
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Edge Functions)
- **Payments**: Stripe 18.3.0 + PayPal (planned)
- **UI Components**: Custom components with class-variance-authority
- **State Management**: React hooks + Context API
- **File Handling**: html2canvas + jsPDF for invoice generation
- **Notifications**: react-hot-toast

### Project Structure

```
websiter/
├── src/
│   ├── components/
│   │   ├── admin/           # Admin dashboard & project management
│   │   ├── auth/            # Authentication forms & guards
│   │   ├── common/          # Reusable UI components
│   │   ├── dashboard/       # Client dashboard & project tracking
│   │   ├── landing/         # Landing page sections
│   │   ├── onboarding/      # Multi-step website request form
│   │   └── payment/         # Payment processing components
│   ├── hooks/               # Custom React hooks
│   ├── services/            # API services & integrations
│   │   ├── supabase/        # Database operations
│   │   └── stripe/          # Payment processing
│   ├── types/               # TypeScript type definitions
│   └── utils/               # Helper functions & constants
├── scripts/                 # Database migration scripts
├── supabase/               # Supabase configuration & functions
└── .kiro/specs/websiter/   # Project specifications & requirements
```

---

## 📊 Database Schema (Supabase/PostgreSQL)

### Core Tables

#### `users`

```sql
- id: UUID (primary key)
- email: TEXT (unique)
- name: TEXT
- role: TEXT ('client' | 'admin')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `projects`

```sql
- id: UUID (primary key)
- client_id: UUID (foreign key → users.id)
- title: TEXT
- description: TEXT
- status: TEXT ('new' | 'in_progress' | 'completed')
- priority: TEXT ('low' | 'medium' | 'high')
- website_type: TEXT
- features: JSONB
- customization: JSONB
- total_price: DECIMAL
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
- due_date: TIMESTAMP
```

#### `support_tickets`

```sql
- id: UUID (primary key)
- client_id: UUID (foreign key → users.id)
- project_id: UUID (foreign key → projects.id)
- subject: TEXT
- category: TEXT ('Technical Issue' | 'Design Change' | 'Content Update' | 'General Question')
- priority: TEXT ('low' | 'medium' | 'high' | 'urgent')
- status: TEXT ('open' | 'in_progress' | 'resolved' | 'closed')
- description: TEXT
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### `ticket_responses`

```sql
- id: UUID (primary key)
- ticket_id: UUID (foreign key → support_tickets.id)
- user_id: UUID (foreign key → users.id)
- message: TEXT
- is_admin_response: BOOLEAN
- created_at: TIMESTAMP
```

### Row Level Security (RLS)

- **Clients**: Can only access their own data (projects, tickets, etc.)
- **Admins**: Full access to all data with role-based policies
- **Authentication**: Firebase Auth integration with Supabase

---

## 🎨 User Interface & Experience

### Design System

- **Colors**: Professional blue/gray palette with accent colors
- **Typography**: Clean, readable fonts with proper hierarchy
- **Components**: Consistent design patterns with Tailwind CSS
- **Animations**: Smooth transitions with Framer Motion
- **Accessibility**: WCAG 2.1 AA compliance (planned)

### Key User Flows

#### Client Journey

1. **Landing Page** → Features, pricing, testimonials
2. **Onboarding Flow** → Multi-step form (website type, features, contact info)
3. **Authentication** → Sign up/login with email or Google SSO
4. **Payment** → Stripe integration (currently missing - critical issue)
5. **Dashboard** → Project tracking, progress updates, support tickets
6. **Communication** → Support ticket system for client-admin interaction

#### Admin Journey

1. **Admin Dashboard** → Kanban board with project management
2. **Project Management** → Drag-and-drop status updates, task management
3. **Client Communication** → Support ticket management and responses
4. **Invoice Generation** → PDF invoice creation and management

---

## 🔧 Current Implementation Status

### ✅ Completed Features

- **Landing Page**: Hero, features, pricing, testimonials
- **Onboarding Flow**: Multi-step website request form
- **Authentication**: Email/password + Google SSO via Supabase
- **Client Dashboard**: Project overview, progress tracking
- **Admin Dashboard**: Kanban board, project management
- **Support System**: Ticket creation and basic management
- **Database**: Core schema with RLS policies
- **Invoice System**: PDF generation and management

### ❌ Critical Missing Features

- **Payment Integration**: Stripe payment processing (HIGHEST PRIORITY)
- **Email Notifications**: Automated emails for status updates
- **File Upload**: Project asset management
- **Advanced Support**: Complete ticket management system

### ⚠️ Known Issues

- **Category Column Error**: Support tickets table schema cache issues
- **Admin Role Assignment**: Users need manual admin role assignment
- **Payment Flow**: Complete payment workflow missing
- **Real-time Updates**: Some real-time features need optimization

---

## 🚨 Current Critical Issues

### 1. Support Ticket Category Column Error

**Error**: `Could not find the 'category' column of 'support_tickets' in the schema cache`

**Status**: Schema exists but Supabase cache needs refresh

**Solution**: Run the updated SQL scripts to recreate tables properly

### 2. Admin Role Assignment

**Issue**: Users cannot access admin dashboard without admin role

**Status**: Manual role assignment required

**Solution**: Update user role in database: `UPDATE users SET role = 'admin' WHERE email = 'user@example.com'`

### 3. Payment Integration Missing

**Issue**: Complete payment workflow not implemented

**Status**: Critical blocker for production use

**Impact**: Users cannot complete orders, business model non-functional

---

## 📋 Development Priorities

### Immediate (Critical)

1. **Fix Support Ticket Schema** - Run database migration scripts
2. **Implement Payment Integration** - Stripe payment processing
3. **Admin Role Management** - User role assignment system

### Short Term (High Priority)

1. **Email Notifications** - Automated status updates
2. **File Upload System** - Project asset management
3. **Advanced Support Features** - Complete ticket management

### Medium Term

1. **AI Integration** - Feature suggestions and cost estimation
2. **Template System** - Pre-built website templates
3. **Maintenance Plans** - Recurring billing for ongoing services

---

## 🔐 Security & Authentication

### Authentication Flow

- **Supabase Auth**: Email/password and OAuth providers
- **Role-Based Access**: Client vs Admin permissions
- **Row Level Security**: Database-level access control
- **Session Management**: Automatic token refresh

### Security Measures

- **Input Validation**: Form validation and sanitization
- **SQL Injection Protection**: Parameterized queries via Supabase
- **XSS Protection**: React's built-in XSS prevention
- **CSRF Protection**: Supabase handles CSRF tokens

---

## 💰 Business Model & Pricing

### Package Structure

- **Basic Portfolio**: $299 (simple business websites)
- **E-commerce**: $599 (online stores with payment processing)
- **Custom Solutions**: Variable pricing based on requirements

### Payment Options

- **Single Payment**: Full amount upfront (5% discount)
- **Split Payment**: 50% upfront, 50% on completion
- **Installments**: 3-month payment plans

### Maintenance Plans

- **DIY**: Free (client manages their own site)
- **Peace of Mind**: $75/month (basic maintenance)
- **Growth Partner**: $175/month (advanced features)
- **Success Accelerator**: $300/month (full service)

---

## 🛠️ Development Environment

### Setup Requirements

```bash
# Node.js 18+ required
npm install

# Environment variables needed:
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Database Management

- **Supabase Dashboard**: Web interface for database management
- **Migration Scripts**: Located in `/scripts/` directory
- **Schema Updates**: SQL files for table creation and updates

---

## 📚 Key Files & Components

### Core Application Files

- `src/App.tsx` - Main application component and routing
- `src/main.tsx` - Application entry point
- `src/hooks/useAuth.tsx` - Authentication hook and context
- `src/lib/supabase.ts` - Supabase client configuration

### Important Components

- `src/components/onboarding/OnboardingFlow.tsx` - Multi-step form
- `src/components/admin/AdminDashboard.tsx` - Admin project management
- `src/components/dashboard/ClientDashboard.tsx` - Client project tracking
- `src/services/supabase/projects.ts` - Project database operations

### Configuration Files

- `vite.config.ts` - Vite build configuration
- `tailwind.config.js` - Tailwind CSS configuration
- `package.json` - Dependencies and scripts
- `.env` - Environment variables (not in repo)

---

## 🐛 Debugging & Troubleshooting

### Common Issues

1. **Authentication Errors**: Check Supabase configuration and RLS policies
2. **Database Errors**: Verify table schema and permissions
3. **Build Errors**: Check TypeScript types and imports
4. **Styling Issues**: Verify Tailwind classes and responsive design

### Debugging Tools

- **Browser DevTools**: Network tab for API calls
- **Supabase Dashboard**: Database queries and logs
- **React DevTools**: Component state and props
- **Console Logging**: Extensive logging throughout the application

### Error Handling

- **Try-Catch Blocks**: Comprehensive error handling in services
- **User-Friendly Messages**: Clear error messages for users
- **Logging**: Detailed error logging for debugging
- **Fallback UI**: Graceful degradation for failed operations

---

## 📖 Documentation & Specifications

### Project Documentation

- `.kiro/specs/websiter/requirements.md` - Detailed requirements document
- `.kiro/specs/websiter/design.md` - Technical design document
- `.kiro/specs/websiter/tasks.md` - Implementation task list
- `websiter/USER_WORKFLOW.md` - Complete user journey documentation

### API Documentation

- Supabase auto-generated API docs
- TypeScript interfaces in `src/types/`
- Service layer documentation in code comments

---

## 🚀 Deployment & Production

### Current Status

- **Development**: Fully functional development environment
- **Staging**: Not yet configured
- **Production**: Not yet deployed

### Deployment Requirements

- **Supabase Project**: Production database and auth
- **Stripe Account**: Live payment processing keys
- **Domain**: Custom domain configuration
- **SSL**: HTTPS certificate (handled by hosting provider)

### Performance Considerations

- **Code Splitting**: Vite handles automatic code splitting
- **Image Optimization**: Optimize images for web delivery
- **Database Indexing**: Proper indexes on frequently queried columns
- **Caching**: Implement appropriate caching strategies

---

## 🤝 Team & Collaboration

### Development Workflow

- **Version Control**: Git with feature branches
- **Code Review**: Pull request reviews before merging
- **Testing**: Manual testing and user acceptance testing
- **Documentation**: Keep documentation updated with changes

### Communication

- **Project Management**: Task tracking and progress updates
- **Issue Tracking**: Bug reports and feature requests
- **User Feedback**: Client feedback integration and response

---

## 📞 Support & Maintenance

### Current Support Channels

- **Support Tickets**: In-app ticket system (partially implemented)
- **Email**: Direct email communication
- **Dashboard**: Client-admin communication through platform

### Maintenance Tasks

- **Database Backups**: Regular automated backups
- **Security Updates**: Keep dependencies updated
- **Performance Monitoring**: Monitor application performance
- **User Support**: Respond to client inquiries and issues

---

## 🎯 Next Steps & Roadmap

### Immediate Actions Required

1. **Fix Database Schema Issues** - Resolve support ticket table problems
2. **Implement Payment Processing** - Complete Stripe integration
3. **Admin Role Management** - Streamline admin user creation

### Short-term Goals

1. **Complete Support System** - Full ticket management workflow
2. **Email Automation** - Automated notifications and updates
3. **File Management** - Project asset upload and management

### Long-term Vision

1. **AI Integration** - Smart feature suggestions and cost estimation
2. **Template Marketplace** - Pre-built website templates
3. **Advanced Analytics** - Project performance and client insights
4. **Mobile App** - Native mobile application for clients and admins

---

## 📋 Quick Reference

### Important URLs

- **Development**: http://localhost:5173
- **Supabase Dashboard**: [Your Supabase Project URL]
- **Stripe Dashboard**: [Your Stripe Account URL]

### Key Commands

```bash
# Start development
npm run dev

# Database migrations
# Run SQL scripts in Supabase Dashboard SQL Editor

# Build for production
npm run build

# Deploy (when configured)
npm run deploy
```

### Emergency Contacts

- **Database Issues**: Check Supabase dashboard and logs
- **Payment Issues**: Check Stripe dashboard and webhooks
- **Authentication Issues**: Verify Supabase auth configuration

---

_This document provides a comprehensive overview of the Websiter project for AI agents and developers to understand the complete context, current status, and development priorities._

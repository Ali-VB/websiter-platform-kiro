# Websiter - Professional Website Creation Platform

A comprehensive web application for creating and managing professional websites with an integrated client dashboard, admin panel, and project management system.

## 🚀 Features

### Client Features

- **Step-by-Step Project Creation** - Guided onboarding flow for website projects
- **Interactive Dashboard** - Track project progress, upload assets, and manage payments
- **Asset Upload System** - Upload logos, images, content, and brand materials
- **Payment Integration** - Secure payments with Stripe (partial and full payment options)
- **Real-time Progress Tracking** - Visual project timeline and status updates
- **Support System** - Create tickets and communicate with the team

### Admin Features

- **Comprehensive Admin Dashboard** - Manage all projects, clients, and payments
- **Kanban Board** - Visual project management with drag-and-drop functionality
- **Client Management** - Complete client information and project history
- **Payment Management** - Process payments and track financial data
- **Asset Management** - View and manage all client-uploaded assets
- **Storage Management** - Cleanup tools to optimize Supabase storage usage
- **Database Overview** - Complete system statistics and monitoring

### Technical Features

- **Authentication System** - Secure user authentication with role-based access
- **File Storage** - Supabase storage integration for asset management
- **Responsive Design** - Mobile-friendly interface across all devices
- **Real-time Updates** - Live data synchronization
- **Tax Calculations** - Automatic GST/QST calculation for Canadian clients

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Backend**: Supabase (PostgreSQL, Authentication, Storage)
- **Payments**: Stripe Integration
- **Icons**: Heroicons
- **State Management**: React Hooks, Context API

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd websiter
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env` file in the root directory:

   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

4. **Database Setup**

   - Run the SQL migrations in `database/migrations/` in your Supabase SQL editor
   - Set up the required database tables and policies

5. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🗄️ Database Schema

### Core Tables

- `users` - User accounts and profiles
- `projects` - Website projects and details
- `project_assets` - Client-uploaded files and assets
- `payments` - Payment records and transactions

### Key Features

- Row Level Security (RLS) for data protection
- Automated timestamps and user tracking
- Foreign key relationships for data integrity

## 🔐 Authentication & Security

- **Role-based Access Control** - Client and Admin roles
- **Row Level Security** - Database-level access control
- **Secure File Upload** - Validated file types and sizes
- **Payment Security** - Stripe-secured payment processing

## 📱 User Flows

### Client Journey

1. **Project Creation** - Step-by-step website specification
2. **Account Setup** - Registration or login
3. **Dashboard Access** - Project tracking and asset upload
4. **Payment Processing** - Secure payment with multiple options
5. **Progress Monitoring** - Real-time project updates

### Admin Workflow

1. **Project Management** - Kanban board for project tracking
2. **Client Communication** - Support ticket management
3. **Asset Review** - Access to all client materials
4. **Payment Processing** - Financial management and invoicing
5. **Storage Management** - System optimization tools

## 🎨 Design System

- **Color Palette**: Primary blues, secondary grays, success greens
- **Typography**: System fonts with clear hierarchy
- **Components**: Reusable UI components with consistent styling
- **Animations**: Smooth transitions with Framer Motion
- **Responsive**: Mobile-first design approach

## 🚀 Deployment

### Prerequisites

- Supabase project setup
- Stripe account configuration
- Domain and hosting setup

### Build Process

```bash
npm run build
```

### Environment Variables (Production)

- Configure production Supabase URL and keys
- Set up production Stripe keys
- Configure any additional environment-specific variables

## 📊 Key Metrics & Analytics

- Project completion rates
- Payment processing statistics
- Client engagement metrics
- Storage usage optimization
- System performance monitoring

## 🔧 Development

### Code Structure

```
src/
├── components/          # React components
│   ├── admin/          # Admin dashboard components
│   ├── auth/           # Authentication components
│   ├── common/         # Shared UI components
│   ├── dashboard/      # Client dashboard components
│   └── onboarding/     # Project creation flow
├── hooks/              # Custom React hooks
├── services/           # API and external service integrations
├── types/              # TypeScript type definitions
└── utils/              # Utility functions and helpers
```

### Key Components

- **OnboardingFlow** - Multi-step project creation
- **ClientDashboard** - Main client interface
- **AdminDashboard** - Administrative interface
- **ProjectOverview** - Project management with asset uploads
- **PaymentHistory** - Payment tracking and processing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For technical support or questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation in `/docs`

---

**Built with ❤️ for professional website creation**

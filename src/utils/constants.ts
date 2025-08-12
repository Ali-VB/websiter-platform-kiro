// Application constants
export const APP_NAME = 'Websiter';
export const APP_VERSION = '1.0.0';

// API endpoints
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Supabase configuration keys
export const SUPABASE_CONFIG_KEYS = {
  URL: 'VITE_SUPABASE_URL',
  ANON_KEY: 'VITE_SUPABASE_ANON_KEY',
} as const;

// Stripe configuration
export const STRIPE_CONFIG = {
  PUBLISHABLE_KEY: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
} as const;

// WordPress Website types
export const WORDPRESS_SITE_TYPES = {
  COMPANY_PORTFOLIO: 'company_portfolio',
  PERSONAL_RESUME: 'personal_resume',
  ECOMMERCE: 'ecommerce',
  LANDING_PAGE: 'landing_page',
  BLOG_MAGAZINE: 'blog_magazine',
  CONTACT_MINI_SITE: 'contact_mini_site',
} as const;

// Feature categories
export const FEATURE_CATEGORIES = {
  DESIGN: 'design',
  FUNCTIONALITY: 'functionality',
  SEO: 'seo',
  ECOMMERCE: 'ecommerce',
} as const;

// Project statuses
export const PROJECT_STATUS = {
  NEW: 'new',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

// Task statuses
export const TASK_STATUS = {
  TODO: 'todo',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELED: 'canceled',
} as const;

// Payment types
export const PAYMENT_TYPES = {
  INITIAL: 'initial',
  FINAL: 'final',
  MAINTENANCE: 'maintenance',
} as const;

// User roles
export const USER_ROLES = {
  CLIENT: 'client',
  ADMIN: 'admin',
} as const;

// Package types
export const PACKAGE_TYPES = {
  BASIC_PORTFOLIO: 'basic_portfolio',
  ECOMMERCE: 'ecommerce',
  CUSTOM: 'custom',
} as const;

// Fixed pricing
export const PRICING = {
  BASIC_PORTFOLIO: 299,
  ECOMMERCE: 599,
  MAINTENANCE_BASIC: 10,
  MAINTENANCE_PREMIUM: 25,
  MAINTENANCE_ENTERPRISE: 50,
} as const;

// File upload limits
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ],
} as const;

// Animation durations
export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  SLOWER: 800,
} as const;

// Breakpoints (matching Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Local storage keys
export const STORAGE_KEYS = {
  USER_PREFERENCES: 'websiter_user_preferences',
  FORM_DRAFT: 'websiter_form_draft',
  THEME: 'websiter_theme',
} as const;

// Error codes
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTH_ERROR: 'AUTH_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  PAYMENT_ERROR: 'PAYMENT_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  NOT_FOUND: 'NOT_FOUND',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  ACCOUNT_CREATED: 'Account created successfully!',
  LOGIN_SUCCESS: 'Welcome back!',
  FORM_SUBMITTED: 'Your website request has been submitted!',
  PAYMENT_SUCCESS: 'Payment processed successfully!',
  MESSAGE_SENT: 'Message sent successfully!',
  FILE_UPLOADED: 'File uploaded successfully!',
} as const;

// Error messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  VALIDATION: 'Please check your input and try again.',
  AUTH_REQUIRED: 'Please log in to continue.',
  INSUFFICIENT_PERMISSIONS: 'You don\'t have permission to perform this action.',
  FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
  INVALID_FILE_TYPE: 'File type not supported.',
} as const;
// User and Authentication
export interface User {
  id: string;
  email: string;
  name: string;
  role: "client" | "admin";
  createdAt: Date;
  onboardingCompleted: boolean;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark";
  notifications: boolean;
  language: string;
}

// Website Request and Project
export interface WebsiteRequest {
  id: string;
  clientId: string;
  websiteType: "portfolio" | "ecommerce" | "blog" | "business";
  features: Feature[];
  customization: Customization;
  clientDetails: ClientDetails;
  templateId?: string;
  status: "submitted" | "quoted" | "in_progress" | "completed";
  createdAt: Date;
  updatedAt: Date;
}

export interface Feature {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "design" | "functionality" | "seo" | "ecommerce";
  selected: boolean;
}

export interface Customization {
  colorScheme: string;
  branding: {
    logo?: string;
    companyName: string;
    tagline?: string;
  };
  content: {
    aboutText?: string;
    services?: string[];
    contactInfo: ContactInfo;
  };
}

export interface ClientDetails {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  budget: number;
  timeline: string;
  additionalNotes?: string;
  totalPrice?: number;
  domain?: { hasExisting: boolean; name?: string; };
}

export interface ContactInfo {
  email: string;
  phone?: string;
  address?: string;
  socialMedia?: SocialMediaLinks;
}

export interface SocialMediaLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
}

// Project Management
export interface Project {
  id: string;
  requestId: string;
  clientId: string;
  clientName: string;
  clientEmail: string;
  adminId: string | null;
  title: string;
  description: string;
  status: "new" | "submitted" | "waiting_for_confirmation" | "confirmed" | "in_progress" | "in_design" | "review" | "final_delivery" | "completed";
  priority: "low" | "medium" | "high";
  price: number;
  websiteType: string;
  contactInfo: any;
  websitePurpose: any;
  features: any[];
  websiteInspiration: any[];
  designPreferences: any;
  paymentOption: string;
  onboardingData: any;
  // tasks and milestones removed - using simple approach
  payments: Payment[];
  messageCount?: number;
  // taskCount removed - using simple approach
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  urgencyLevel: "normal" | "urgent" | "overdue";
  isQuote: boolean;
  users?: any;
  // New fields for enhanced project management
  estimatedHours?: number;
  estimatedDays?: number;
  hoursNeeded?: number;
  targetCompletionDate?: string;
  adminTodos?: AdminTodo[];
  adminNotes?: string;
}

// Admin Todo Item
export interface AdminTodo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  completedAt?: Date;
}

// Task interface removed - using simple approach without tasks

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: "pending" | "completed";
  completedAt?: Date;
  order: number;
}

// Payments and Quotes
export interface Quote {
  id: string;
  projectId: string;
  totalAmount: number;
  initialPayment: number;
  finalPayment: number;
  packageType: "basic_portfolio" | "ecommerce" | "custom";
  breakdown: QuoteBreakdown[];
  status: "draft" | "sent" | "accepted" | "rejected";
  createdAt: Date;
  expiresAt: Date;
}

export interface QuoteBreakdown {
  item: string;
  description: string;
  price: number;
  category: string;
}

export interface Payment {
  id: string;
  projectId: string;
  clientId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "canceled";
  paymentType: "initial" | "final" | "maintenance";
  paymentMethod?: string;
  createdAt: Date;
  processedAt?: Date;
  metadata?: Record<string, unknown>;
}

// Templates and Packages
export interface Template {
  id: string;
  name: string;
  description: string;
  category: "portfolio" | "ecommerce" | "blog" | "business";
  industry: string[];
  features: string[];
  previewImages: string[];
  mobilePreview: string;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  limitations?: string[];
  popular: boolean;
  paymentOptions: PaymentOption[];
}

export interface PaymentOption {
  type: "single" | "installments";
  installments?: number;
  monthlyAmount?: number;
  setupFee?: number;
}

// Messaging and Communication
export interface Message {
  id: string;
  projectId: string;
  senderId: string;
  recipientId: string;
  content: string;
  attachments?: FileAttachment[];
  isRead: boolean;
  createdAt: Date;
  threadId?: string;
}

export interface FileAttachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedBy: string;
  uploadedAt: Date;
}

// AI and Assistance
export interface AIResponse {
  suggestions: FeatureSuggestion[];
  costEstimate: CostEstimate;
  reasoning: string;
  confidence: number;
}

export interface FeatureSuggestion {
  featureId: string;
  reason: string;
  priority: "high" | "medium" | "low";
  estimatedValue: number;
}

export interface CostEstimate {
  basePrice: number;
  features: FeatureCost[];
  total: number;
  breakdown: CostBreakdown[];
}

export interface FeatureCost {
  featureId: string;
  name: string;
  price: number;
}

export interface CostBreakdown {
  category: string;
  amount: number;
  items: string[];
}

// Maintenance and Support
export interface MaintenancePlan {
  id: string;
  clientId: string;
  projectId: string;
  planType: "basic" | "premium" | "enterprise";
  monthlyPrice: number;
  features: string[];
  status: "active" | "paused" | "canceled";
  billingCycle: "monthly" | "yearly";
  nextBillingDate: Date;
  createdAt: Date;
}

export interface SupportTicket {
  id: string;
  clientId: string;
  projectId?: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  status: "open" | "in_progress" | "resolved" | "closed";
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Help and Resources
export interface HelpArticle {
  id: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  difficulty: "beginner" | "intermediate" | "advanced";
  videoUrl?: string;
  viewCount: number;
  helpful: number;
  notHelpful: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  isActive: boolean;
}
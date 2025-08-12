// Enhanced Quote Management Types
export interface ProjectQuote {
  id: string;
  projectRequestId: string;
  clientId: string;
  adminId?: string;
  status: "pending" | "under_review" | "edited" | "confirmed" | "rejected";
  originalQuote: QuoteDetails;
  editedQuote?: QuoteDetails;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  confirmedAt?: Date;
  expiresAt: Date;
  urgencyLevel: "normal" | "urgent" | "overdue";
  clientFeedback?: ClientFeedback[];
  adminNotes?: string;
}

export interface QuoteDetails {
  lineItems: QuoteLineItem[];
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  totalAmount: number;
  initialPaymentPercentage: number;
  initialPaymentAmount: number;
  finalPaymentAmount: number;
  estimatedTimeline: ProjectTimeline;
  terms: string;
}

export interface QuoteLineItem {
  id: string;
  description: string;
  category: "design" | "development" | "hosting" | "domain" | "maintenance" | "custom";
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isEditable: boolean;
  isCustom: boolean;
}

export interface ProjectTimeline {
  estimatedStartDate: Date;
  estimatedCompletionDate: Date;
  milestones: TimelineMilestone[];
}

export interface TimelineMilestone {
  id: string;
  title: string;
  description: string;
  estimatedDate: Date;
  order: number;
}

export interface ClientFeedback {
  id: string;
  quoteId: string;
  clientId: string;
  feedbackType: "accept" | "request_changes" | "decline";
  message?: string;
  requestedChanges?: ChangeRequest[];
  createdAt: Date;
}

export interface ChangeRequest {
  id: string;
  category: string;
  description: string;
  priority: "low" | "medium" | "high";
  estimatedImpact: "none" | "minor" | "moderate" | "major";
}

// Admin Dashboard Interfaces
export interface AdminDashboardData {
  pendingQuotes: ProjectQuote[];
  activeProjects: EnhancedProject[];
  recentActivity: ActivityLog[];
  workflowMetrics: WorkflowMetrics;
  overdueItems: OverdueItem[];
}

export interface WorkflowMetrics {
  averageResponseTime: number;
  pendingRequestCount: number;
  conversionRate: number;
  totalRevenue: number;
  monthlyStats: MonthlyStats[];
}

export interface MonthlyStats {
  month: string;
  quotesGenerated: number;
  projectsConfirmed: number;
  revenue: number;
  averageProjectValue: number;
}

export interface OverdueItem {
  id: string;
  type: "quote" | "project" | "payment";
  title: string;
  daysOverdue: number;
  priority: "medium" | "high" | "urgent";
  assignedTo?: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  userType: "client" | "admin";
  action: string;
  entityType: "quote" | "project" | "invoice" | "payment";
  entityId: string;
  description: string;
  metadata?: Record<string, any>;
  timestamp: Date;
}

export interface EnhancedProject {
  id: string;
  quoteId: string;
  clientId: string;
  adminId: string;
  title: string;
  description: string;
  status: "confirmed" | "in_progress" | "review" | "completed" | "on_hold";
  priority: "low" | "medium" | "high" | "urgent";
  confirmedQuote: QuoteDetails;
  actualTimeline: ProjectTimeline;
  projectManager: ProjectManager;
  clientApprovalStatus: ApprovalStatus;
  paymentStatus: PaymentStatus;
  deliverables: Deliverable[];
  communicationThread: CommunicationMessage[];
  createdAt: Date;
  updatedAt: Date;
  confirmedAt: Date;
  completedAt?: Date;
}

export interface ProjectManager {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
}

export interface ApprovalStatus {
  isApproved: boolean;
  approvedAt?: Date;
  approvalMethod: "dashboard" | "email" | "phone";
  clientSignature?: string;
}

export interface PaymentStatus {
  initialPayment: PaymentRecord;
  finalPayment?: PaymentRecord;
  installments?: PaymentRecord[];
  totalPaid: number;
  remainingBalance: number;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed" | "refunded";
  paymentMethod: string;
  transactionId?: string;
  processedAt?: Date;
  failureReason?: string;
}

export interface Deliverable {
  id: string;
  title: string;
  description: string;
  type: "design" | "development" | "content" | "documentation";
  status: "pending" | "in_progress" | "review" | "approved" | "delivered";
  fileUrl?: string;
  previewUrl?: string;
  deliveredAt?: Date;
  clientFeedback?: string;
}

export interface CommunicationMessage {
  id: string;
  senderId: string;
  senderType: "client" | "admin";
  message: string;
  attachments?: string[];
  timestamp: Date;
  isRead: boolean;
}

// Quote Filters and Search
export interface QuoteFilters {
  status: string;
  client: string;
  projectType: string;
  dateRange: string;
  urgency: string;
  adminAssigned: string;
}

export interface QuoteSearchParams {
  query?: string;
  filters: QuoteFilters;
  sortBy: "created_at" | "updated_at" | "total_amount" | "urgency";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}

// Client Information for Quotes
export interface QuoteClientInfo {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  totalProjects: number;
  totalSpent: number;
  lastProjectDate?: Date;
  preferredContactMethod: "email" | "phone" | "sms";
}
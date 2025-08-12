// Standard API Response
export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

// AI Suggestions Response
export interface AISuggestionsResponse {
  suggestions: import('./index').FeatureSuggestion[];
  costEstimate: import('./index').CostEstimate;
  reasoning: string;
  confidence: number;
  processingTime: number;
}

// Payment Intent Response
export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}

// Firebase Function Request/Response Types
export interface CreatePaymentIntentRequest {
  projectId: string;
  amount: number;
  currency?: string;
  paymentType: "initial" | "final" | "maintenance";
}

export interface SendEmailRequest {
  to: string;
  templateId: string;
  templateData: Record<string, unknown>;
}

export interface AIAssistanceRequest {
  businessDescription: string;
  websiteType: string;
  selectedFeatures: string[];
  budget?: number;
}

// External API Types
export interface CalendlyBookingRequest {
  event_type: string;
  invitee: {
    name: string;
    email: string;
  };
  start_time: string;
}

export interface StripeWebhookEvent {
  id: string;
  object: string;
  type: string;
  data: {
    object: Record<string, unknown>;
  };
  created: number;
}
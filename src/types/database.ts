export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: 'client' | 'admin'
          created_at: string
          updated_at: string
          onboarding_completed: boolean
          preferences: Json | null
        }
        Insert: {
          id: string
          email: string
          name: string
          role?: 'client' | 'admin'
          created_at?: string
          updated_at?: string
          onboarding_completed?: boolean
          preferences?: Json | null
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: 'client' | 'admin'
          created_at?: string
          updated_at?: string
          onboarding_completed?: boolean
          preferences?: Json | null
        }
      }
      // website_requests table removed - using simple approach with projects only
      projects: {
        Row: {
          id: string
          request_id: string | null
          client_id: string
          admin_id: string | null
          title: string
          description: string
          status: 'new' | 'submitted' | 'waiting_for_confirmation' | 'confirmed' | 'in_progress' | 'in_design' | 'review' | 'final_delivery' | 'completed'
          priority: 'low' | 'medium' | 'high'
          price: number
          website_type: string
          contact_info: any
          website_purpose: any
          additional_features: any[]
          website_inspiration: any[]
          design_preferences: any
          payment_option: string
          onboarding_data: any
          created_at: string
          updated_at: string
          due_date: string | null
          estimated_hours: number | null
          estimated_days: number | null
          hours_needed: number | null
          target_completion_date: string | null
          admin_todos: Json | null
          admin_notes: string | null
        }
        Insert: {
          id?: string
          request_id?: string | null
          client_id: string
          admin_id?: string | null
          title: string
          description: string
          status?: 'new' | 'submitted' | 'waiting_for_confirmation' | 'confirmed' | 'in_progress' | 'in_design' | 'review' | 'final_delivery' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          price?: number
          website_type?: string
          contact_info?: any
          website_purpose?: any
          additional_features?: any[]
          website_inspiration?: any[]
          design_preferences?: any
          payment_option?: string
          onboarding_data?: any
          created_at?: string
          updated_at?: string
          due_date?: string | null
          estimated_hours?: number | null
          estimated_days?: number | null
          hours_needed?: number | null
          target_completion_date?: string | null
          admin_todos?: Json | null
          admin_notes?: string | null
        }
        Update: {
          id?: string
          request_id?: string
          client_id?: string
          admin_id?: string | null
          title?: string
          description?: string
          status?: 'new' | 'submitted' | 'waiting_for_confirmation' | 'confirmed' | 'in_progress' | 'in_design' | 'review' | 'final_delivery' | 'completed'
          priority?: 'low' | 'medium' | 'high'
          created_at?: string
          updated_at?: string
          due_date?: string | null
          estimated_hours?: number | null
          estimated_days?: number | null
          hours_needed?: number | null
          target_completion_date?: string | null
          admin_todos?: Json | null
          admin_notes?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          project_id: string
          client_id: string
          stripe_payment_intent_id: string | null
          amount: number
          currency: string
          status: 'pending' | 'succeeded' | 'failed' | 'canceled'
          payment_type: 'initial' | 'final' | 'maintenance'
          payment_method: string | null
          created_at: string
          processed_at: string | null
          metadata: Json | null
        }
        Insert: {
          id?: string
          project_id: string
          client_id: string
          stripe_payment_intent_id?: string | null
          amount: number
          currency?: string
          status?: 'pending' | 'succeeded' | 'failed' | 'canceled'
          payment_type: 'initial' | 'final' | 'maintenance'
          payment_method?: string | null
          created_at?: string
          processed_at?: string | null
          metadata?: Json | null
        }
        Update: {
          id?: string
          project_id?: string
          client_id?: string
          stripe_payment_intent_id?: string | null
          amount?: number
          currency?: string
          status?: 'pending' | 'succeeded' | 'failed' | 'canceled'
          payment_type?: 'initial' | 'final' | 'maintenance'
          payment_method?: string | null
          created_at?: string
          processed_at?: string | null
          metadata?: Json | null
        }
      }
      support_tickets: {
        Row: {
          id: string
          client_id: string
          project_id: string | null
          subject: string
          category: 'Technical Issue' | 'Design Change' | 'Content Update' | 'General Question'
          description: string
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'open' | 'in_progress' | 'resolved' | 'closed'
          assigned_to: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          project_id?: string | null
          subject: string
          category: 'Technical Issue' | 'Design Change' | 'Content Update' | 'General Question'
          description: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          project_id?: string | null
          subject?: string
          category?: 'Technical Issue' | 'Design Change' | 'Content Update' | 'General Question'
          description?: string
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'open' | 'in_progress' | 'resolved' | 'closed'
          assigned_to?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      ticket_responses: {
        Row: {
          id: string
          ticket_id: string
          user_id: string
          message: string
          is_admin_response: boolean
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          user_id: string
          message: string
          is_admin_response?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          user_id?: string
          message?: string
          is_admin_response?: boolean
          created_at?: string
        }
      }
      ticket_attachments: {
        Row: {
          id: string
          ticket_id: string
          file_name: string
          file_path: string
          file_url: string
          file_size: number
          file_type: string
          uploaded_by: string
          created_at: string
        }
        Insert: {
          id?: string
          ticket_id: string
          file_name: string
          file_path: string
          file_url: string
          file_size: number
          file_type: string
          uploaded_by: string
          created_at?: string
        }
        Update: {
          id?: string
          ticket_id?: string
          file_name?: string
          file_path?: string
          file_url?: string
          file_size?: number
          file_type?: string
          uploaded_by?: string
          created_at?: string
        }
      }
      client_notes: {
        Row: {
          id: string
          client_id: string
          client_email: string
          text: string
          completed: boolean
          created_at: string
          completed_at: string | null
          created_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          client_id: string
          client_email: string
          text: string
          completed?: boolean
          created_at?: string
          completed_at?: string | null
          created_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          client_email?: string
          text?: string
          completed?: boolean
          created_at?: string
          completed_at?: string | null
          created_by?: string | null
          updated_at?: string
        }
      }

    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
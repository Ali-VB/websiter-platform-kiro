import { supabase } from '../../lib/supabase';
import { StorageService, type FileUploadResult } from './storage';
import type { Database } from '../../types/database';

type Tables = Database['public']['Tables'];
type TicketInsert = Tables['support_tickets']['Insert'];
type TicketRow = Tables['support_tickets']['Row'];
type TicketResponseInsert = Tables['ticket_responses']['Insert'];
type TicketResponseRow = Tables['ticket_responses']['Row'];

export interface CreateTicketData {
  subject: string;
  category: 'Technical Issue' | 'Design Change' | 'Content Update' | 'General Question';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  description: string;
  projectId?: string;
  attachments?: File[];
}

export interface CreateTicketResponseData {
  ticketId: string;
  message: string;
  isAdminResponse: boolean;
}

export class TicketService {
  // Create a new support ticket
  static async createTicket(data: CreateTicketData, clientId: string): Promise<TicketRow> {
    try {
      console.log('🎫 Creating support ticket...', data);

      const ticketData: TicketInsert = {
        client_id: clientId,
        project_id: data.projectId || null,
        subject: data.subject,
        category: data.category,
        priority: data.priority,
        description: data.description,
        status: 'open',
      };

      const { data: ticket, error } = await supabase
        .from('support_tickets')
        .insert([ticketData])
        .select(`
          *,
          users!support_tickets_client_id_fkey(id, name, email),
          projects(id, title)
        `)
        .single();

      if (error) {
        console.error('❌ Database error creating ticket:', error);
        throw error;
      }

      // Handle file attachments if provided
      if (data.attachments && data.attachments.length > 0) {
        try {
          console.log('📎 Uploading attachments...', data.attachments.length);
          
          // Upload files to storage
          const uploadResults = await StorageService.uploadFiles(
            data.attachments,
            'ticket-attachments',
            `tickets/${ticket.id}`
          );

          // Save attachment records to database
          const attachmentRecords = uploadResults.map(result => ({
            ticket_id: ticket.id,
            file_name: result.name,
            file_path: result.path,
            file_url: result.url,
            file_size: result.size,
            file_type: result.type,
            uploaded_by: clientId
          }));

          const { error: attachmentError } = await supabase
            .from('ticket_attachments')
            .insert(attachmentRecords);

          if (attachmentError) {
            console.error('❌ Error saving attachments:', attachmentError);
            // Don't fail the ticket creation, just log the error
          } else {
            console.log('✅ Attachments uploaded successfully:', uploadResults.length);
          }
        } catch (attachmentError) {
          console.error('❌ Error handling attachments:', attachmentError);
          // Don't fail the ticket creation, just log the error
        }
      }

      console.log('✅ Ticket created successfully:', ticket);
      return ticket;
    } catch (error) {
      console.error('❌ Error creating ticket:', error);
      throw error;
    }
  }

  // Get tickets for a specific client
  static async getClientTickets(clientId: string): Promise<TicketRow[]> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          users!support_tickets_client_id_fkey(id, name, email),
          projects(id, title),
          ticket_responses(
            id,
            message,
            is_admin_response,
            created_at,
            users!ticket_responses_user_id_fkey(id, name, email)
          ),
          ticket_attachments(
            id,
            file_name,
            file_url,
            file_size,
            file_type,
            created_at
          )
        `)
        .eq('client_id', clientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching client tickets:', error);
      throw error;
    }
  }

  // Get all tickets (admin)
  static async getAllTickets(): Promise<TicketRow[]> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select(`
          *,
          users!support_tickets_client_id_fkey(id, name, email),
          projects(id, title),
          ticket_responses(
            id,
            message,
            is_admin_response,
            created_at,
            users!ticket_responses_user_id_fkey(id, name, email)
          ),
          ticket_attachments(
            id,
            file_name,
            file_url,
            file_size,
            file_type,
            created_at
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching all tickets:', error);
      throw error;
    }
  }

  // Update ticket status
  static async updateTicketStatus(
    ticketId: string,
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
  ): Promise<TicketRow> {
    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating ticket status:', error);
      throw error;
    }
  }

  // Add response to ticket
  static async addTicketResponse(data: CreateTicketResponseData, userId: string): Promise<TicketResponseRow> {
    try {
      const responseData: TicketResponseInsert = {
        ticket_id: data.ticketId,
        user_id: userId,
        message: data.message,
        is_admin_response: data.isAdminResponse,
      };

      const { data: response, error } = await supabase
        .from('ticket_responses')
        .insert([responseData])
        .select(`
          *,
          users!ticket_responses_user_id_fkey(id, name, email)
        `)
        .single();

      if (error) throw error;

      // Update ticket's updated_at timestamp
      await supabase
        .from('support_tickets')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', data.ticketId);

      return response;
    } catch (error) {
      console.error('Error adding ticket response:', error);
      throw error;
    }
  }

  // Subscribe to ticket updates for client
  static subscribeToClientTickets(clientId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`client_tickets:${clientId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets',
          filter: `client_id=eq.${clientId}`,
        },
        callback
      )
      .subscribe();
  }

  // Subscribe to all tickets (admin)
  static subscribeToAllTickets(callback: (payload: any) => void) {
    return supabase
      .channel('all_tickets')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'support_tickets',
        },
        callback
      )
      .subscribe();
  }
}
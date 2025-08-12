import { supabase } from '../../lib/supabase';

export interface ClientNote {
    id: string;
    clientId: string;
    clientEmail: string;
    text: string;
    completed: boolean;
    createdAt: Date;
    completedAt?: Date;
    createdBy?: string;
    updatedAt: Date;
}

export class ClientNotesService {
    // Get all notes for a specific client
    static async getClientNotes(clientId: string, clientEmail: string): Promise<ClientNote[]> {
        try {
            console.log('📝 Fetching client notes for:', { clientId, clientEmail });
            
            // Try to fetch by client_id first, then by email if no results
            let { data, error } = await supabase
                .from('client_notes')
                .select('*')
                .eq('client_id', clientId)
                .order('created_at', { ascending: false });

            // If no results by client_id, try by email
            if (!error && (!data || data.length === 0)) {
                const emailResult = await supabase
                    .from('client_notes')
                    .select('*')
                    .eq('client_email', clientEmail)
                    .order('created_at', { ascending: false });
                
                if (!emailResult.error && emailResult.data) {
                    data = [...(data || []), ...emailResult.data];
                }
            }

            if (error) {
                console.error('❌ Error fetching client notes:', error);
                throw error;
            }

            console.log('✅ Client notes fetched:', data?.length || 0, 'notes');
            
            return (data || []).map(note => ({
                id: note.id,
                clientId: note.client_id,
                clientEmail: note.client_email,
                text: note.text,
                completed: note.completed,
                createdAt: new Date(note.created_at),
                completedAt: note.completed_at ? new Date(note.completed_at) : undefined,
                createdBy: note.created_by || undefined,
                updatedAt: new Date(note.updated_at)
            }));
        } catch (error) {
            console.error('❌ Failed to fetch client notes:', error);
            throw error;
        }
    }

    // Add a new note for a client
    static async addClientNote(
        clientId: string,
        clientEmail: string,
        text: string
    ): Promise<ClientNote> {
        try {
            console.log('➕ Adding client note:', { clientId, clientEmail, text });
            
            const user = await supabase.auth.getUser();
            
            const insertData: any = {
                client_id: clientId,
                client_email: clientEmail,
                text: text.trim(),
                completed: false
            };
            
            if (user.data.user?.id) {
                insertData.created_by = user.data.user.id;
            }
            
            const { data, error } = await supabase
                .from('client_notes')
                .insert(insertData)
                .select()
                .single();

            if (error) {
                console.error('❌ Error adding client note:', error);
                throw error;
            }

            console.log('✅ Client note added successfully');
            
            return {
                id: data.id,
                clientId: data.client_id,
                clientEmail: data.client_email,
                text: data.text,
                completed: data.completed,
                createdAt: new Date(data.created_at),
                completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
                createdBy: data.created_by || undefined,
                updatedAt: new Date(data.updated_at)
            };
        } catch (error) {
            console.error('❌ Failed to add client note:', error);
            throw error;
        }
    }

    // Toggle note completion status
    static async toggleClientNote(noteId: string, completed: boolean): Promise<void> {
        try {
            console.log('🔄 Toggling client note:', { noteId, completed });
            
            const updateData: any = {
                completed,
                updated_at: new Date().toISOString()
            };

            if (completed) {
                updateData.completed_at = new Date().toISOString();
            } else {
                updateData.completed_at = null;
            }

            const { error } = await supabase
                .from('client_notes')
                .update(updateData)
                .eq('id', noteId);

            if (error) {
                console.error('❌ Error toggling client note:', error);
                throw error;
            }

            console.log('✅ Client note toggled successfully');
        } catch (error) {
            console.error('❌ Failed to toggle client note:', error);
            throw error;
        }
    }

    // Update note text
    static async updateClientNote(noteId: string, text: string): Promise<void> {
        try {
            console.log('📝 Updating client note:', { noteId, text });
            
            const { error } = await supabase
                .from('client_notes')
                .update({
                    text: text.trim(),
                    updated_at: new Date().toISOString()
                })
                .eq('id', noteId);

            if (error) {
                console.error('❌ Error updating client note:', error);
                throw error;
            }

            console.log('✅ Client note updated successfully');
        } catch (error) {
            console.error('❌ Failed to update client note:', error);
            throw error;
        }
    }

    // Delete a client note
    static async deleteClientNote(noteId: string): Promise<void> {
        try {
            console.log('🗑️ Deleting client note:', noteId);
            
            const { error } = await supabase
                .from('client_notes')
                .delete()
                .eq('id', noteId);

            if (error) {
                console.error('❌ Error deleting client note:', error);
                throw error;
            }

            console.log('✅ Client note deleted successfully');
        } catch (error) {
            console.error('❌ Failed to delete client note:', error);
            throw error;
        }
    }

    // Get notes statistics for a client
    static async getClientNotesStats(clientId: string, clientEmail: string): Promise<{
        total: number;
        completed: number;
        pending: number;
    }> {
        try {
            const notes = await this.getClientNotes(clientId, clientEmail);
            
            return {
                total: notes.length,
                completed: notes.filter(note => note.completed).length,
                pending: notes.filter(note => !note.completed).length
            };
        } catch (error) {
            console.error('❌ Failed to get client notes stats:', error);
            throw error;
        }
    }

    // Subscribe to real-time updates for client notes
    static subscribeToClientNotes(
        clientId: string,
        clientEmail: string,
        callback: (payload: any) => void
    ) {
        return supabase
            .channel(`client_notes_${clientId}_${Date.now()}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'client_notes'
                },
                (payload) => {
                    // Filter on the client side to avoid complex filter syntax
                    const record = payload.new || payload.old;
                    if (record && (record.client_id === clientId || record.client_email === clientEmail)) {
                        callback(payload);
                    }
                }
            )
            .subscribe();
    }
}
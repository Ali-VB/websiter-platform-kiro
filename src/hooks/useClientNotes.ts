import { useState, useEffect } from 'react';
import { ClientNotesService, type ClientNote } from '../services/supabase/clientNotes';

export function useClientNotes(clientId: string, clientEmail: string) {
    const [notes, setNotes] = useState<ClientNote[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadNotes = async () => {
            try {
                setLoading(true);
                setError(null);
                const clientNotes = await ClientNotesService.getClientNotes(clientId, clientEmail);
                setNotes(clientNotes);
            } catch (err: any) {
                console.error('Failed to load client notes:', err);
                setError(err.message || 'Failed to load notes');
            } finally {
                setLoading(false);
            }
        };

        if (clientId && clientEmail) {
            loadNotes();

            // Subscribe to real-time updates
            const subscription = ClientNotesService.subscribeToClientNotes(
                clientId,
                clientEmail,
                (payload) => {
                    console.log('📡 Real-time update received:', payload);
                    // Reload notes when changes occur from other sessions
                    loadNotes();
                }
            );

            return () => {
                subscription.unsubscribe();
            };
        }
    }, [clientId, clientEmail]);

    const addNote = async (text: string): Promise<void> => {
        if (!text.trim()) return;
        
        try {
            const newNote = await ClientNotesService.addClientNote(clientId, clientEmail, text.trim());
            // Immediately update local state for instant feedback
            setNotes(prevNotes => [newNote, ...prevNotes]);
        } catch (error) {
            console.error('Failed to add note:', error);
            throw error;
        }
    };

    const toggleNote = async (noteId: string): Promise<void> => {
        try {
            const note = notes.find(n => n.id === noteId);
            if (note) {
                // Optimistically update local state first
                setNotes(prevNotes => 
                    prevNotes.map(n => 
                        n.id === noteId 
                            ? { 
                                ...n, 
                                completed: !n.completed,
                                completedAt: !n.completed ? new Date() : undefined
                            }
                            : n
                    )
                );
                
                await ClientNotesService.toggleClientNote(noteId, !note.completed);
            }
        } catch (error) {
            console.error('Failed to toggle note:', error);
            // Revert optimistic update on error
            const originalNote = notes.find(n => n.id === noteId);
            if (originalNote) {
                setNotes(prevNotes => 
                    prevNotes.map(n => n.id === noteId ? originalNote : n)
                );
            }
            throw error;
        }
    };

    const deleteNote = async (noteId: string): Promise<void> => {
        const noteToDelete = notes.find(n => n.id === noteId);
        try {
            // Store the note for potential rollback
            
            // Optimistically remove from local state
            setNotes(prevNotes => prevNotes.filter(n => n.id !== noteId));
            
            await ClientNotesService.deleteClientNote(noteId);
        } catch (error) {
            console.error('Failed to delete note:', error);
            // Revert optimistic update on error
            if (noteToDelete) {
                setNotes(prevNotes => [...prevNotes, noteToDelete].sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                ));
            }
            throw error;
        }
    };

    const updateNote = async (noteId: string, text: string): Promise<void> => {
        if (!text.trim()) return;
        const originalNote = notes.find(n => n.id === noteId);
        
        try {
            // Store original text for potential rollback
            
            // Optimistically update local state
            setNotes(prevNotes => 
                prevNotes.map(n => 
                    n.id === noteId 
                        ? { ...n, text: text.trim(), updated_at: new Date().toISOString() }
                        : n
                )
            );
            
            await ClientNotesService.updateClientNote(noteId, text.trim());
        } catch (error) {
            console.error('Failed to update note:', error);
            // Revert optimistic update on error
            if (originalNote) {
                setNotes(prevNotes => 
                    prevNotes.map(n => n.id === noteId ? originalNote : n)
                );
            }
            throw error;
        }
    };

    const getStats = () => {
        return {
            total: notes.length,
            completed: notes.filter(note => note.completed).length,
            pending: notes.filter(note => !note.completed).length,
            completionRate: notes.length > 0 ? (notes.filter(note => note.completed).length / notes.length) * 100 : 0
        };
    };

    return {
        notes,
        loading,
        error,
        addNote,
        toggleNote,
        deleteNote,
        updateNote,
        stats: getStats()
    };
}
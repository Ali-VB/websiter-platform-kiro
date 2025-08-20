import { supabase } from '../../lib/supabase';

export interface ContactSubmission {
    id?: string;
    name: string;
    email: string;
    message: string;
    created_at?: string;
}

export const ContactSubmissionsService = {
    async addSubmission(submission: ContactSubmission): Promise<ContactSubmission> {
        const { data, error } = await supabase
            .from('contact_submissions')
            .insert(submission)
            .select()
            .single();

        if (error) {
            console.error('Error adding contact submission:', error);
            throw new Error(error.message);
        }

        return data;
    },

    async getSubmissions(): Promise<ContactSubmission[]> {
        const { data, error } = await supabase
            .from('contact_submissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching contact submissions:', error);
            throw new Error(error.message);
        }

        return data || [];
    },

    async deleteSubmission(id: string): Promise<void> {
        const { error } = await supabase
            .from('contact_submissions')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting contact submission:', error);
            throw new Error(error.message);
        }
    },
};
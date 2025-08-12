// Simple script to clear all projects from the database
// Run this with: node scripts/clear-projects.js

import { createClient } from '@supabase/supabase-js';

// You'll need to replace these with your actual values
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseServiceKey = 'YOUR_SERVICE_ROLE_KEY'; // Use service role key for admin operations

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function clearProjects() {
    try {
        console.log('🗑️ Clearing all projects from database...');

        // Delete all projects
        const { error } = await supabase
            .from('projects')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except a dummy ID that doesn't exist

        if (error) {
            console.error('❌ Error clearing projects:', error);
            return;
        }

        console.log('✅ All projects cleared successfully!');

        // Verify the table is empty
        const { data: remainingProjects, error: countError } = await supabase
            .from('projects')
            .select('id');

        if (countError) {
            console.error('❌ Error checking remaining projects:', countError);
            return;
        }

        console.log(`📊 Remaining projects: ${remainingProjects?.length || 0}`);

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

clearProjects();
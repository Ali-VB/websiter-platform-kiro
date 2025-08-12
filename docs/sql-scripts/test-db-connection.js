// Test database connection and projects table structure
// Run this with: node scripts/test-db-connection.js

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mqyhhrfsdaiwanakixrx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xeWhocmZzZGFpd2FuYWtpeHJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMTAyNTEsImV4cCI6MjA2ODg4NjI1MX0.jai56SfKcJIjtun2vMq1hI6NKMeWSRWg005Kst-afPw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
    try {
        console.log('🔍 Testing database connection...');

        // Test basic connection
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Database connection error:', error);
            return;
        }

        console.log('✅ Database connection successful!');
        console.log('📊 Current projects count:', data?.length || 0);

        // Test insert with minimal data
        console.log('🧪 Testing project creation...');

        // First create a test website request
        const testRequest = {
            client_id: crypto.randomUUID(),
            website_type: 'company_portfolio',
            features: [],
            customization: {},
            client_details: { name: 'Test Client', email: 'test@example.com' },
            status: 'submitted'
        };

        console.log('🧪 Creating test website request...');
        const { data: requestData, error: requestError } = await supabase
            .from('website_requests')
            .insert([testRequest])
            .select()
            .single();

        if (requestError) {
            console.error('❌ Request creation error:', requestError);
            return;
        }

        console.log('✅ Test request created:', requestData);

        const testProject = {
            request_id: requestData.id, // Use the request ID
            client_id: testRequest.client_id,
            title: 'Test Project',
            description: 'Test project description',
            status: 'new',
            priority: 'medium'
        };

        const { data: insertData, error: insertError } = await supabase
            .from('projects')
            .insert([testProject])
            .select()
            .single();

        if (insertError) {
            console.error('❌ Insert error:', insertError);
            console.error('Error details:', insertError.details);
            console.error('Error hint:', insertError.hint);
            console.error('Error message:', insertError.message);
            return;
        }

        console.log('✅ Test project created successfully:', insertData);

        // Clean up test data
        await supabase
            .from('projects')
            .delete()
            .eq('id', insertData.id);

        await supabase
            .from('website_requests')
            .delete()
            .eq('id', requestData.id);

        console.log('🧹 Test data cleaned up');

    } catch (error) {
        console.error('❌ Unexpected error:', error);
    }
}

testConnection();
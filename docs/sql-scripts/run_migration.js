const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing Supabase credentials in environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
    try {
        console.log('🚀 Running migration to prevent duplicate projects...');

        // Read the SQL file
        const sqlContent = fs.readFileSync(path.join(__dirname, 'prevent_duplicate_projects.sql'), 'utf8');

        // Split by semicolon and execute each statement
        const statements = sqlContent.split(';').filter(stmt => stmt.trim().length > 0);

        for (const statement of statements) {
            if (statement.trim()) {
                console.log('Executing:', statement.trim().substring(0, 50) + '...');
                const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() });

                if (error) {
                    console.error('Error executing statement:', error);
                    // Continue with other statements
                } else {
                    console.log('✅ Statement executed successfully');
                }
            }
        }

        console.log('🎉 Migration completed!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
// Simple script to run the migration
// You can run this manually in your Supabase SQL editor

const fs = require('fs');
const path = require('path');

const migrationPath = path.join(__dirname, 'migrations', 'create_contact_submissions_table.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('=== CONTACT SUBMISSIONS MIGRATION SQL ===');
console.log('Copy and paste this SQL into your Supabase SQL editor:');
console.log('=====================================');
console.log(migrationSQL);
console.log('=====================================');
console.log('After running this SQL, the contact submissions feature will work properly.');
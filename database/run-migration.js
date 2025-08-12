// Simple script to run the migration
// You can run this manually in your Supabase SQL editor

const fs = require('fs');
const path = require('path');

const migrationPath = path.join(__dirname, 'migrations', 'create_project_assets_table.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

console.log('=== PROJECT ASSETS MIGRATION SQL ===');
console.log('Copy and paste this SQL into your Supabase SQL editor:');
console.log('=====================================');
console.log(migrationSQL);
console.log('=====================================');
console.log('After running this SQL, the project assets feature will work properly.');
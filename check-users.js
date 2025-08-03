// Check users in database
require('dotenv').config({ path: '.env.local' });
const { Database } = require('./database/db');

async function checkUsers() {
    console.log('🔍 Checking users in the database...');
    
    try {
        const db = new Database();
        
        // Get all users
        const users = await db.query('SELECT id, username, email, full_name, created_at, last_login FROM users');
        
        if (users.length === 0) {
            console.log('📭 No users found in the database.');
            console.log('💡 Users will be stored when they register through the application.');
        } else {
            console.log(`👥 Found ${users.length} user(s):`);
            users.forEach((user, index) => {
                console.log(`\n${index + 1}. User ID: ${user.id}`);
                console.log(`   Username: ${user.username}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Full Name: ${user.full_name}`);
                console.log(`   Created: ${user.created_at}`);
                console.log(`   Last Login: ${user.last_login || 'Never'}`);
            });
        }
        
        // Show table structure
        console.log('\n🏗️  Users table structure:');
        const tableInfo = await db.query('DESCRIBE users');
        tableInfo.forEach(column => {
            console.log(`   ${column.Field}: ${column.Type} ${column.Null === 'NO' ? '(Required)' : '(Optional)'}`);
        });
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking users:', error.message);
        process.exit(1);
    }
}

checkUsers();

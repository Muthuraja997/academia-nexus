// Check all users including deleted ones
require('dotenv').config({ path: '.env.local' });
const { Database } = require('./database/db');

async function checkAllUsers() {
    console.log('🔍 Checking ALL users in the database (including deleted)...');
    
    try {
        const db = new Database();
        
        // Get all users without any filter
        const allUsers = await db.query('SELECT id, username, email, full_name, is_active, created_at FROM users');
        
        if (allUsers.length === 0) {
            console.log('📭 No users found in the database at all.');
        } else {
            console.log(`👥 Found ${allUsers.length} total user(s):`);
            allUsers.forEach((user, index) => {
                console.log(`\n${index + 1}. User ID: ${user.id}`);
                console.log(`   Username: ${user.username}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Full Name: ${user.full_name}`);
                console.log(`   Active: ${user.is_active ? 'YES' : 'NO'}`);
                console.log(`   Created: ${user.created_at}`);
            });
        }
        
        // Also check active users only
        const activeUsers = await db.query('SELECT COUNT(*) as count FROM users WHERE is_active = 1');
        console.log(`\n✅ Active users: ${activeUsers[0].count}`);
        
        const inactiveUsers = await db.query('SELECT COUNT(*) as count FROM users WHERE is_active = 0 OR is_active IS NULL');
        console.log(`❌ Inactive/Deleted users: ${inactiveUsers[0].count}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error checking users:', error.message);
        process.exit(1);
    }
}

checkAllUsers();

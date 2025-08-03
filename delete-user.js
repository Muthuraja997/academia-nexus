// Hard delete user by email
require('dotenv').config({ path: '.env.local' });
const { Database } = require('./database/db');

async function deleteUserByEmail(email) {
    console.log(`🗑️  Deleting user with email: ${email}`);
    
    try {
        const db = new Database();
        
        // First, check if user exists
        const user = await db.query('SELECT id, username, email FROM users WHERE email = ?', [email]);
        
        if (user.length === 0) {
            console.log('❌ No user found with that email.');
            process.exit(1);
        }
        
        console.log(`👤 Found user: ${user[0].username} (ID: ${user[0].id})`);
        
        // Delete user completely
        const result = await db.query('DELETE FROM users WHERE email = ?', [email]);
        
        if (result.affectedRows > 0) {
            console.log('✅ User deleted successfully!');
            console.log('🎯 You can now register with this email again.');
        } else {
            console.log('❌ Failed to delete user.');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error deleting user:', error.message);
        process.exit(1);
    }
}

// Replace with the email you want to delete
const emailToDelete = 'muthuraja05980@gmail.com';
deleteUserByEmail(emailToDelete);

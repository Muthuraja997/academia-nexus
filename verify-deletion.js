// Verify user deletion
require('dotenv').config({ path: '.env.local' });
const { Database } = require('./database/db');

async function verifyDeletion() {
    console.log('🔍 Verifying user deletion...');
    
    try {
        const db = new Database();
        
        // Check if any users exist
        const allUsers = await db.query('SELECT COUNT(*) as count FROM users');
        console.log(`📊 Total users in database: ${allUsers[0].count}`);
        
        // Check specific email
        const emailCheck = await db.query('SELECT * FROM users WHERE email = ?', ['muthuraja05980@gmail.com']);
        console.log(`📧 Users with email 'muthuraja05980@gmail.com': ${emailCheck.length}`);
        
        if (emailCheck.length === 0) {
            console.log('✅ User successfully deleted! You can now register with this email.');
        } else {
            console.log('❌ User still exists in database.');
        }
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error verifying deletion:', error.message);
        process.exit(1);
    }
}

verifyDeletion();

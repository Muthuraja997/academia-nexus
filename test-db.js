// Test database connection
require('dotenv').config({ path: '.env.local' });
const { Database } = require('./database/db');

async function testDatabase() {
    console.log('🔍 Testing database connection...');
    
    try {
        const db = new Database();
        
        // Test a simple query
        const result = await db.query('SELECT 1 as test');
        console.log('✅ Database query test passed:', result);
        
        // Test users table
        const users = await db.query('SELECT COUNT(*) as count FROM users');
        console.log('✅ Users table accessible:', users);
        
        console.log('🎉 All database tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
        process.exit(1);
    }
}

testDatabase();

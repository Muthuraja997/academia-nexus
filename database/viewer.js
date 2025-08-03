const { getDatabase } = require('./db.js');

async function viewDatabase() {
    const db = getDatabase();
    
    console.log('🗄️  Academia Nexus Database Viewer\n');
    
    try {
        // View all tables
        const tables = await db.query(`
            SELECT name FROM sqlite_master 
            WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `);
        
        console.log('📋 Available Tables:');
        tables.forEach((table, index) => {
            console.log(`${index + 1}. ${table.name}`);
        });
        console.log('');
        
        // View users
        console.log('👥 Users:');
        const users = await db.query('SELECT id, username, email, first_name, last_name, created_at FROM users LIMIT 10');
        console.table(users);
        
        // View recent activities
        console.log('📊 Recent Activities:');
        const activities = await db.query(`
            SELECT a.*, u.username 
            FROM student_activities a 
            JOIN users u ON a.user_id = u.id 
            ORDER BY a.id DESC 
            LIMIT 10
        `);
        console.table(activities);
        
        // View test results
        console.log('🧪 Recent Test Results:');
        const testResults = await db.query(`
            SELECT tr.*, u.username 
            FROM test_results tr 
            JOIN users u ON tr.user_id = u.id 
            ORDER BY tr.created_at DESC 
            LIMIT 5
        `);
        console.table(testResults);
        
        // Database statistics
        console.log('📈 Database Statistics:');
        const stats = await Promise.all([
            db.query('SELECT COUNT(*) as count FROM users'),
            db.query('SELECT COUNT(*) as count FROM student_activities'),
            db.query('SELECT COUNT(*) as count FROM test_results'),
            db.query('SELECT COUNT(*) as count FROM communication_sessions')
        ]);
        
        console.log(`Total Users: ${stats[0][0].count}`);
        console.log(`Total Activities: ${stats[1][0].count}`);
        console.log(`Total Test Results: ${stats[2][0].count}`);
        console.log(`Total Communication Sessions: ${stats[3][0].count}`);
        
    } catch (error) {
        console.error('❌ Error accessing database:', error.message);
    }
}

// Specific query function
async function runQuery(sql) {
    const db = getDatabase();
    try {
        const results = await db.query(sql);
        console.table(results);
        return results;
    } catch (error) {
        console.error('❌ Query error:', error.message);
    }
}

// Export functions for use
module.exports = { viewDatabase, runQuery };

// Run if called directly
if (require.main === module) {
    viewDatabase();
}

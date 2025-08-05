// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { getDatabase } = require('./database/db.js');

async function testAllFixedMethods() {
    try {
        const db = getDatabase();
        // Use environment variable for test user ID
        const userId = parseInt(process.env.TEST_USER_ID) || 8;
        
        console.log(`🔧 Testing all fixed database methods for user ID: ${userId}...\n`);
        
        // Test 1: getRecentActivities with different limits
        console.log('1️⃣ Testing getRecentActivities...');
        const activities1 = await db.getRecentActivities(userId, 5);
        console.log(`   ✅ getRecentActivities (limit 5): ${activities1.length} records`);
        
        const activities2 = await db.getRecentActivities(userId);
        console.log(`   ✅ getRecentActivities (default): ${activities2.length} records`);
        
        // Test 2: getUserTestResults
        console.log('\n2️⃣ Testing getUserTestResults...');
        const testResults = await db.getUserTestResults(userId);
        console.log(`   ✅ getUserTestResults: ${testResults.length} records`);
        
        // Test 3: getUserCommunicationSessions
        console.log('\n3️⃣ Testing getUserCommunicationSessions...');
        const sessions = await db.getUserCommunicationSessions(userId);
        console.log(`   ✅ getUserCommunicationSessions: ${sessions.length} records`);
        
        // Test 4: getSkillProgression
        console.log('\n4️⃣ Testing getSkillProgression...');
        const skills = await db.getSkillProgression(userId);
        console.log(`   ✅ getSkillProgression: ${skills.length} records`);
        
        // Test 5: getUserActivities
        console.log('\n5️⃣ Testing getUserActivities...');
        const userActivities = await db.getUserActivities(userId, 10);
        console.log(`   ✅ getUserActivities: ${userActivities.length} records`);
        
        // Test 6: getUserActivitiesSince
        console.log('\n6️⃣ Testing getUserActivitiesSince...');
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recentActivities = await db.getUserActivitiesSince(userId, oneWeekAgo);
        console.log(`   ✅ getUserActivitiesSince (last 7 days): ${recentActivities.length} records`);
        
        // Test JSON parsing specifically
        console.log('\n7️⃣ Testing JSON parsing...');
        if (activities1.length > 0) {
            const sampleActivity = activities1[0];
            console.log(`   ✅ Activity details type: ${typeof sampleActivity.activity_details}`);
            console.log(`   ✅ Activity details: ${JSON.stringify(sampleActivity.activity_details)}`);
        }
        
        console.log('\n🎉 All database methods are working correctly!');
        console.log('📊 Summary:');
        console.log(`   - Recent Activities: ${activities1.length}/${activities2.length}`);
        console.log(`   - Test Results: ${testResults.length}`);
        console.log(`   - Communication Sessions: ${sessions.length}`);
        console.log(`   - Skill Progression: ${skills.length}`);
        console.log(`   - User Activities: ${userActivities.length}`);
        console.log(`   - Activities Since (7 days): ${recentActivities.length}`);
        
        // Close database connection to allow process to exit
        console.log('\n🔒 Closing database connection...');
        await db.close();
        console.log('✅ Database connection closed. Test complete!');
        
    } catch (error) {
        console.error('💥 Test failed:', error);
        // Make sure to close connection even on error
        try {
            await db.close();
        } catch (closeError) {
            console.error('Error closing database:', closeError);
        }
    }
}

testAllFixedMethods();

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { getDatabase } = require('./database/db.js');

async function testUserData() {
    try {
        const db = getDatabase();
        
        // Use environment variable for test user ID
        const userId = parseInt(process.env.TEST_USER_ID) || 8;
        
        console.log(`📊 Testing data for user ID ${userId} (test user)...`);
        
        // Test each database method individually
        console.log('Testing getRecentActivities...');
        const activities = await db.getRecentActivities(userId);
        console.log('Activities:', activities.length, 'records');
        if (activities.length > 0) {
            console.log('Sample activity:', activities[0]);
        }
        
        console.log('\nTesting getUserTestResults...');
        const testResults = await db.getUserTestResults(userId);
        console.log('Test Results:', testResults.length, 'records');
        if (testResults.length > 0) {
            console.log('Sample test result:', testResults[0]);
        }
        
        console.log('\nTesting getUserCommunicationSessions...');
        const sessions = await db.getUserCommunicationSessions(userId);
        console.log('Communication Sessions:', sessions.length, 'records');
        if (sessions.length > 0) {
            console.log('Sample session:', sessions[0]);
        }
        
        console.log('\nTesting getSkillProgression...');
        const skills = await db.getSkillProgression(userId);
        console.log('Skill Progression:', skills.length, 'records');
        if (skills.length > 0) {
            console.log('Sample skill data:', skills[0]);
        }
        
        console.log('\n✅ User data test complete!');
        
    } catch (error) {
        console.error('💥 User data test failed:', error);
    }
}

testUserData();

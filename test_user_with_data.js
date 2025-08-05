// Load environment variables
require('dotenv').config({ path: '.env.local' });

const { getDatabase } = require('./database/db.js');

async function testUserWithData() {
    try {
        const db = getDatabase();
        // Use environment variable for test user ID
        const userId = parseInt(process.env.TEST_USER_ID) || 8;
        
        console.log(`📊 Testing dashboard data for user ID: ${userId} (test user)`);
        
        // Test each database method individually
        console.log('\n🔍 Testing getRecentActivities...');
        const activities = await db.getRecentActivities(userId);
        console.log('Activities:', activities.length, 'records');
        if (activities.length > 0) {
            console.log('Sample activity:', activities[0]);
        }
        
        console.log('\n🔍 Testing getUserTestResults...');
        const testResults = await db.getUserTestResults(userId);
        console.log('Test Results:', testResults.length, 'records');
        if (testResults.length > 0) {
            console.log('Sample test result:', testResults[0]);
        }
        
        console.log('\n🔍 Testing getUserCommunicationSessions...');
        const sessions = await db.getUserCommunicationSessions(userId);
        console.log('Communication Sessions:', sessions.length, 'records');
        if (sessions.length > 0) {
            console.log('Sample session:', sessions[0]);
        }
        
        console.log('\n🔍 Testing getSkillProgression...');
        const skills = await db.getSkillProgression(userId);
        console.log('Skill Progression:', skills.length, 'records');
        if (skills.length > 0) {
            console.log('Sample skill data:', skills[0]);
        }
        
        console.log('\n🔍 Testing getUserAchievements...');
        const achievements = await db.getUserAchievements(userId);
        console.log('Achievements:', achievements.length, 'records');
        if (achievements.length > 0) {
            console.log('Sample achievement:', achievements[0]);
        }
        
        console.log('\n🔍 Testing getUserPreferences...');
        const preferences = await db.getUserPreferences(userId);
        console.log('Preferences:', preferences);
        
        console.log('\n✅ All database methods working with user data!');
        
        // Close database connection
        await db.close();
        console.log('Database connection closed');
        
    } catch (error) {
        console.error('💥 Database test failed:', error);
        try {
            await db.close();
        } catch (closeError) {
            console.error('Error closing database:', closeError);
        }
    }
}

testUserWithData();

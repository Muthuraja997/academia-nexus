// Load environment variables
require('dotenv').config({ path: '.env.local' });

const mysql = require('mysql2/promise');
const { pool } = require('./mysql-config');

class Database {
    constructor() {
        this.pool = pool;
        this.testConnection();
    }

    // Test database connection
    async testConnection() {
        try {
            const connection = await this.pool.getConnection();
            console.log('✅ Connected to MySQL database successfully');
            connection.release();
        } catch (error) {
            console.error('❌ Error connecting to MySQL database:', error.message);
        }
    }

    // Generic query method
    async query(sql, params = []) {
        try {
            const [rows] = await this.pool.execute(sql, params);
            return rows;
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }

    // Generic run method for INSERT, UPDATE, DELETE
    async run(sql, params = []) {
        try {
            const [result] = await this.pool.execute(sql, params);
            return {
                id: result.insertId,
                changes: result.affectedRows,
                result: result
            };
        } catch (error) {
            console.error('Database run error:', error);
            throw error;
        }
    }

    // User management methods
    async createUser(userData) {
        const { 
            username, 
            email, 
            password_hash, 
            first_name, 
            last_name, 
            phone, 
            university, 
            major, 
            year_of_study 
        } = userData;
        
        // Combine first_name and last_name into full_name to match schema
        const full_name = [first_name, last_name].filter(Boolean).join(' ');
        
        const sql = `
            INSERT INTO users (username, email, password_hash, full_name, phone, university, major, graduation_year)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const result = await this.run(sql, [username, email, password_hash, full_name, phone, university, major, year_of_study]);
        return result.id;
    }

    async getUserByEmail(email) {
        const sql = 'SELECT * FROM users WHERE email = ? AND is_active = 1';
        const users = await this.query(sql, [email]);
        return users[0] || null;
    }

    async getUserByUsername(username) {
        const sql = 'SELECT * FROM users WHERE username = ? AND is_active = 1';
        const users = await this.query(sql, [username]);
        return users[0] || null;
    }

    async getUserById(id) {
        const sql = 'SELECT * FROM users WHERE id = ? AND is_active = 1';
        const users = await this.query(sql, [id]);
        return users[0] || null;
    }

    async updateLastLogin(userId) {
        const sql = 'UPDATE users SET last_login = NOW() WHERE id = ?';
        return await this.run(sql, [userId]);
    }

    // Session management
    async createSession(userId, sessionToken, expiresAt) {
        // Convert ISO string to MySQL datetime format
        const mysqlDateTime = new Date(expiresAt).toISOString().slice(0, 19).replace('T', ' ');
        const sql = 'INSERT INTO user_sessions (user_id, session_token, expires_at) VALUES (?, ?, ?)';
        return await this.run(sql, [userId, sessionToken, mysqlDateTime]);
    }

    async getValidSession(sessionToken) {
        const sql = `
            SELECT us.*, u.id as user_id, u.username, u.email, u.full_name 
            FROM user_sessions us 
            JOIN users u ON us.user_id = u.id 
            WHERE us.session_token = ? AND us.expires_at > NOW() AND u.is_active = 1
        `;
        const sessions = await this.query(sql, [sessionToken]);
        return sessions[0] || null;
    }

    async deleteSession(sessionToken) {
        const sql = 'DELETE FROM user_sessions WHERE session_token = ?';
        return await this.run(sql, [sessionToken]);
    }

    // Activity tracking
    async logActivity(userId, activityType, activityDetails, sessionDuration, score, company, jobRole) {
        const sql = `
            INSERT INTO student_activities 
            (user_id, activity_type, activity_details, session_duration, score, company, job_role)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        return await this.run(sql, [
            userId, 
            activityType, 
            JSON.stringify(activityDetails), 
            sessionDuration, 
            score, 
            company, 
            jobRole
        ]);
    }

    async getUserActivities(userId, limit = 50) {
        const sql = `
            SELECT * FROM student_activities 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        `;
        const activities = await this.query(sql, [userId, limit]);
        return activities.map(activity => ({
            ...activity,
            activity_details: typeof activity.activity_details === 'string' 
                ? JSON.parse(activity.activity_details || '{}')
                : activity.activity_details || {}
        }));
    }

    // Test results
    async saveTestResult(userId, testData) {
        const { testTitle, company, jobRole, totalQuestions, correctAnswers, scorePercentage, timeTaken, answersData, feedbackData } = testData;
        const sql = `
            INSERT INTO test_results 
            (user_id, test_title, company, job_role, total_questions, correct_answers, score_percentage, time_taken, answers_data, feedback_data)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        return await this.run(sql, [
            userId, testTitle, company, jobRole, totalQuestions, correctAnswers, 
            scorePercentage, timeTaken, JSON.stringify(answersData), JSON.stringify(feedbackData)
        ]);
    }

    async getUserTestResults(userId, limit = 20) {
        const sql = `
            SELECT * FROM test_results 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        `;
        const results = await this.query(sql, [userId, limit]);
        return results.map(result => ({
            ...result,
            answers_data: JSON.parse(result.answers_data || '{}'),
            feedback_data: JSON.parse(result.feedback_data || '{}')
        }));
    }

    // Communication sessions
    async saveCommunicationSession(userId, sessionData) {
        const { sessionDuration, totalExchanges, topicsCovered, feedbackScore, improvementAreas, sessionTranscript } = sessionData;
        const sql = `
            INSERT INTO communication_sessions 
            (user_id, session_duration, total_exchanges, topics_covered, feedback_score, improvement_areas, session_transcript)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        return await this.run(sql, [
            userId, sessionDuration, totalExchanges, JSON.stringify(topicsCovered),
            feedbackScore, JSON.stringify(improvementAreas), JSON.stringify(sessionTranscript)
        ]);
    }

    async getUserCommunicationSessions(userId, limit = 20) {
        const sql = `
            SELECT * FROM communication_sessions 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        `;
        const sessions = await this.query(sql, [userId, limit]);
        return sessions.map(session => ({
            ...session,
            topics_covered: JSON.parse(session.topics_covered || '[]'),
            improvement_areas: JSON.parse(session.improvement_areas || '[]'),
            session_transcript: JSON.parse(session.session_transcript || '[]')
        }));
    }

    // User preferences
    async saveUserPreferences(userId, preferences) {
        const { preferredCompanies, targetRoles, skillLevel, notificationPreferences, dashboardLayout } = preferences;
        const sql = `
            INSERT OR REPLACE INTO user_preferences 
            (user_id, preferred_companies, target_roles, skill_level, notification_preferences, dashboard_layout, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        `;
        return await this.run(sql, [
            userId, 
            JSON.stringify(preferredCompanies), 
            JSON.stringify(targetRoles),
            skillLevel, 
            JSON.stringify(notificationPreferences), 
            JSON.stringify(dashboardLayout)
        ]);
    }

    async getUserPreferences(userId) {
        const sql = 'SELECT * FROM user_preferences WHERE user_id = ?';
        const prefs = await this.query(sql, [userId]);
        if (prefs[0]) {
            return {
                ...prefs[0],
                preferred_companies: JSON.parse(prefs[0].preferred_companies || '[]'),
                target_roles: JSON.parse(prefs[0].target_roles || '[]'),
                notification_preferences: JSON.parse(prefs[0].notification_preferences || '{}'),
                dashboard_layout: JSON.parse(prefs[0].dashboard_layout || '{}')
            };
        }
        return null;
    }

    // Achievements
    async addAchievement(userId, achievementData) {
        const { achievementType, achievementName, achievementDescription, pointsEarned, badgeIcon } = achievementData;
        const sql = `
            INSERT INTO user_achievements 
            (user_id, achievement_type, achievement_name, achievement_description, points_earned, badge_icon)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        return await this.run(sql, [userId, achievementType, achievementName, achievementDescription, pointsEarned, badgeIcon]);
    }

    async getUserAchievements(userId) {
        const sql = 'SELECT * FROM user_achievements WHERE user_id = ? ORDER BY earned_at DESC';
        return await this.query(sql, [userId]);
    }

    // Analytics
    async getUserStats(userId) {
        const sql = `
            SELECT 
                COUNT(DISTINCT sa.id) as total_activities,
                COUNT(DISTINCT tr.id) as total_tests,
                AVG(tr.score_percentage) as avg_test_score,
                COUNT(DISTINCT cs.id) as communication_sessions,
                AVG(cs.feedback_score) as avg_communication_score,
                SUM(ua.points_earned) as total_points
            FROM users u 
            LEFT JOIN student_activities sa ON u.id = sa.user_id
            LEFT JOIN test_results tr ON u.id = tr.user_id
            LEFT JOIN communication_sessions cs ON u.id = cs.user_id
            LEFT JOIN user_achievements ua ON u.id = ua.user_id
            WHERE u.id = ?
            GROUP BY u.id
        `;
        const stats = await this.query(sql, [userId]);
        return stats[0] || {};
    }

    // Additional helper methods for dashboard and authentication
    async getRecentActivities(userId, limit = 10) {
        const sql = `
            SELECT * FROM student_activities 
            WHERE user_id = ? 
            ORDER BY created_at DESC 
            LIMIT ?
        `;
        const activities = await this.query(sql, [userId, limit]);
        return activities.map(activity => ({
            ...activity,
            activity_details: JSON.parse(activity.activity_details || '{}')
        }));
    }

    async getUserActivityCount(userId) {
        const sql = 'SELECT COUNT(*) as count FROM student_activities WHERE user_id = ?';
        const result = await this.query(sql, [userId]);
        return result[0]?.count || 0;
    }

    async getUserActivitiesSince(userId, sinceDate) {
        const sql = `
            SELECT * FROM student_activities 
            WHERE user_id = ? AND created_at >= ? 
            ORDER BY created_at DESC
        `;
        const activities = await this.query(sql, [userId, sinceDate]);
        return activities.map(activity => ({
            ...activity,
            activity_details: JSON.parse(activity.activity_details || '{}')
        }));
    }

    async updateUser(userId, updates) {
        const fields = Object.keys(updates);
        const values = Object.values(updates);
        const setClause = fields.map(field => `${field} = ?`).join(', ');
        
        const sql = `UPDATE users SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;
        return await this.run(sql, [...values, userId]);
    }

    async createUserPreferences(userId, preferences) {
        const {
            communication_practice_enabled = true,
            interview_prep_enabled = true,
            scholarship_alerts = true,
            career_recommendations = true,
            difficulty_level = 'intermediate',
            preferred_subjects = '[]',
            notification_settings = '{}'
        } = preferences;

        // Map to the actual table schema (user_preferences table)
        const careerInterests = [
            ...(career_recommendations ? ['career_guidance'] : []),
            ...(interview_prep_enabled ? ['interview_preparation'] : []),
            ...(communication_practice_enabled ? ['communication_skills'] : [])
        ];

        const skillLevels = {
            overall_level: difficulty_level,
            technical_skills: 'beginner',
            communication_skills: 'beginner',
            interview_skills: 'beginner'
        };

        const learningGoals = [
            ...(interview_prep_enabled ? ['improve_interview_skills'] : []),
            ...(communication_practice_enabled ? ['enhance_communication'] : []),
            ...(scholarship_alerts ? ['find_scholarships'] : [])
        ];

        const notificationSettings = {
            email_notifications: true,
            push_notifications: true,
            weekly_summary: true,
            communication_practice_enabled,
            interview_prep_enabled,
            scholarship_alerts,
            career_recommendations,
            ...(typeof notification_settings === 'string' ? JSON.parse(notification_settings) : notification_settings)
        };

        const privacySettings = {
            profile_visibility: 'public',
            activity_sharing: true,
            achievement_sharing: true
        };

        const sql = `
            INSERT INTO user_preferences 
            (user_id, career_interests, skill_levels, learning_goals, notification_settings, privacy_settings)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        return await this.run(sql, [
            userId,
            JSON.stringify(careerInterests),
            JSON.stringify(skillLevels),
            JSON.stringify(learningGoals),
            JSON.stringify(notificationSettings),
            JSON.stringify(privacySettings)
        ]);
    }

    async createAchievement(userId, achievementName, achievementType, description) {
        const sql = `
            INSERT INTO achievements 
            (user_id, achievement_type, title, description, points)
            VALUES (?, ?, ?, ?, ?)
        `;
        return await this.run(sql, [userId, achievementType, achievementName, description, 100]);
    }

    // Enhanced activity logging with career insights
    async logEnhancedActivity(userId, activityData) {
        const {
            activityType,
            activityDetails,
            sessionDuration,
            score,
            company,
            jobRole,
            skillsUsed,
            difficultyLevel,
            completionStatus,
            userFeedback
        } = activityData;

        const sql = `
            INSERT INTO student_activities 
            (user_id, activity_type, activity_details, session_duration, score, company, job_role)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        const enhancedDetails = {
            ...activityDetails,
            skillsUsed: skillsUsed || [],
            difficultyLevel: difficultyLevel || 'medium',
            completionStatus: completionStatus || 'completed',
            userFeedback: userFeedback || null,
            timestamp: new Date().toISOString()
        };

        return await this.run(sql, [
            userId, 
            activityType, 
            JSON.stringify(enhancedDetails), 
            sessionDuration, 
            score, 
            company, 
            jobRole
        ]);
    }

    // Get activity patterns for career analysis
    async getActivityPatterns(userId) {
        const sql = `
            SELECT 
                activity_type,
                COUNT(*) as frequency,
                AVG(score) as avg_score,
                AVG(session_duration) as avg_duration,
                activity_details
            FROM student_activities 
            WHERE user_id = ? 
            GROUP BY activity_type
            ORDER BY frequency DESC
        `;
        
        const patterns = await this.query(sql, [userId]);
        return patterns.map(pattern => ({
            ...pattern,
            activity_details: JSON.parse(pattern.activity_details || '{}')
        }));
    }

    // Get skill progression over time
    async getSkillProgression(userId) {
        const sql = `
            SELECT 
                DATE(created_at) as date,
                activity_type,
                score,
                activity_details
            FROM student_activities 
            WHERE user_id = ? 
            ORDER BY created_at ASC
        `;
        
        const activities = await this.query(sql, [userId]);
        return activities.map(activity => ({
            ...activity,
            activity_details: JSON.parse(activity.activity_details || '{}')
        }));
    }

    // Close database connection
    close() {
        return new Promise((resolve) => {
            this.db.close((err) => {
                if (err) {
                    console.error('Error closing database:', err.message);
                } else {
                    console.log('Database connection closed');
                }
                resolve();
            });
        });
    }

    // User Management Methods
    async softDeleteUser(userId) {
        const sql = 'UPDATE users SET is_active = 0, updated_at = NOW() WHERE id = ?';
        return await this.run(sql, [userId]);
    }

    async hardDeleteUser(userId) {
        const sql = 'DELETE FROM users WHERE id = ?';
        return await this.run(sql, [userId]);
    }

    async hardDeleteUserByEmail(email) {
        const sql = 'DELETE FROM users WHERE email = ?';
        return await this.run(sql, [email]);
    }

    async reactivateUser(userId) {
        const sql = 'UPDATE users SET is_active = 1, updated_at = NOW() WHERE id = ?';
        return await this.run(sql, [userId]);
    }

    async getAllUsers(includeInactive = false) {
        const sql = includeInactive 
            ? 'SELECT * FROM users ORDER BY created_at DESC' 
            : 'SELECT * FROM users WHERE is_active = 1 ORDER BY created_at DESC';
        return await this.query(sql);
    }
}

// Export singleton instance
let dbInstance = null;

const getDatabase = () => {
    if (!dbInstance) {
        dbInstance = new Database();
    }
    return dbInstance;
};

module.exports = { Database, getDatabase };

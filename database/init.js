const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database file path
const dbPath = path.join(process.cwd(), 'database.sqlite');

// Create and initialize database
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
    }
});

// Create tables
const initDatabase = () => {
    // Users table
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            phone VARCHAR(15),
            university VARCHAR(100),
            major VARCHAR(100),
            graduation_year INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            last_login DATETIME,
            is_active BOOLEAN DEFAULT 1
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table created successfully');
        }
    });

    // User sessions table
    db.run(`
        CREATE TABLE IF NOT EXISTS user_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_token VARCHAR(255) NOT NULL,
            expires_at DATETIME NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('Error creating sessions table:', err.message);
        } else {
            console.log('Sessions table created successfully');
        }
    });

    // Student activity tracking table
    db.run(`
        CREATE TABLE IF NOT EXISTS student_activities (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            activity_type VARCHAR(50) NOT NULL, -- 'test', 'communication', 'question_generation', 'scholarship_search'
            activity_details JSON, -- Store detailed activity data
            session_duration INTEGER, -- Duration in seconds
            score DECIMAL(5,2), -- For tests and assessments
            company VARCHAR(100), -- For company-specific activities
            job_role VARCHAR(100), -- For role-specific activities
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('Error creating activities table:', err.message);
        } else {
            console.log('Activities table created successfully');
        }
    });

    // Test results table
    db.run(`
        CREATE TABLE IF NOT EXISTS test_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            test_title VARCHAR(200) NOT NULL,
            company VARCHAR(100),
            job_role VARCHAR(100),
            total_questions INTEGER NOT NULL,
            correct_answers INTEGER NOT NULL,
            score_percentage DECIMAL(5,2) NOT NULL,
            time_taken INTEGER, -- Time in seconds
            answers_data JSON, -- Detailed answers and explanations
            feedback_data JSON, -- AI feedback and recommendations
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('Error creating test_results table:', err.message);
        } else {
            console.log('Test results table created successfully');
        }
    });

    // Communication practice sessions table
    db.run(`
        CREATE TABLE IF NOT EXISTS communication_sessions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            session_duration INTEGER NOT NULL, -- Duration in seconds
            total_exchanges INTEGER DEFAULT 0, -- Number of question-answer exchanges
            topics_covered JSON, -- Array of topics discussed
            feedback_score DECIMAL(5,2), -- Overall communication score
            improvement_areas JSON, -- Areas for improvement from AI
            session_transcript JSON, -- Full conversation transcript
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('Error creating communication_sessions table:', err.message);
        } else {
            console.log('Communication sessions table created successfully');
        }
    });

    // User preferences table
    db.run(`
        CREATE TABLE IF NOT EXISTS user_preferences (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            preferred_companies JSON, -- Array of companies user is interested in
            target_roles JSON, -- Array of job roles user is targeting
            skill_level VARCHAR(20) DEFAULT 'beginner', -- beginner, intermediate, advanced
            notification_preferences JSON, -- Notification settings
            dashboard_layout JSON, -- Custom dashboard preferences
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('Error creating user_preferences table:', err.message);
        } else {
            console.log('User preferences table created successfully');
        }
    });

    // User achievements table
    db.run(`
        CREATE TABLE IF NOT EXISTS user_achievements (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            achievement_type VARCHAR(50) NOT NULL, -- 'test_score', 'streak', 'improvement', 'milestone'
            achievement_name VARCHAR(100) NOT NULL,
            achievement_description TEXT,
            points_earned INTEGER DEFAULT 0,
            badge_icon VARCHAR(50),
            earned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )
    `, (err) => {
        if (err) {
            console.error('Error creating achievements table:', err.message);
        } else {
            console.log('Achievements table created successfully');
        }
    });

    console.log('Database initialization completed!');
};

// Initialize database when this script is run
initDatabase();

// Export database connection for use in other files
module.exports = { db, initDatabase };

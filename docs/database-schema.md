# 📊 Academia Nexus - Entity Relationship Diagram

## 🏗️ Database Schema Overview

### Database Systems:
- **Development**: SQLite
- **Production**: MySQL with UTF8MB4 character set

---

## 📋 Entities and Attributes

### 👤 USERS (Primary Entity)
**Purpose**: Store user registration and profile information

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Unique user identifier |
| `username` | VARCHAR(50) | UNIQUE, NOT NULL | User's chosen username |
| `email` | VARCHAR(100) | UNIQUE, NOT NULL | User's email address |
| `password_hash` | VARCHAR(255) | NOT NULL | Encrypted password |
| `full_name` | VARCHAR(100) | NOT NULL | User's complete name |
| `first_name` | VARCHAR(50) | | User's first name |
| `last_name` | VARCHAR(50) | | User's last name |
| `phone` | VARCHAR(15) | | Contact phone number |
| `university` | VARCHAR(100) | | Educational institution |
| `major` | VARCHAR(100) | | Field of study |
| `graduation_year` | INT | | Expected graduation year |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Account creation time |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last profile update |
| `last_login` | TIMESTAMP | NULLABLE | Last login timestamp |
| `is_active` | BOOLEAN | DEFAULT TRUE | Account status |

---

### 🔐 USER_SESSIONS
**Purpose**: Manage user authentication sessions

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Session identifier |
| `user_id` | INT | FOREIGN KEY → users(id) | Reference to user |
| `session_token` | VARCHAR(255) | UNIQUE, NOT NULL | JWT session token |
| `expires_at` | TIMESTAMP | NOT NULL | Token expiration time |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Session start time |

**Relationship**: Users → User_Sessions (1:N)
- One user can have multiple active sessions

---

### 📊 STUDENT_ACTIVITIES
**Purpose**: Track all user activities and learning analytics

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Activity identifier |
| `user_id` | INT | FOREIGN KEY → users(id) | Reference to user |
| `activity_type` | VARCHAR(50) | NOT NULL | Type of activity (test, communication, etc.) |
| `activity_details` | JSON | | Detailed activity metadata |
| `session_duration` | INT | DEFAULT 0 | Duration in seconds |
| `score` | DECIMAL(5,2) | NULLABLE | Performance score |
| `company` | VARCHAR(100) | | Target company (if applicable) |
| `job_role` | VARCHAR(100) | | Target role (if applicable) |
| `skills_used` | JSON | | Skills practiced |
| `difficulty_level` | VARCHAR(20) | | Activity difficulty |
| `completion_status` | VARCHAR(20) | DEFAULT 'completed' | Activity status |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Activity timestamp |

**Relationship**: Users → Student_Activities (1:N)
- One user can have multiple activities

---

### 📝 TEST_RESULTS
**Purpose**: Store detailed test performance and feedback

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Test result identifier |
| `user_id` | INT | FOREIGN KEY → users(id) | Reference to user |
| `test_title` | VARCHAR(200) | NOT NULL | Test name/title |
| `company` | VARCHAR(100) | | Target company |
| `role` | VARCHAR(100) | | Target job role |
| `total_questions` | INT | NOT NULL | Number of questions |
| `correct_answers` | INT | NOT NULL | Correct answer count |
| `score_percentage` | DECIMAL(5,2) | NOT NULL | Final score percentage |
| `answers` | JSON | | Detailed answer data |
| `feedback` | JSON | | AI-generated feedback |
| `time_taken` | INT | | Test duration in seconds |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Test completion time |

**Relationship**: Users → Test_Results (1:N)
- One user can have multiple test results

---

### 🎙️ COMMUNICATION_SESSIONS
**Purpose**: Track voice-based communication practice sessions

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Session identifier |
| `user_id` | INT | FOREIGN KEY → users(id) | Reference to user |
| `session_type` | VARCHAR(50) | NOT NULL | Type of communication session |
| `duration` | INT | NOT NULL | Session duration in seconds |
| `total_exchanges` | INT | DEFAULT 0 | Number of conversation exchanges |
| `topics_covered` | JSON | | Discussion topics |
| `feedback_score` | DECIMAL(5,2) | | Overall communication score |
| `transcript` | TEXT | | Full conversation transcript |
| `feedback` | JSON | | Detailed AI feedback |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Session completion time |

**Relationship**: Users → Communication_Sessions (1:N)
- One user can have multiple communication practice sessions

---

### ⚙️ USER_PREFERENCES
**Purpose**: Store personalized user settings and preferences

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Preference identifier |
| `user_id` | INT | FOREIGN KEY → users(id), UNIQUE | Reference to user (one-to-one) |
| `preferred_companies` | JSON | | List of target companies |
| `target_roles` | JSON | | List of desired job roles |
| `career_interests` | JSON | | Career interest areas |
| `skill_levels` | JSON | | Self-assessed skill levels |
| `learning_goals` | JSON | | User's learning objectives |
| `notification_settings` | JSON | | Notification preferences |
| `privacy_settings` | JSON | | Privacy configuration |
| `dashboard_layout` | JSON | | Custom dashboard layout |
| `created_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Preference creation time |
| `updated_at` | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Last update time |

**Relationship**: Users → User_Preferences (1:1)
- Each user has exactly one preference record

---

### 🏆 USER_ACHIEVEMENTS
**Purpose**: Track user accomplishments and gamification elements

| Attribute | Type | Constraints | Description |
|-----------|------|-------------|-------------|
| `id` | INT | PRIMARY KEY, AUTO_INCREMENT | Achievement identifier |
| `user_id` | INT | FOREIGN KEY → users(id) | Reference to user |
| `achievement_type` | VARCHAR(50) | NOT NULL | Type of achievement |
| `achievement_name` | VARCHAR(100) | NOT NULL | Achievement name |
| `title` | VARCHAR(100) | | Achievement title |
| `description` | TEXT | | Achievement description |
| `points_earned` | INT | DEFAULT 0 | Points awarded |
| `badge_icon` | VARCHAR(50) | | Badge icon identifier |
| `earned_at` | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Achievement date |

**Relationship**: Users → User_Achievements (1:N)
- One user can earn multiple achievements

---

## 🔗 Relationship Summary

### Primary Relationships:

1. **Users ↔ User_Sessions** (1:N)
   - Manages authentication and session tracking
   - Cascade delete: When user is deleted, all sessions are removed

2. **Users ↔ Student_Activities** (1:N)
   - Tracks all learning activities and analytics
   - Enables progress monitoring and insights

3. **Users ↔ Test_Results** (1:N)
   - Stores comprehensive test performance data
   - Supports skill assessment and improvement tracking

4. **Users ↔ Communication_Sessions** (1:N)
   - Records voice-based practice sessions
   - Includes transcripts and AI feedback

5. **Users ↔ User_Preferences** (1:1)
   - Personalization and customization settings
   - One preference record per user

6. **Users ↔ User_Achievements** (1:N)
   - Gamification and motivation system
   - Multiple achievements per user

---

## 🎯 Key Design Principles

### 1. **Data Integrity**
- Foreign key constraints ensure referential integrity
- Cascade delete prevents orphaned records
- Unique constraints prevent duplicates

### 2. **Scalability**
- Indexed columns for fast queries
- JSON fields for flexible data storage
- Normalized structure reduces redundancy

### 3. **Security**
- Password hashing (never store plain text)
- Session token management
- User data isolation

### 4. **Analytics Support**
- Comprehensive activity tracking
- Detailed performance metrics
- Historical data preservation

### 5. **Flexibility**
- JSON fields for evolving data structures
- Extensible achievement system
- Configurable user preferences

---

## 🚀 Performance Optimizations

### Indexes:
- `users(username, email)` - Fast authentication
- `user_sessions(session_token, expires_at)` - Session validation
- `student_activities(user_id, created_at)` - Activity queries
- `test_results(user_id, created_at)` - Test history
- `communication_sessions(user_id, created_at)` - Session history

### Storage:
- UTF8MB4 character set supports emojis and international characters
- InnoDB engine for ACID compliance
- JSON data type for complex structures

---

## 📈 Future Enhancements

### Potential New Entities:
1. **Study_Materials** - Learning resources and content
2. **Peer_Connections** - Social learning features
3. **Learning_Paths** - Structured course progressions
4. **Notifications** - System messaging
5. **Analytics_Reports** - Aggregated insights

### Relationship Expansions:
- Many-to-many relationships for collaborative features
- Hierarchical data for skill trees
- Time-series data for advanced analytics

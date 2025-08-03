# 🗄️ MySQL Database Setup Guide

This guide will help you set up MySQL for the Academia Nexus application.

## 📋 Prerequisites

1. **Install MySQL Server** (if not already installed)
   - **Windows**: Download from [MySQL Official Website](https://dev.mysql.com/downloads/mysql/)
   - **macOS**: `brew install mysql` (with Homebrew)
   - **Linux**: `sudo apt-get install mysql-server` (Ubuntu/Debian)

2. **Start MySQL Service**
   - **Windows**: MySQL service should start automatically
   - **macOS**: `brew services start mysql`
   - **Linux**: `sudo systemctl start mysql`

## 🔧 Configuration Steps

### 1. **Configure Environment Variables**
Edit `.env.local` file with your MySQL credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=academia_nexus
JWT_SECRET=your-super-secure-jwt-secret-key-here
```

### 2. **Create Database User (Optional but Recommended)**
Login to MySQL as root and create a dedicated user:

```sql
-- Login as root
mysql -u root -p

-- Create database user
CREATE USER 'academia_user'@'localhost' IDENTIFIED BY 'secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON academia_nexus.* TO 'academia_user'@'localhost';

-- Refresh privileges
FLUSH PRIVILEGES;

-- Exit
EXIT;
```

Update your `.env.local` accordingly:
```env
DB_USER=academia_user
DB_PASSWORD=secure_password
```

### 3. **Initialize Database**
Run the database initialization script:

```bash
npm run db:init
```

This will:
- ✅ Create the `academia_nexus` database
- ✅ Create all required tables with proper relationships
- ✅ Set up indexes for optimal performance

## 🧪 Testing the Connection

### Test Database Connection:
```bash
node -e "
const { pool } = require('./database/mysql-config');
pool.getConnection()
  .then(conn => { 
    console.log('✅ MySQL connection successful!'); 
    conn.release(); 
    process.exit(0);
  })
  .catch(err => { 
    console.error('❌ MySQL connection failed:', err.message); 
    process.exit(1);
  });
"
```

## 📊 Database Schema

The application uses the following tables:

- **`users`** - User authentication and profile information
- **`user_sessions`** - JWT session management
- **`student_activities`** - User activity tracking
- **`test_results`** - Test scores and feedback
- **`communication_sessions`** - Communication practice sessions
- **`user_preferences`** - User settings and preferences
- **`achievements`** - User achievements and badges

## 🔍 Database Management

### Using MySQL Workbench (GUI)
1. Download [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)
2. Connect using your database credentials
3. Browse tables and run queries visually

### Using Command Line
```bash
# Connect to database
mysql -u your_username -p academia_nexus

# Show tables
SHOW TABLES;

# View table structure
DESCRIBE users;

# View data
SELECT * FROM users LIMIT 5;
```

## 🚨 Troubleshooting

### Common Issues:

**Connection refused:**
- Ensure MySQL server is running
- Check if port 3306 is accessible
- Verify credentials in `.env.local`

**Authentication failed:**
- Reset password: `ALTER USER 'root'@'localhost' IDENTIFIED BY 'new_password';`
- Check user privileges

**Database creation failed:**
- Ensure user has CREATE privileges
- Check disk space and permissions

## 🔄 Migration from SQLite

Your existing SQLite data can be migrated. Contact support or create a migration script if needed.

## 📝 Notes

- MySQL uses different SQL syntax than SQLite in some cases
- JSON data type is fully supported in MySQL 5.7+
- Foreign key constraints are enforced for data integrity
- InnoDB engine provides ACID compliance and better performance

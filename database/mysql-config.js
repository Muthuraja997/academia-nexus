// Load environment variables
require('dotenv').config({ path: '.env.local' });

// MySQL Database Configuration
const mysql = require('mysql2/promise');

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'academia_nexus',
    charset: 'utf8mb4',
    connectionLimit: 10
};

// Create connection pool
const pool = mysql.createPool(dbConfig);

module.exports = {
    pool,
    dbConfig
};

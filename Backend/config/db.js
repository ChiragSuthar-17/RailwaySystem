const mysql = require('mysql2');
require('dotenv').config();

// Create a connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'railway_booking',
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test the connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to MySQL database successfully!');
        connection.release();
    }
});

// Create a promise wrapper for the pool
const promisePool = pool.promise();

// Export a simple query function
module.exports = {
    query: async (sql, params) => {
        try {
            const [results] = await promisePool.query(sql, params);
            return results;
        } catch (error) {
            console.error('Database query error:', error.message);
            throw error;
        }
    }
};
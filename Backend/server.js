const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { query } = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Import routes
const authRoutes = require('./routes/auth');
const trainRoutes = require('./routes/trains');
const bookingRoutes = require('./routes/bookings');
const stationRoutes = require('./routes/stations');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trains', trainRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/stations', stationRoutes);

// Health check with database status
app.get('/api/health', async (req, res) => {
    try {
        const [result] = await query('SELECT 1 as db_status');
        res.status(200).json({
            status: 'OK',
            message: 'Server is running',
            database: 'Connected',
            timestamp: new Date().toISOString(),
            uptime: process.uptime()
        });
    } catch (error) {
        res.status(500).json({
            status: 'ERROR',
            message: 'Database connection failed',
            error: error.message
        });
    }
});

// Database initialization endpoint (for development)
if (process.env.NODE_ENV === 'development') {
    app.post('/api/init-db', async (req, res) => {
        try {
            // Read and execute SQL file (you'll need to save the SQL to a file)
            // For now, we'll just return success
            res.json({
                message: 'Database initialization endpoint ready',
                note: 'Execute the provided SQL script in MySQL Workbench or phpMyAdmin'
            });
        } catch (error) {
            console.error('Database initialization failed:', error);
            res.status(500).json({ message: 'Database initialization failed', error: error.message });
        }
    });
}

// 404 middleware
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.statusCode = 404;
    next(error);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.stack);
    
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    
    res.status(statusCode).json({
        status: 'error',
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV}`);
    console.log(`🔗 API Base URL: http://localhost:${PORT}/api`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

module.exports = app;
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Register user
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, fullName, phone } = req.body;
        
        // Basic validation
        if (!username || !email || !password || !fullName) {
            return res.status(400).json({
                success: false,
                message: 'Please fill all required fields'
            });
        }
        
        // Check if user exists
        const existingUsers = await db.query(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
        );
        
        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        const result = await db.query(
            'INSERT INTO users (username, email, password, full_name, phone) VALUES (?, ?, ?, ?, ?)',
            [username, email, hashedPassword, fullName, phone]
        );
        
        // Generate token
        const token = jwt.sign(
            { userId: result.insertId, email },
            process.env.JWT_SECRET || 'railway_secret',
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token: token,
            user: {
                id: result.insertId,
                username: username,
                email: email,
                fullName: fullName
            }
        });
        
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }
        
        // Find user
        const users = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        const user = users[0];
        
        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        
        // Generate token
        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'railway_secret',
            { expiresIn: '24h' }
        );
        
        res.json({
            success: true,
            message: 'Login successful',
            token: token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                fullName: user.full_name
            }
        });
        
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

module.exports = router;
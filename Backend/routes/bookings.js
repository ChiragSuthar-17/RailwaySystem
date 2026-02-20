const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'railway_secret');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: 'Invalid token'
        });
    }
};

// Create booking
router.post('/', authenticateToken, async (req, res) => {
    try {
        const { trainId, journeyDate, passengers } = req.body;
        const userId = req.user.userId;
        
        // Basic validation
        if (!trainId || !journeyDate || !passengers || !Array.isArray(passengers) || passengers.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid booking data'
            });
        }
        
        // Check train availability
        const trains = await db.query('SELECT * FROM trains WHERE id = ?', [trainId]);
        if (trains.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Train not found'
            });
        }
        
        const train = trains[0];
        
        // Get current bookings
        const bookings = await db.query(
            'SELECT SUM(total_passengers) as total_booked FROM bookings WHERE train_id = ? AND journey_date = ? AND status = "confirmed"',
            [trainId, journeyDate]
        );
        
        const bookedSeats = bookings[0]?.total_booked || 0;
        const availableSeats = train.total_seats - bookedSeats;
        
        // Generate PNR
        const pnrNumber = 'PNR' + Date.now() + Math.floor(Math.random() * 1000);
        
        // Calculate total amount
        const totalAmount = passengers.length * train.fare;
        
        // Create booking
        const bookingResult = await db.query(
            `INSERT INTO bookings (pnr_number, user_id, train_id, journey_date, total_passengers, total_amount, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [pnrNumber, userId, trainId, journeyDate, passengers.length, totalAmount, 
             availableSeats >= passengers.length ? 'confirmed' : 'waiting']
        );
        
        const bookingId = bookingResult.insertId;
        
        // Add passengers
        const seatNumbers = [];
        let seatCounter = bookedSeats + 1;
        
        for (let i = 0; i < passengers.length; i++) {
            const passenger = passengers[i];
            let seatNumber = null;
            let passengerStatus = 'confirmed';
            
            if (i < availableSeats) {
                seatNumber = `S${seatCounter++}`;
                seatNumbers.push(seatNumber);
            } else {
                passengerStatus = 'waiting';
            }
            
            await db.query(
                'INSERT INTO passengers (booking_id, name, age, gender, seat_number, status) VALUES (?, ?, ?, ?, ?, ?)',
                [bookingId, passenger.name, passenger.age, passenger.gender, seatNumber, passengerStatus]
            );
        }
        
        // Update booking with seat numbers
        await db.query(
            'UPDATE bookings SET seat_numbers = ? WHERE id = ?',
            [JSON.stringify(seatNumbers), bookingId]
        );
        
        res.status(201).json({
            success: true,
            message: 'Booking created successfully',
            booking: {
                pnrNumber: pnrNumber,
                bookingId: bookingId,
                status: availableSeats >= passengers.length ? 'confirmed' : 'waiting',
                confirmedPassengers: Math.min(passengers.length, availableSeats),
                waitingPassengers: Math.max(0, passengers.length - availableSeats),
                seatNumbers: seatNumbers,
                totalAmount: totalAmount
            }
        });
        
    } catch (error) {
        console.error('Booking error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Booking failed',
            error: error.message
        });
    }
});

// Get user bookings
router.get('/my-bookings', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const bookings = await db.query(`
            SELECT b.*, t.train_number, t.train_name, t.source_station, t.destination_station,
                   (SELECT COUNT(*) FROM passengers p WHERE p.booking_id = b.id AND p.status = 'confirmed') as confirmed_seats,
                   (SELECT COUNT(*) FROM passengers p WHERE p.booking_id = b.id AND p.status = 'waiting') as waiting_seats
            FROM bookings b
            JOIN trains t ON b.train_id = t.id
            WHERE b.user_id = ?
            ORDER BY b.booking_date DESC
        `, [userId]);
        
        res.json({
            success: true,
            bookings: bookings
        });
        
    } catch (error) {
        console.error('Get bookings error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch bookings',
            error: error.message
        });
    }
});

// Cancel booking
router.post('/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const userId = req.user.userId;
        
        // Verify booking belongs to user
        const bookings = await db.query(
            'SELECT * FROM bookings WHERE id = ? AND user_id = ?',
            [bookingId, userId]
        );
        
        if (bookings.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
        
        // Update booking status
        await db.query(
            'UPDATE bookings SET status = "cancelled" WHERE id = ?',
            [bookingId]
        );
        
        res.json({
            success: true,
            message: 'Booking cancelled successfully'
        });
        
    } catch (error) {
        console.error('Cancel booking error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to cancel booking',
            error: error.message
        });
    }
});

module.exports = router;
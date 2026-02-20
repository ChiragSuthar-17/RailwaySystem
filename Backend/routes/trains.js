const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all trains with search
router.get('/search', async (req, res) => {
    try {
        const { source, destination, date, limit } = req.query;
        
        let sql = 'SELECT * FROM trains WHERE 1=1';
        const params = [];
        
        if (source) {
            sql += ' AND source_station LIKE ?';
            params.push(`%${source}%`);
        }
        
        if (destination) {
            sql += ' AND destination_station LIKE ?';
            params.push(`%${destination}%`);
        }
        
        if (date) {
            sql += ' AND journey_date = ?';
            params.push(date);
        }
        
        sql += ' ORDER BY departure_time ASC';
        
        if (limit) {
            sql += ' LIMIT ?';
            params.push(parseInt(limit));
        }
        
        const trains = await db.query(sql, params);
        
        res.json({
            success: true,
            count: trains.length,
            trains: trains
        });
        
    } catch (error) {
        console.error('Train search error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to search trains',
            error: error.message
        });
    }
});

// Get train by ID
router.get('/:id', async (req, res) => {
    try {
        const trainId = req.params.id;
        
        const trains = await db.query('SELECT * FROM trains WHERE id = ?', [trainId]);
        
        if (trains.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Train not found'
            });
        }
        
        // Get route details if available
        const routes = await db.query(
            `SELECT r.*, s.station_code, s.station_name, s.city 
             FROM routes r 
             JOIN stations s ON r.station_id = s.id 
             WHERE r.train_id = ? 
             ORDER BY r.sequence_number`,
            [trainId]
        );
        
        res.json({
            success: true,
            train: {
                ...trains[0],
                route_details: routes
            }
        });
        
    } catch (error) {
        console.error('Train details error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch train details',
            error: error.message
        });
    }
});

// Get seat availability
router.get('/:id/availability', async (req, res) => {
    try {
        const trainId = req.params.id;
        const { date } = req.query;
        
        if (!date) {
            return res.status(400).json({
                success: false,
                message: 'Date parameter is required'
            });
        }
        
        // Get train details
        const trains = await db.query('SELECT * FROM trains WHERE id = ?', [trainId]);
        
        if (trains.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Train not found'
            });
        }
        
        const train = trains[0];
        
        // Get confirmed bookings
        const bookings = await db.query(
            'SELECT SUM(total_passengers) as total_confirmed FROM bookings WHERE train_id = ? AND journey_date = ? AND status = "confirmed"',
            [trainId, date]
        );
        
        const confirmedSeats = bookings[0]?.total_confirmed || 0;
        const availableSeats = Math.max(0, train.total_seats - confirmedSeats);
        
        res.json({
            success: true,
            train: train,
            availableSeats: availableSeats,
            totalSeats: train.total_seats
        });
        
    } catch (error) {
        console.error('Availability check error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to check availability',
            error: error.message
        });
    }
});

module.exports = router;
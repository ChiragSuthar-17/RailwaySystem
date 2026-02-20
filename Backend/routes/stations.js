const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all stations
router.get('/', async (req, res) => {
    try {
        const stations = await db.query('SELECT * FROM stations ORDER BY station_name');
        res.json({
            success: true,
            stations: stations
        });
    } catch (error) {
        console.error('Stations fetch error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch stations',
            error: error.message
        });
    }
});

// Find shortest path between stations
router.get('/shortest-path', async (req, res) => {
    try {
        const { source, destination } = req.query;
        
        if (!source || !destination) {
            return res.status(400).json({
                success: false,
                message: 'Source and destination stations are required'
            });
        }
        
        // Simple implementation - in real system, use Dijkstra's algorithm
        const routes = await db.query(`
            SELECT DISTINCT t.train_number, t.train_name,
                   s1.station_code as source_code, s1.station_name as source_name,
                   s2.station_code as dest_code, s2.station_name as dest_name
            FROM trains t
            JOIN routes r1 ON t.id = r1.train_id
            JOIN stations s1 ON r1.station_id = s1.id
            JOIN routes r2 ON t.id = r2.train_id
            JOIN stations s2 ON r2.station_id = s2.id
            WHERE s1.station_code = ? AND s2.station_code = ?
            AND r1.sequence_number < r2.sequence_number
            LIMIT 10
        `, [source, destination]);
        
        res.json({
            success: true,
            routes: routes
        });
        
    } catch (error) {
        console.error('Shortest path error:', error.message);
        res.status(500).json({
            success: false,
            message: 'Failed to find routes',
            error: error.message
        });
    }
});

module.exports = router;
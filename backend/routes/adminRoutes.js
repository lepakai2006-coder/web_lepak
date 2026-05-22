const express = require('express');
const db = require('../db/database');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/stats', (req, res) => {
    const stats = {};
    db.serialize(() => {
        db.get('SELECT COUNT(*) as count FROM Users', (err, row) => stats.users = row?.count || 0);
        db.get('SELECT COUNT(*) as count FROM Flights', (err, row) => stats.flights = row?.count || 0);
        db.get('SELECT COUNT(*) as count FROM Bookings', (err, row) => stats.bookings = row?.count || 0);
        db.get('SELECT SUM(total_price) as revenue FROM Bookings WHERE status = "Confirmed"', (err, row) => {
            stats.revenue = row?.revenue || 0;
            
            // Also get chart data
            db.all(`SELECT date(booking_date) as date, COUNT(*) as count, SUM(total_price) as sum 
                    FROM Bookings GROUP BY date(booking_date) ORDER BY date DESC LIMIT 7`, (err, rows) => {
                stats.chartData = rows?.reverse() || [];
                res.json(stats);
            });
        });
    });
});

router.get('/aircrafts', (req, res) => {
    db.all('SELECT * FROM Aircrafts', (err, rows) => res.json(rows || []));
});
router.post('/aircrafts', (req, res) => {
    const { name, model, capacity } = req.body;
    db.run('INSERT INTO Aircrafts (name, model, capacity) VALUES (?, ?, ?)', [name, model, capacity], function(err) {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json({ message: 'Aircraft added', id: this.lastID });
    });
});

router.post('/flights', (req, res) => {
    const { aircraft_id, origin, destination, departure_time, arrival_time, price } = req.body;
    db.run(`INSERT INTO Flights (aircraft_id, origin, destination, departure_time, arrival_time, price) 
            VALUES (?, ?, ?, ?, ?, ?)`, 
    [aircraft_id, origin, destination, departure_time, arrival_time, price], function(err) {
        if (err) return res.status(500).json({ message: 'Error' });
        res.json({ message: 'Flight added', id: this.lastID });
    });
});

module.exports = router;

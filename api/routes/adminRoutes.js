const express = require('express');
const db = require('../db/database');
const { protect, adminOnly } = require('../middlewares/authMiddleware');
const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get('/stats', async (req, res) => {
    try {
        const usersRes = await db.execute('SELECT COUNT(*) as count FROM Users');
        const flightsRes = await db.execute('SELECT COUNT(*) as count FROM Flights');
        const bookingsRes = await db.execute('SELECT COUNT(*) as count FROM Bookings');
        const revenueRes = await db.execute('SELECT SUM(total_price) as revenue FROM Bookings WHERE status = "Confirmed"');
        const chartRes = await db.execute(
            `SELECT date(booking_date) as date, COUNT(*) as count, SUM(total_price) as sum 
             FROM Bookings GROUP BY date(booking_date) ORDER BY date DESC LIMIT 7`
        );

        res.json({
            users: usersRes.rows[0]?.count || 0,
            flights: flightsRes.rows[0]?.count || 0,
            bookings: bookingsRes.rows[0]?.count || 0,
            revenue: revenueRes.rows[0]?.revenue || 0,
            chartData: chartRes.rows.reverse()
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

router.get('/aircrafts', async (req, res) => {
    try {
        const result = await db.execute('SELECT * FROM Aircrafts');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

router.post('/aircrafts', async (req, res) => {
    try {
        const { name, model, capacity } = req.body;
        const result = await db.execute({ sql: 'INSERT INTO Aircrafts (name, model, capacity) VALUES (?, ?, ?)', args: [name, model, capacity] });
        res.json({ message: 'Aircraft added', id: Number(result.lastInsertRowid) });
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

router.post('/flights', async (req, res) => {
    try {
        const { aircraft_id, origin, destination, departure_time, arrival_time, price } = req.body;
        const result = await db.execute({
            sql: 'INSERT INTO Flights (aircraft_id, origin, destination, departure_time, arrival_time, price) VALUES (?, ?, ?, ?, ?, ?)',
            args: [aircraft_id, origin, destination, departure_time, arrival_time, price]
        });
        res.json({ message: 'Flight added', id: Number(result.lastInsertRowid) });
    } catch (err) {
        res.status(500).json({ message: 'Error' });
    }
});

module.exports = router;

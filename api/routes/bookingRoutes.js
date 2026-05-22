const express = require('express');
const db = require('../db/database');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', protect, async (req, res) => {
    try {
        const userId = req.user.id;
        const result = await db.execute({
            sql: `SELECT b.*, f.origin, f.destination, f.departure_time, f.arrival_time 
                  FROM Bookings b JOIN Flights f ON b.flight_id = f.id 
                  WHERE b.user_id = ? ORDER BY b.booking_date DESC`,
            args: [userId]
        });
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

router.post('/', protect, async (req, res) => {
    try {
        const { flight_id, total_price, passengers } = req.body;
        const userId = req.user.id;

        const bookingResult = await db.execute({
            sql: 'INSERT INTO Bookings (user_id, flight_id, total_price) VALUES (?, ?, ?)',
            args: [userId, flight_id, total_price]
        });
        const bookingId = Number(bookingResult.lastInsertRowid);

        for (const p of passengers) {
            await db.execute({
                sql: 'INSERT INTO Tickets (booking_id, seat_number, passenger_name) VALUES (?, ?, ?)',
                args: [bookingId, p.seat, p.name]
            });
        }

        res.status(201).json({ message: 'Booking successful', bookingId });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error creating booking' });
    }
});

module.exports = router;

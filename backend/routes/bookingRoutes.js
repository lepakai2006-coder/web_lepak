const express = require('express');
const db = require('../db/database');
const { protect } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/', protect, (req, res) => {
    const userId = req.user.id;
    db.all(`
        SELECT b.*, f.origin, f.destination, f.departure_time, f.arrival_time 
        FROM Bookings b
        JOIN Flights f ON b.flight_id = f.id
        WHERE b.user_id = ?
        ORDER BY b.booking_date DESC
    `, [userId], (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

router.post('/', protect, (req, res) => {
    const { flight_id, total_price, passengers } = req.body;
    const userId = req.user.id;
    
    db.run('BEGIN TRANSACTION');
    
    db.run('INSERT INTO Bookings (user_id, flight_id, total_price) VALUES (?, ?, ?)', 
    [userId, flight_id, total_price], function(err) {
        if (err) {
            db.run('ROLLBACK');
            return res.status(500).json({ message: 'Error creating booking' });
        }
        const bookingId = this.lastID;
        
        let ticketsInserted = 0;
        passengers.forEach(p => {
            db.run('INSERT INTO Tickets (booking_id, seat_number, passenger_name) VALUES (?, ?, ?)', 
            [bookingId, p.seat, p.name], (err) => {
                if (err) {
                    db.run('ROLLBACK');
                    return res.status(500).json({ message: 'Error creating tickets' });
                }
                ticketsInserted++;
                if (ticketsInserted === passengers.length) {
                    db.run('COMMIT');
                    res.status(201).json({ message: 'Booking successful', bookingId });
                }
            });
        });
        
        if (passengers.length === 0) {
            db.run('COMMIT');
            res.status(201).json({ message: 'Booking successful', bookingId });
        }
    });
});

module.exports = router;

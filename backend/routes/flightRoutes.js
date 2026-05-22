const express = require('express');
const db = require('../db/database');
const router = express.Router();

router.get('/', (req, res) => {
    const { origin, destination, date } = req.query;
    let query = `
        SELECT f.*, a.name as aircraft_name, a.capacity 
        FROM Flights f 
        JOIN Aircrafts a ON f.aircraft_id = a.id
        WHERE 1=1
    `;
    const params = [];
    if (origin) {
        query += " AND f.origin LIKE ?";
        params.push(`%${origin}%`);
    }
    if (destination) {
        query += " AND f.destination LIKE ?";
        params.push(`%${destination}%`);
    }
    if (date) {
        query += " AND date(f.departure_time) = ?";
        params.push(date);
    }
    
    db.all(query, params, (err, rows) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(rows);
    });
});

router.get('/:id', (req, res) => {
    const { id } = req.params;
    db.get(`
        SELECT f.*, a.name as aircraft_name, a.capacity 
        FROM Flights f 
        JOIN Aircrafts a ON f.aircraft_id = a.id 
        WHERE f.id = ?`, [id], (err, row) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!row) return res.status(404).json({ message: 'Flight not found' });
        
        // Also get booked tickets to calculate available seats
        db.all('SELECT seat_number FROM Tickets WHERE booking_id IN (SELECT id FROM Bookings WHERE flight_id = ?)', [id], (err, tickets) => {
            if (!err) row.booked_seats = tickets.map(t => t.seat_number);
            res.json(row);
        });
    });
});

module.exports = router;

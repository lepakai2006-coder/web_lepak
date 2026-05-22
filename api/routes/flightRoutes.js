const express = require('express');
const db = require('../db/database');
const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const { origin, destination, date } = req.query;
        let query = `SELECT f.*, a.name as aircraft_name, a.capacity FROM Flights f JOIN Aircrafts a ON f.aircraft_id = a.id WHERE 1=1`;
        const args = [];

        if (origin) { query += " AND f.origin LIKE ?"; args.push(`%${origin}%`); }
        if (destination) { query += " AND f.destination LIKE ?"; args.push(`%${destination}%`); }
        if (date) { query += " AND date(f.departure_time) = ?"; args.push(date); }

        const result = await db.execute({ sql: query, args });
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await db.execute({
            sql: `SELECT f.*, a.name as aircraft_name, a.capacity FROM Flights f JOIN Aircrafts a ON f.aircraft_id = a.id WHERE f.id = ?`,
            args: [id]
        });
        const row = result.rows[0];
        if (!row) return res.status(404).json({ message: 'Flight not found' });

        const tickets = await db.execute({
            sql: 'SELECT seat_number FROM Tickets WHERE booking_id IN (SELECT id FROM Bookings WHERE flight_id = ?)',
            args: [id]
        });
        row.booked_seats = tickets.rows.map(t => t.seat_number);
        res.json(row);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

module.exports = router;

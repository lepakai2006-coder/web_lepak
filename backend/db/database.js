const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'airline.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initDb();
    }
});

function initDb() {
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS Users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password TEXT NOT NULL,
            role TEXT NOT NULL CHECK(role IN ('Admin', 'Client', 'Crew')) DEFAULT 'Client'
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS Aircrafts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            model TEXT NOT NULL,
            capacity INTEGER NOT NULL
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS Flights (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            aircraft_id INTEGER NOT NULL,
            origin TEXT NOT NULL,
            destination TEXT NOT NULL,
            departure_time DATETIME NOT NULL,
            arrival_time DATETIME NOT NULL,
            price REAL NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('Scheduled', 'Delayed', 'Cancelled', 'Completed')) DEFAULT 'Scheduled',
            FOREIGN KEY(aircraft_id) REFERENCES Aircrafts(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS Bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            flight_id INTEGER NOT NULL,
            booking_date DATETIME DEFAULT CURRENT_TIMESTAMP,
            total_price REAL NOT NULL,
            status TEXT NOT NULL CHECK(status IN ('Pending', 'Confirmed', 'Cancelled')) DEFAULT 'Confirmed',
            FOREIGN KEY(user_id) REFERENCES Users(id),
            FOREIGN KEY(flight_id) REFERENCES Flights(id)
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS Tickets (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            booking_id INTEGER NOT NULL,
            seat_number TEXT NOT NULL,
            passenger_name TEXT NOT NULL,
            FOREIGN KEY(booking_id) REFERENCES Bookings(id)
        )`);

        db.get("SELECT * FROM Users WHERE role = 'Admin'", (err, row) => {
            if (!row) {
                const salt = bcrypt.genSaltSync(10);
                const hash = bcrypt.hashSync('admin123', salt);
                db.run("INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, ?)", 
                    ['System Admin', 'admin@airline.com', hash, 'Admin']);
            }
        });
    });
}

module.exports = db;

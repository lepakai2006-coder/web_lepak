const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

const dbPath = path.resolve(__dirname, 'db', 'airline.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
        process.exit(1);
    }
});

db.serialize(() => {
    // 1. Update Admin credentials
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('admin', salt);
    db.run("UPDATE Users SET email = 'admin', password = ? WHERE role = 'Admin'", [hash], (err) => {
        if (err) console.error("Error updating admin", err);
        else console.log("Admin credentials updated to admin / admin");
    });

    // 2. Insert Aircrafts
    db.run(`INSERT INTO Aircrafts (name, model, capacity) VALUES 
        ('Boeing', '737 MAX', 180),
        ('Airbus', 'A320neo', 160),
        ('Boeing', '787 Dreamliner', 250)
    `, function(err) {
        if (err) console.error("Error inserting aircrafts", err);
        else console.log("Inserted aircrafts");
    });

    // 3. Insert Flights
    // Note: SQLite doesn't have a great date generator, so we just use Javascript dates.
    const now = new Date();
    const tomorrow = new Date(now); tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now); nextWeek.setDate(nextWeek.getDate() + 7);

    db.run(`INSERT INTO Flights (aircraft_id, origin, destination, departure_time, arrival_time, price, status) VALUES 
        (1, 'JFK', 'LHR', ?, ?, 450.00, 'Scheduled'),
        (2, 'CDG', 'JFK', ?, ?, 550.00, 'Scheduled'),
        (3, 'DXB', 'JFK', ?, ?, 800.00, 'Scheduled'),
        (1, 'LHR', 'CDG', ?, ?, 120.00, 'Scheduled')
    `, [
        tomorrow.toISOString(), new Date(tomorrow.getTime() + 7*3600*1000).toISOString(),
        tomorrow.toISOString(), new Date(tomorrow.getTime() + 8*3600*1000).toISOString(),
        nextWeek.toISOString(), new Date(nextWeek.getTime() + 14*3600*1000).toISOString(),
        now.toISOString(), new Date(now.getTime() + 1.5*3600*1000).toISOString()
    ], function(err) {
        if (err) console.error("Error inserting flights", err);
        else console.log("Inserted flights");
    });

    // 4. Create a dummy client user
    const clientHash = bcrypt.hashSync('password', salt);
    db.run("INSERT OR IGNORE INTO Users (name, email, password, role) VALUES ('John Doe', 'john@example.com', ?, 'Client')", [clientHash], function(err) {
        if (err) console.error("Error inserting client", err);
        else {
            console.log("Inserted dummy client");
            const clientId = this.lastID;

            // 5. Insert some dummy bookings for the stats
            db.run(`INSERT INTO Bookings (user_id, flight_id, total_price, status) VALUES 
                (?, 1, 900.00, 'Confirmed'),
                (?, 2, 550.00, 'Confirmed')
            `, [clientId, clientId], function(err) {
                if (err) console.error("Error inserting bookings", err);
                else {
                    console.log("Inserted dummy bookings");
                    db.close(() => {
                        console.log("Database seeded successfully!");
                        process.exit(0);
                    });
                }
            });
        }
    });
});

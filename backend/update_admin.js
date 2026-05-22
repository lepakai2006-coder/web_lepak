const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'db', 'airline.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database', err.message);
        process.exit(1);
    }
});

db.serialize(() => {
    db.run("UPDATE Users SET email = 'admin@example.com' WHERE role = 'Admin'", (err) => {
        if (err) console.error("Error updating admin email", err);
        else console.log("Admin email updated successfully to admin@example.com");
        
        db.close(() => {
            process.exit(0);
        });
    });
});

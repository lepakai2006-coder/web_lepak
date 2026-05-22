const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, 'db', 'airline.db');
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY);

let sqlDump = '-- Airline Booking DB Dump\n\n';

db.serialize(() => {
    db.all("SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'", (err, tables) => {
        if (err) throw err;
        
        if (tables.length === 0) {
            console.log('No tables found.');
            db.close();
            return;
        }

        let pending = tables.length;
        
        tables.forEach(table => {
            sqlDump += table.sql + ';\n\n';
            
            db.all(`SELECT * FROM ${table.name}`, (err, rows) => {
                if (err) throw err;
                
                rows.forEach(row => {
                    const columns = Object.keys(row).join(', ');
                    const values = Object.values(row).map(v => {
                        if (v === null) return 'NULL';
                        if (typeof v === 'string') return `'${v.replace(/'/g, "''")}'`;
                        return v;
                    }).join(', ');
                    
                    sqlDump += `INSERT INTO ${table.name} (${columns}) VALUES (${values});\n`;
                });
                
                sqlDump += '\n';
                pending--;
                
                if (pending === 0) {
                    const outputPath = path.resolve(__dirname, 'airline_dump.sql');
                    fs.writeFileSync(outputPath, sqlDump);
                    console.log(`Dump completed`);
                    db.close();
                }
            });
        });
    });
});

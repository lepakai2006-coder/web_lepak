const { createClient } = require('@libsql/client');
const fs = require('fs');
const path = require('path');

const url = "libsql://airline-yuriy21.aws-eu-west-1.turso.io";
const authToken = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3Nzk0NzMzMTcsImlkIjoiMDE5ZTUwZDgtYjMwMS03M2IyLWFhYjMtOGEzMTc4NTA5MjVkIiwicmlkIjoiYjdlMTJjZGYtNjgxMS00Yzc5LWIzNWMtZWIxNDM1NTZkMzI4In0.58awMiPuhAaKPUZ9Ze6odPjkgr9mOSdqzaC_KBXf8nv-uJzOvQ2vrQouqcXUy1J9tgDu-VnWUkNBygAOhG86CQ";

const client = createClient({
  url,
  authToken
});

async function main() {
    try {
        console.log("Dropping existing tables to ensure clean slate...");
        const tablesToDrop = ['Tickets', 'Bookings', 'Flights', 'Aircrafts', 'Users'];
        for (const table of tablesToDrop) {
            await client.execute(`DROP TABLE IF EXISTS ${table}`);
        }

        const sqlPath = path.resolve(__dirname, 'airline_dump.sql');
        let sqlDump = fs.readFileSync(sqlPath, 'utf8');
        
        sqlDump = sqlDump.replace(/--.*/g, '');
        sqlDump = sqlDump.replace(/CREATE TABLE/g, 'CREATE TABLE IF NOT EXISTS');

        const statements = sqlDump.split(';')
                                  .map(s => s.trim())
                                  .filter(s => s.length > 0);

        const creates = statements.filter(s => s.startsWith('CREATE'));
        const inserts = statements.filter(s => s.startsWith('INSERT'));

        const tableOrder = ['Users', 'Aircrafts', 'Flights', 'Bookings', 'Tickets'];
        inserts.sort((a, b) => {
           const tableA = a.split(' ')[2];
           const tableB = b.split(' ')[2];
           return tableOrder.indexOf(tableA) - tableOrder.indexOf(tableB);
        });

        const orderedStatements = [...creates, ...inserts];

        console.log(`Found ${orderedStatements.length} statements to execute.`);
        
        for (const statement of orderedStatements) {
            console.log("Executing:", statement.substring(0, 50).replace(/\n/g, ' ') + "...");
            await client.execute(statement);
        }
        
        console.log("Successfully imported dump into Turso DB!");
    } catch (e) {
        console.error("Error connecting or executing:", e);
    }
}

main();

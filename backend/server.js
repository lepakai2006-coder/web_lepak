const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const db = require('./db/database'); // Initialize DB

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Dummy routes to prevent crash before they are created
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/flights', require('./routes/flightRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

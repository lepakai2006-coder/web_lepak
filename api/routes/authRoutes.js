const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { JWT_SECRET } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existing = await db.execute({ sql: 'SELECT email FROM Users WHERE email = ?', args: [email] });
        if (existing.rows.length > 0) return res.status(400).json({ message: 'User already exists' });

        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);

        const result = await db.execute({ sql: 'INSERT INTO Users (name, email, password) VALUES (?, ?, ?)', args: [name, email, hash] });
        res.status(201).json({ message: 'User registered successfully', userId: Number(result.lastInsertRowid) });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const result = await db.execute({ sql: 'SELECT * FROM Users WHERE email = ?', args: [email] });
        const user = result.rows[0];
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });

        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return res.status(401).json({ message: 'Invalid email or password' });

        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});

module.exports = router;

const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { JWT_SECRET } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', (req, res) => {
    const { name, email, password } = req.body;
    db.get('SELECT email FROM Users WHERE email = ?', [email], (err, row) => {
        if (row) return res.status(400).json({ message: 'User already exists' });
        
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync(password, salt);
        
        db.run('INSERT INTO Users (name, email, password) VALUES (?, ?, ?)', [name, email, hash], function(err) {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
        });
    });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    db.get('SELECT * FROM Users WHERE email = ?', [email], (err, user) => {
        if (!user) return res.status(401).json({ message: 'Invalid email or password' });
        
        const isValid = bcrypt.compareSync(password, user.password);
        if (!isValid) return res.status(401).json({ message: 'Invalid email or password' });
        
        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '30d' });
        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    });
});

module.exports = router;

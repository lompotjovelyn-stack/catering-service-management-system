const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { authenticate, authorize } = require('../middleware/auth');
const logAction = require('../utils/audit');

const router = express.Router();

function signToken(user) {
    return jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
    );
}

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, role = 'customer' } = req.body;
        const allowedSelfRegisterRoles = ['customer', 'vendor'];

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        if (!allowedSelfRegisterRoles.includes(role)) {
            return res.status(400).json({ message: 'Only customer and vendor self-registration is allowed' });
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'Email is already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, phone, role });
        await logAction(user.id, 'register', 'User', user.id, { role });

        const token = signToken(user);
        const safeUser = user.toJSON();
        delete safeUser.password;

        res.status(201).json({ message: 'User registered', token, user: safeUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is inactive' });
        }

        await logAction(user.id, 'login', 'User', user.id);

        const token = signToken(user);
        const safeUser = user.toJSON();
        delete safeUser.password;

        res.json({ token, user: safeUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get('/me', authenticate, (req, res) => {
    res.json({ user: req.user });
});

router.post('/users', authenticate, authorize('admin'), async (req, res) => {
    try {
        const { name, email, password, phone, role = 'customer' } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword, phone, role });
        await logAction(req.user.id, 'create', 'User', user.id, { role });

        const safeUser = user.toJSON();
        delete safeUser.password;

        res.status(201).json(safeUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

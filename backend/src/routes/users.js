const express = require('express');
const User = require('../models/User');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/dashboard', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const totalUsers = await User.getTotalCount();
        const totalStores = await Store.getTotalCount();
        const totalRatings = await Rating.getTotalCount();

        res.json({
            totalUsers,
            totalStores,
            totalRatings
        });
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const { search, sortBy, order, role } = req.query;
        const filters = { search, sortBy, order, role };
        
        const users = await User.getAll(filters);
        res.json(users);
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

router.get('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let userDetails = { ...user };

        if (user.role === 'store_owner') {
            const store = await Store.findByOwner(user.id);
            if (store) {
                userDetails.store = store;
            }
        }

        res.json(userDetails);
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
});

router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const { name, email, password, address, role } = req.body;

        if (!name || name.length < 20 || name.length > 60) {
            return res.status(400).json({ error: 'Name must be between 20 and 60 characters' });
        }

        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
        if (!passwordRegex.test(password)) {
            return res.status(400).json({ 
                error: 'Password must be 8-16 characters with at least one uppercase letter and one special character' 
            });
        }

        if (address && address.length > 400) {
            return res.status(400).json({ error: 'Address must not exceed 400 characters' });
        }

        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const userId = await User.create({ name, email, password, address, role });
        const user = await User.findById(userId);

        res.status(201).json({
            message: 'User created successfully',
            user
        });
    } catch (error) {
        console.error('Create user error:', error);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

module.exports = router;
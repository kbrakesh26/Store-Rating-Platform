const express = require('express');
const Store = require('../models/Store');
const Rating = require('../models/Rating');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
    try {
        const { search, sortBy, order } = req.query;
        const filters = { search, sortBy, order };

        let stores;
        if (req.user.role === 'user') {
            stores = await Store.getAllWithUserRating(req.user.id, filters);
        } else {
            stores = await Store.getAll(filters);
        }

        res.json(stores);
    } catch (error) {
        console.error('Get stores error:', error);
        res.status(500).json({ error: 'Failed to fetch stores' });
    }
});

router.get('/:id', authenticateToken, async (req, res) => {
    try {
        const store = await Store.findById(req.params.id);
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        const ratings = await Store.getStoreRatings(req.params.id);
        res.json({ ...store, ratings });
    } catch (error) {
        console.error('Get store error:', error);
        res.status(500).json({ error: 'Failed to fetch store details' });
    }
});

router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const { name, email, address, owner_id } = req.body;

        if (!name || !email || !address) {
            return res.status(400).json({ error: 'Name, email, and address are required' });
        }

        const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        if (address.length > 400) {
            return res.status(400).json({ error: 'Address must not exceed 400 characters' });
        }

        const storeId = await Store.create({ name, email, address, owner_id });
        const store = await Store.findById(storeId);

        res.status(201).json({
            message: 'Store created successfully',
            store
        });
    } catch (error) {
        console.error('Create store error:', error);
        res.status(500).json({ error: 'Failed to create store' });
    }
});

// Delete store endpoint (admin only)
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
    try {
        const storeId = req.params.id;
        
        // Check if store exists
        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        // Delete the store (this will cascade delete ratings due to foreign key constraints)
        await Store.delete(storeId);
        
        res.json({ message: 'Store deleted successfully' });
    } catch (error) {
        console.error('Delete store error:', error);
        res.status(500).json({ error: 'Failed to delete store' });
    }
});

router.get('/owner/dashboard', authenticateToken, authorizeRoles('store_owner'), async (req, res) => {
    try {
        const store = await Store.findByOwner(req.user.id);
        if (!store) {
            return res.status(404).json({ error: 'No store found for this owner' });
        }

        const ratings = await Rating.getStoreRatings(store.id);
        const usersWhoRated = await Rating.getUsersWhoRatedStore(store.id);
        
        res.json({
            store,
            ratings,
            usersWhoRated,
            averageRating: store.average_rating,
            totalRatings: store.total_ratings
        });
    } catch (error) {
        console.error('Store owner dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch store dashboard' });
    }
});

module.exports = router;
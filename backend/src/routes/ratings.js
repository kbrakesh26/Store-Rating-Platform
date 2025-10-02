const express = require('express');
const Rating = require('../models/Rating');
const Store = require('../models/Store');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

router.post('/', authenticateToken, authorizeRoles('user'), async (req, res) => {
    try {
        const { storeId, rating } = req.body;

        if (!storeId || !rating) {
            return res.status(400).json({ error: 'Store ID and rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const store = await Store.findById(storeId);
        if (!store) {
            return res.status(404).json({ error: 'Store not found' });
        }

        await Rating.create(req.user.id, storeId, rating);

        res.json({ message: 'Rating submitted successfully' });
    } catch (error) {
        console.error('Submit rating error:', error);
        res.status(500).json({ error: 'Failed to submit rating' });
    }
});

router.get('/user/:userId', authenticateToken, async (req, res) => {
    try {
        const userId = req.params.userId;

        if (req.user.role !== 'admin' && req.user.id !== parseInt(userId)) {
            return res.status(403).json({ error: 'Access denied' });
        }

        const ratings = await Rating.getUserRatings(userId);
        res.json(ratings);
    } catch (error) {
        console.error('Get user ratings error:', error);
        res.status(500).json({ error: 'Failed to fetch user ratings' });
    }
});

router.get('/store/:storeId', authenticateToken, async (req, res) => {
    try {
        const ratings = await Rating.getStoreRatings(req.params.storeId);
        res.json(ratings);
    } catch (error) {
        console.error('Get store ratings error:', error);
        res.status(500).json({ error: 'Failed to fetch store ratings' });
    }
});

router.put('/', authenticateToken, authorizeRoles('user'), async (req, res) => {
    try {
        const { storeId, rating } = req.body;

        if (!storeId || !rating) {
            return res.status(400).json({ error: 'Store ID and rating are required' });
        }

        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5' });
        }

        const existingRating = await Rating.findByUserAndStore(req.user.id, storeId);
        if (!existingRating) {
            return res.status(404).json({ error: 'No existing rating found to update' });
        }

        await Rating.create(req.user.id, storeId, rating);

        res.json({ message: 'Rating updated successfully' });
    } catch (error) {
        console.error('Update rating error:', error);
        res.status(500).json({ error: 'Failed to update rating' });
    }
});

router.delete('/:storeId', authenticateToken, authorizeRoles('user'), async (req, res) => {
    try {
        const storeId = req.params.storeId;

        const existingRating = await Rating.findByUserAndStore(req.user.id, storeId);
        if (!existingRating) {
            return res.status(404).json({ error: 'No rating found to delete' });
        }

        await Rating.delete(req.user.id, storeId);

        res.json({ message: 'Rating deleted successfully' });
    } catch (error) {
        console.error('Delete rating error:', error);
        res.status(500).json({ error: 'Failed to delete rating' });
    }
});

module.exports = router;
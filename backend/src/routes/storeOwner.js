const express = require('express');
const router = express.Router();
const { executeQuery, getOne } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Get store owner dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'store_owner') {
            return res.status(403).json({ error: 'Access denied. Store owner role required.' });
        }

        // Get the store owned by this user
        const store = await getOne(
            'SELECT id, name, email, address, average_rating, total_ratings FROM stores WHERE owner_id = ?',
            [req.user.id]
        );

        if (!store) {
            return res.status(404).json({ error: 'No store found for this owner' });
        }

        // Get users who have rated this store
        const ratingUsers = await executeQuery(`
            SELECT 
                u.id,
                u.name,
                u.email,
                u.address,
                r.rating,
                r.created_at as rating_date
            FROM ratings r
            JOIN users u ON r.user_id = u.id
            WHERE r.store_id = ?
            ORDER BY r.created_at DESC
        `, [store.id]);

        res.json({
            store: {
                id: store.id,
                name: store.name,
                email: store.email,
                address: store.address,
                averageRating: store.average_rating,
                totalRatings: store.total_ratings
            },
            ratingUsers: ratingUsers
        });

    } catch (error) {
        console.error('Store owner dashboard error:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});

// Get store owner's store details
router.get('/my-store', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'store_owner') {
            return res.status(403).json({ error: 'Access denied. Store owner role required.' });
        }

        const store = await getOne(
            'SELECT * FROM stores WHERE owner_id = ?',
            [req.user.id]
        );

        if (!store) {
            return res.status(404).json({ error: 'No store found for this owner' });
        }

        res.json(store);

    } catch (error) {
        console.error('Get store error:', error);
        res.status(500).json({ error: 'Failed to fetch store details' });
    }
});

// Update store owner password
router.put('/password', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'store_owner') {
            return res.status(403).json({ error: 'Access denied. Store owner role required.' });
        }

        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        // Password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,16}$/;
        if (!passwordRegex.test(newPassword)) {
            return res.status(400).json({ 
                error: 'Password must be 8-16 characters with at least one uppercase letter, one lowercase letter, one number, and one special character' 
            });
        }

        const bcrypt = require('bcryptjs');
        
        // Get current user
        const user = await getOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
        
        // Verify current password
        const isValidPassword = await bcrypt.compare(currentPassword, user.password);
        if (!isValidPassword) {
            return res.status(400).json({ error: 'Current password is incorrect' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS));
        
        // Update password
        await executeQuery('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);

        res.json({ message: 'Password updated successfully' });

    } catch (error) {
        console.error('Password update error:', error);
        res.status(500).json({ error: 'Failed to update password' });
    }
});

module.exports = router;
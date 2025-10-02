const { executeQuery, getOne } = require('../config/database');

class Rating {
    static async create(userId, storeId, rating) {
        const query = `
            INSERT INTO ratings (user_id, store_id, rating) 
            VALUES (?, ?, ?) 
            ON DUPLICATE KEY UPDATE rating = VALUES(rating), updated_at = CURRENT_TIMESTAMP
        `;
        const result = await executeQuery(query, [userId, storeId, rating]);
        return result;
    }

    static async findByUserAndStore(userId, storeId) {
        return await getOne('SELECT * FROM ratings WHERE user_id = ? AND store_id = ?', [userId, storeId]);
    }

    static async getUserRatings(userId) {
        const query = `
            SELECT r.*, s.name as store_name, s.address as store_address 
            FROM ratings r 
            JOIN stores s ON r.store_id = s.id 
            WHERE r.user_id = ? 
            ORDER BY r.updated_at DESC
        `;
        return await executeQuery(query, [userId]);
    }

    static async getStoreRatings(storeId) {
        const query = `
            SELECT r.*, u.name as user_name 
            FROM ratings r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.store_id = ? 
            ORDER BY r.created_at DESC
        `;
        return await executeQuery(query, [storeId]);
    }

    static async getTotalCount() {
        const result = await getOne('SELECT COUNT(*) as count FROM ratings');
        return result.count;
    }

    static async getUsersWhoRatedStore(storeId) {
        const query = `
            SELECT DISTINCT u.id, u.name, u.email, r.rating, r.created_at
            FROM users u 
            JOIN ratings r ON u.id = r.user_id 
            WHERE r.store_id = ? 
            ORDER BY r.created_at DESC
        `;
        return await executeQuery(query, [storeId]);
    }

    static async delete(userId, storeId) {
        await executeQuery('DELETE FROM ratings WHERE user_id = ? AND store_id = ?', [userId, storeId]);
    }
}

module.exports = Rating;
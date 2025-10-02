const { executeQuery, getOne } = require('../config/database');

class Store {
    static async create(storeData) {
        const { name, email, address, owner_id } = storeData;
        const query = 'INSERT INTO stores (name, email, address, owner_id) VALUES (?, ?, ?, ?)';
        const result = await executeQuery(query, [name, email, address, owner_id]);
        return result.insertId;
    }

    static async findById(id) {
        return await getOne('SELECT * FROM stores WHERE id = ?', [id]);
    }

    static async findByOwner(ownerId) {
        return await getOne('SELECT * FROM stores WHERE owner_id = ?', [ownerId]);
    }

    static async getAll(filters = {}) {
        let query = `
            SELECT s.*, u.name as owner_name 
            FROM stores s 
            LEFT JOIN users u ON s.owner_id = u.id 
            WHERE 1=1
        `;
        const params = [];

        if (filters.search) {
            query += ' AND (s.name LIKE ? OR s.address LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }

        if (filters.sortBy) {
            const allowedSorts = ['name', 'email', 'address', 'average_rating', 'created_at'];
            if (allowedSorts.includes(filters.sortBy)) {
                const order = filters.order === 'desc' ? 'DESC' : 'ASC';
                query += ` ORDER BY s.${filters.sortBy} ${order}`;
            }
        }

        return await executeQuery(query, params);
    }

    static async getAllWithUserRating(userId, filters = {}) {
        let query = `
            SELECT s.*, u.name as owner_name,
                   r.rating as user_rating
            FROM stores s 
            LEFT JOIN users u ON s.owner_id = u.id 
            LEFT JOIN ratings r ON s.id = r.store_id AND r.user_id = ?
            WHERE 1=1
        `;
        const params = [userId];

        if (filters.search) {
            query += ' AND (s.name LIKE ? OR s.address LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm);
        }

        if (filters.sortBy) {
            const allowedSorts = ['name', 'address', 'average_rating'];
            if (allowedSorts.includes(filters.sortBy)) {
                const order = filters.order === 'desc' ? 'DESC' : 'ASC';
                query += ` ORDER BY s.${filters.sortBy} ${order}`;
            }
        }

        return await executeQuery(query, params);
    }

    static async getTotalCount() {
        const result = await getOne('SELECT COUNT(*) as count FROM stores');
        return result.count;
    }

    static async getStoreRatings(storeId) {
        const query = `
            SELECT r.rating, r.created_at, u.name as user_name 
            FROM ratings r 
            JOIN users u ON r.user_id = u.id 
            WHERE r.store_id = ? 
            ORDER BY r.created_at DESC
        `;
        return await executeQuery(query, [storeId]);
    }

    static async delete(id) {
        const query = 'DELETE FROM stores WHERE id = ?';
        return await executeQuery(query, [id]);
    }
}

module.exports = Store;
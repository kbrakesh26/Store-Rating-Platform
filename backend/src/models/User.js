const { executeQuery, getOne } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // TODO: Add email validation in future version
    static async create(userData) {
        const { name, email, password, address, role = 'user' } = userData;
        const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS));
        
        const query = 'INSERT INTO users (name, email, password, address, role) VALUES (?, ?, ?, ?, ?)';
        const result = await executeQuery(query, [name, email, hashedPassword, address, role]);
        return result.insertId;
    }

    static async findByEmail(email) {
        return await getOne('SELECT * FROM users WHERE email = ?', [email]);
    }

    static async findById(id) {
        return await getOne('SELECT id, name, email, address, role, created_at FROM users WHERE id = ?', [id]);
    }

    static async getAll(filters = {}) {
        let query = 'SELECT id, name, email, address, role, created_at FROM users WHERE 1=1';
        const params = [];

        if (filters.role) {
            query += ' AND role = ?';
            params.push(filters.role);
        }

        if (filters.search) {
            query += ' AND (name LIKE ? OR email LIKE ? OR address LIKE ?)';
            const searchTerm = `%${filters.search}%`;
            params.push(searchTerm, searchTerm, searchTerm);
        }

        if (filters.sortBy) {
            const allowedSorts = ['name', 'email', 'role', 'created_at'];
            if (allowedSorts.includes(filters.sortBy)) {
                const order = filters.order === 'desc' ? 'DESC' : 'ASC';
                query += ` ORDER BY ${filters.sortBy} ${order}`;
            }
        }

        return await executeQuery(query, params);
    }

    static async updatePassword(userId, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, parseInt(process.env.BCRYPT_ROUNDS));
        await executeQuery('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);
    }

    static async verifyPassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }

    static async getTotalCount() {
        const result = await getOne('SELECT COUNT(*) as count FROM users');
        return result.count;
    }

    static async delete(id) {
        const query = 'DELETE FROM users WHERE id = ?';
        return await executeQuery(query, [id]);
    }
}

module.exports = User;
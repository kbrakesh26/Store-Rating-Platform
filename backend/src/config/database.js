const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'store_rating_app',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

const promisePool = pool.promise();

const testConnection = async () => {
    try {
        const connection = await promisePool.getConnection();
        console.log('Database connected successfully!');
        connection.release();
        return true;
    } catch (error) {
        console.error('Database connection failed:', error.message);
        return false;
    }
};

const executeQuery = async (query, params = []) => {
    try {
        const [rows] = await promisePool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

const getOne = async (query, params = []) => {
    try {
        const [rows] = await promisePool.execute(query, params);
        return rows[0] || null;
    } catch (error) {
        console.error('Database query error:', error);
        throw error;
    }
};

const executeTransaction = async (queries) => {
    const connection = await promisePool.getConnection();
    try {
        await connection.beginTransaction();
        
        const results = [];
        for (const { query, params = [] } of queries) {
            const [result] = await connection.execute(query, params);
            results.push(result);
        }
        
        await connection.commit();
        return results;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

module.exports = {
    pool,
    promisePool,
    testConnection,
    executeQuery,
    getOne,
    executeTransaction
};
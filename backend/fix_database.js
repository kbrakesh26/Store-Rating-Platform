const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixDatabase() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Connected to database. Checking users table structure...');
        
        // Check current table structure
        const [columns] = await connection.execute('DESCRIBE users');
        console.log('Current users table structure:');
        columns.forEach(col => {
            console.log(`${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default} ${col.Extra}`);
        });

        // Check if created_at column exists
        const hasCreatedAt = columns.some(col => col.Field === 'created_at');
        const hasUpdatedAt = columns.some(col => col.Field === 'updated_at');

        if (!hasCreatedAt) {
            console.log('Adding created_at column...');
            await connection.execute(
                'ALTER TABLE users ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
            );
        }

        if (!hasUpdatedAt) {
            console.log('Adding updated_at column...');
            await connection.execute(
                'ALTER TABLE users ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
            );
        }

        // Check stores table too
        console.log('\nChecking stores table structure...');
        const [storeColumns] = await connection.execute('DESCRIBE stores');
        console.log('Current stores table structure:');
        storeColumns.forEach(col => {
            console.log(`${col.Field}: ${col.Type} ${col.Null} ${col.Key} ${col.Default} ${col.Extra}`);
        });

        console.log('Database structure fixed!');

    } catch (error) {
        console.error('Error fixing database:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

fixDatabase();
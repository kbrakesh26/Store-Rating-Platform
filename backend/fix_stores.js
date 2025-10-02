const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixStoresTable() {
    let connection;
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log('Fixing stores table...');
        
        // Check stores table structure
        const [columns] = await connection.execute('DESCRIBE stores');
        console.log('Current stores table structure:');
        columns.forEach(col => {
            console.log(`${col.Field}: ${col.Type}`);
        });

        // Add missing columns to stores table
        const hasCreatedAt = columns.some(col => col.Field === 'created_at');
        const hasUpdatedAt = columns.some(col => col.Field === 'updated_at');
        const hasAverageRating = columns.some(col => col.Field === 'average_rating');
        const hasTotalRatings = columns.some(col => col.Field === 'total_ratings');

        if (!hasCreatedAt) {
            console.log('Adding created_at column to stores...');
            await connection.execute(
                'ALTER TABLE stores ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
            );
        }

        if (!hasUpdatedAt) {
            console.log('Adding updated_at column to stores...');
            await connection.execute(
                'ALTER TABLE stores ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
            );
        }

        if (!hasAverageRating) {
            console.log('Adding average_rating column to stores...');
            await connection.execute(
                'ALTER TABLE stores ADD COLUMN average_rating DECIMAL(2,1) DEFAULT 0.0'
            );
        }

        if (!hasTotalRatings) {
            console.log('Adding total_ratings column to stores...');
            await connection.execute(
                'ALTER TABLE stores ADD COLUMN total_ratings INT DEFAULT 0'
            );
        }

        console.log('Stores table fixed!');

        // Also check ratings table
        console.log('\nChecking ratings table...');
        const [ratingColumns] = await connection.execute('DESCRIBE ratings');
        console.log('Current ratings table structure:');
        ratingColumns.forEach(col => {
            console.log(`${col.Field}: ${col.Type}`);
        });

        const ratingHasCreatedAt = ratingColumns.some(col => col.Field === 'created_at');
        const ratingHasUpdatedAt = ratingColumns.some(col => col.Field === 'updated_at');

        if (!ratingHasCreatedAt) {
            console.log('Adding created_at column to ratings...');
            await connection.execute(
                'ALTER TABLE ratings ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
            );
        }

        if (!ratingHasUpdatedAt) {
            console.log('Adding updated_at column to ratings...');
            await connection.execute(
                'ALTER TABLE ratings ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
            );
        }

        console.log('All tables fixed!');

    } catch (error) {
        console.error('Error fixing stores table:', error);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

fixStoresTable();
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration pour Railway (utilise les variables MYSQL_*)
const pool = mysql.createPool({
    host: process.env.MYSQLHOST || 'localhost',
    port: parseInt(process.env.MYSQLPORT || '3306'),
    user: process.env.MYSQLUSER || 'root',
    password: process.env.MYSQLPASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'voyage_reservation',
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    ssl: false
});

async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connexion à MySQL réussie !');
        console.log(`📊 Base de données: ${process.env.MYSQL_DATABASE || 'voyage_reservation'}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Erreur de connexion à MySQL:', error.message);
        return false;
    }
}

module.exports = { pool, testConnection };
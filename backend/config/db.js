const mysql = require('mysql2/promise');
require('dotenv').config();

// Créer le pool de connexions
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'voyage_reservation',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    charset: 'utf8mb4'
});

// Fonction de test de connexion
async function testConnection() {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connexion à MySQL réussie !');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Erreur de connexion à MySQL:', error.message);
        console.error('   Vérifiez que MySQL est démarré dans XAMPP');
        return false;
    }
}

module.exports = {
    pool,
    testConnection
};
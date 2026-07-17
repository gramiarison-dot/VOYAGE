const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration du pool MySQL
let pool = null;

// Vérifier si nous avons des variables de base de données
const hasDbVars = process.env.DB_HOST || process.env.MYSQLHOST;

if (hasDbVars) {
    try {
        pool = mysql.createPool({
            host: process.env.DB_HOST || process.env.MYSQLHOST || 'localhost',
            port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT || '3306'),
            user: process.env.DB_USER || process.env.MYSQLUSER || 'root',
            password: process.env.DB_PASSWORD || process.env.MYSQLPASSWORD || '',
            database: process.env.DB_NAME || process.env.MYSQL_DATABASE || 'voyage_reservation',
            waitForConnections: true,
            connectionLimit: 5,
            queueLimit: 0,
            connectTimeout: 10000,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        });
        console.log('✅ Pool MySQL créé avec succès');
    } catch (error) {
        console.warn('⚠️ Erreur de création du pool MySQL:', error.message);
        pool = null;
    }
} else {
    console.log('ℹ️ Aucune variable de base de données trouvée. Mode démo activé.');
}

async function testConnection() {
    if (!pool) {
        console.log('ℹ️ Mode démo: base de données non configurée');
        return false;
    }
    try {
        const connection = await pool.getConnection();
        console.log('✅ Connexion à MySQL réussie !');
        console.log(`📊 Base de données: ${process.env.DB_NAME || 'railway'}`);
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Erreur de connexion à MySQL:', error.message);
        return false;
    }
}

module.exports = {
    pool,
    testConnection,
    isConnected: () => pool !== null
};
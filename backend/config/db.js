const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuration de la base de données
let pool = null;
let isConnected = false;

// Fonction pour initialiser la connexion
async function getPool() {
    if (pool) return pool;
    
    // Vérifier si nous avons des variables d'environnement
    const hasDbVars = process.env.DB_HOST || process.env.MYSQLHOST;
    
    if (!hasDbVars) {
        console.log('ℹ️ Aucune variable de base de données trouvée. Mode démo activé.');
        return null;
    }
    
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
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
        });
        
        // Tester la connexion
        const connection = await pool.getConnection();
        connection.release();
        isConnected = true;
        console.log('✅ Connexion à MySQL réussie !');
        console.log(`📊 Base de données: ${process.env.DB_NAME || 'railway'}`);
    } catch (error) {
        console.error('❌ Erreur de connexion à MySQL:', error.message);
        pool = null;
        isConnected = false;
    }
    
    return pool;
}

// Fonction de test de connexion
async function testConnection() {
    const poolInstance = await getPool();
    return poolInstance !== null && isConnected;
}

// Fonction pour exécuter des requêtes (avec fallback)
async function query(sql, params = []) {
    const poolInstance = await getPool();
    if (!poolInstance) {
        // Mode démo : retourner des données fictives
        console.log('ℹ️ Mode démo : requête simulée');
        return simulateQuery(sql);
    }
    try {
        return await poolInstance.query(sql, params);
    } catch (error) {
        console.error('❌ Erreur de requête:', error.message);
        return simulateQuery(sql);
    }
}

// Simulation de données pour le mode démo
function simulateQuery(sql) {
    const sqlLower = sql.toLowerCase();
    
    if (sqlLower.includes('select') && sqlLower.includes('voyages')) {
        return [[
            { id: 1, destination: 'Paris', depart: 'Dakar', date_depart: '2026-08-15', prix: 250000, places_disponibles: 50 },
            { id: 2, destination: 'New York', depart: 'Dakar', date_depart: '2026-08-20', prix: 500000, places_disponibles: 40 },
            { id: 3, destination: 'Dubai', depart: 'Dakar', date_depart: '2026-09-01', prix: 300000, places_disponibles: 30 }
        ], null];
    }
    
    if (sqlLower.includes('select') && sqlLower.includes('users')) {
        return [[
            { id: 1, username: 'admin', email: 'admin@gmail.com', role: 'admin' }
        ], null];
    }
    
    if (sqlLower.includes('insert') || sqlLower.includes('update') || sqlLower.includes('delete')) {
        return [{ affectedRows: 1, insertId: 1 }, null];
    }
    
    return [[], null];
}

module.exports = {
    getPool,
    pool,
    testConnection,
    query,
    isConnected
};
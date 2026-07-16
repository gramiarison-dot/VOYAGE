const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { pool, testConnection } = require('./backend/config/db');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques du frontend
app.use(express.static(path.join(__dirname, 'frontend')));

// Route de test pour l'API
app.get('/api/test', (req, res) => {
    res.json({ 
        message: 'API fonctionne !',
        time: new Date().toISOString()
    });
});

// Routes
app.use('/api/auth', require('./backend/routes/authRoutes'));
app.use('/api/reservations', require('./backend/routes/reservationsRoutes'));
app.use('/api/admin', require('./backend/routes/adminRoutes'));

// Route 404 pour les routes non trouvées
app.use((req, res) => {
    res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error('Erreur globale:', err);
    res.status(500).json({ 
        message: 'Erreur interne du serveur',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Démarrer le serveur
app.listen(PORT, async () => {
    console.log(`\n🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📁 Frontend: http://localhost:${PORT}/pages/index.html`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/pages/admin/dashboard.html`);
    console.log(`🔗 API: http://localhost:${PORT}/api/test\n`);
    
    // Tester la connexion à la base de données
    await testConnection();
});

// Gestion de l'arrêt du serveur
process.on('SIGTERM', () => {
    console.log('🛑 Arrêt du serveur...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Arrêt du serveur...');
    process.exit(0);
});
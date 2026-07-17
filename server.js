const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { pool, testConnection } = require('./backend/config/db');

// Charger les variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// FICHIERS STATIQUES
// ============================================
app.use(express.static(path.join(__dirname, 'frontend')));
app.use('/css', express.static(path.join(__dirname, 'frontend', 'css')));
app.use('/js', express.static(path.join(__dirname, 'frontend', 'js')));
app.use('/pages', express.static(path.join(__dirname, 'frontend', 'pages')));
app.use('/pages/admin', express.static(path.join(__dirname, 'frontend', 'pages', 'admin')));

// ============================================
// ROUTES FRONTEND (PAGES HTML)
// ============================================

// Route racine - Page d'accueil
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'index.html'));
});

// Page d'accueil (explicite)
app.get('/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'index.html'));
});

// Page de connexion
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'login.html'));
});

app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'login.html'));
});

// Page d'inscription
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'register.html'));
});

app.get('/register.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'register.html'));
});

// Page de réservation
app.get('/reservation', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'reservation.html'));
});

app.get('/reservation.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'reservation.html'));
});

// Page d'historique
app.get('/historique', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'historique.html'));
});

app.get('/historique.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'historique.html'));
});

// ============================================
// ROUTES ADMIN
// ============================================

// Dashboard Admin
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'admin', 'dashboard.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'admin', 'dashboard.html'));
});

app.get('/admin/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'admin', 'dashboard.html'));
});

// Gestion Admin
app.get('/admin/gestion', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'admin', 'gestion.html'));
});

app.get('/admin/gestion.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'frontend', 'pages', 'admin', 'gestion.html'));
});

// ============================================
// ROUTES API
// ============================================

// Route de test API
app.get('/api/test', (req, res) => {
    res.json({
        message: 'API fonctionne !',
        time: new Date().toISOString(),
        status: 'OK',
        uptime: process.uptime()
    });
});
// Dans server.js, remplacer les routes API
app.use('/api/reservations', require('./backend/routes/demoRoutes')); // Utiliser demoRoutes
// OU garder les deux avec un fallback
// Routes API - Auth
app.use('/api/auth', require('./backend/routes/authRoutes'));

// Routes API - Réservations
app.use('/api/reservations', require('./backend/routes/reservationsRoutes'));

// Routes API - Admin
app.use('/api/admin', require('./backend/routes/adminRoutes'));

// ============================================
// GESTION DES ERREURS
// ============================================

// Route 404 pour les routes non trouvées (API)
app.use((req, res) => {
    // Si l'URL commence par /api, renvoyer une erreur JSON
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({
            message: 'Route API non trouvée',
            path: req.originalUrl,
            method: req.method
        });
    }

    // Pour les autres routes, renvoyer la page 404 HTML
    res.status(404).sendFile(path.join(__dirname, 'frontend', 'pages', '404.html'));
});

// Gestion des erreurs globales
app.use((err, req, res, next) => {
    console.error('❌ Erreur globale:', err);
    
    if (req.originalUrl.startsWith('/api')) {
        return res.status(500).json({
            message: 'Erreur interne du serveur',
            error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
    
    res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head><title>Erreur 500</title></head>
        <body>
            <h1>⚠️ Erreur interne du serveur</h1>
            <p>Une erreur inattendue s'est produite.</p>
            <p><a href="/">Retour à l'accueil</a></p>
        </body>
        </html>
    `);
});

// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================
app.listen(PORT, async () => {
    console.log(`\n🚀 Serveur démarré sur http://localhost:${PORT}`);
    console.log(`📁 Accueil: http://localhost:${PORT}/`);
    console.log(`📁 Frontend: http://localhost:${PORT}/pages/index.html`);
    console.log(`📊 Dashboard: http://localhost:${PORT}/admin/dashboard`);
    console.log(`🔗 API Test: http://localhost:${PORT}/api/test\n`);

    // Tester la connexion à la base de données
    await testConnection();
});

// ============================================
// GESTION DE L'ARRÊT
// ============================================
process.on('SIGTERM', () => {
    console.log('🛑 Arrêt du serveur...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('🛑 Arrêt du serveur...');
    process.exit(0);
});
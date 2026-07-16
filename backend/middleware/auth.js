const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'votre_secret_jwt';

// Middleware pour vérifier le token JWT
module.exports = (req, res, next) => {
    try {
        // Récupérer le token du header Authorization
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                message: 'Accès non autorisé. Token manquant.' 
            });
        }
        
        // Vérifier le token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ 
                message: 'Token invalide.' 
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                message: 'Token expiré. Veuillez vous reconnecter.' 
            });
        }
        
        return res.status(401).json({ 
            message: 'Erreur d\'authentification.' 
        });
    }
};
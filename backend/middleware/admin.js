// Middleware pour vérifier si l'utilisateur est administrateur
module.exports = (req, res, next) => {
    try {
        // Vérifier si l'utilisateur existe dans la requête (ajouté par auth middleware)
        if (!req.user) {
            return res.status(401).json({ 
                message: 'Non authentifié. Veuillez vous connecter.' 
            });
        }
        
        // Vérifier si l'utilisateur a le rôle admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ 
                message: 'Accès interdit. Vous devez être administrateur.' 
            });
        }
        
        // Si tout est bon, passer au prochain middleware
        next();
    } catch (error) {
        console.error('Erreur middleware admin:', error);
        return res.status(500).json({ 
            message: 'Erreur serveur', 
            error: error.message 
        });
    }
};
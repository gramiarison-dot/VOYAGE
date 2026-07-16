@echo off
echo ============================================
echo CREATION DES MIDDLEWARE
echo ============================================

cd C:\xampp\htdocs\VOYAGE\backend

echo.
echo Creation du dossier middleware...
mkdir middleware 2>nul

echo.
echo 1. Creation de middleware/auth.js...
(
echo const jwt = require('jsonwebtoken'^);
echo const JWT_SECRET = process.env.JWT_SECRET ^|^| 'votre_secret_jwt';
echo.
echo module.exports = (req, res, next^) =^> {
echo     try {
echo         const token = req.header('Authorization'^)?.replace('Bearer ', ''^);
echo         if (!token^) {
echo             return res.status(401^).json({ message: 'Acces non autorise. Token manquant.' }^);
echo         }
echo         const decoded = jwt.verify(token, JWT_SECRET^);
echo         req.user = decoded;
echo         next(^);
echo     } catch (error^) {
echo         console.error('Erreur d'authentification:', error^);
echo         return res.status(401^).json({ message: 'Token invalide ou expire.' }^);
echo     }
echo };
) > middleware\auth.js
echo ✅ middleware/auth.js cree

echo.
echo 2. Creation de middleware/admin.js...
(
echo module.exports = (req, res, next^) =^> {
echo     try {
echo         if (!req.user^) {
echo             return res.status(401^).json({ message: 'Non authentifie. Veuillez vous connecter.' }^);
echo         }
echo         if (req.user.role !== 'admin'^) {
echo             return res.status(403^).json({ message: 'Acces interdit. Vous devez etre administrateur.' }^);
echo         }
echo         next(^);
echo     } catch (error^) {
echo         console.error('Erreur middleware admin:', error^);
echo         return res.status(500^).json({ message: 'Erreur serveur', error: error.message }^);
echo     }
echo };
) > middleware\admin.js
echo ✅ middleware/admin.js cree

echo.
echo ============================================
echo Verification des fichiers :
dir middleware

echo.
echo ============================================
echo Lancez maintenant : npm run dev
pause
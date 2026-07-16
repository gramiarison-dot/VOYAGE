@echo off
echo ============================================
echo CORRECTION DES NOMS DE FICHIERS ROUTES
echo ============================================

cd C:\xampp\htdocs\VOYAGE\backend\routes

echo.
echo Fichiers actuels :
dir *.js

echo.
echo Suppression des anciens fichiers...
del authroutes.js 2>nul
del reservationsroutes.js 2>nul
del adminroutes.js 2>nul

echo.
echo Creation des nouveaux fichiers avec les bons noms...

echo Creation de authRoutes.js...
(
echo const express = require('express'^);
echo const router = express.Router(^);
echo const authController = require('../controllers/authController'^);
echo.
echo router.post('/register', authController.register^);
echo router.post('/login', authController.login^);
echo.
echo module.exports = router;
) > authRoutes.js

echo Creation de reservationRoutes.js...
(
echo const express = require('express'^);
echo const router = express.Router(^);
echo const reservationController = require('../controllers/reservationController'^);
echo const auth = require('../middleware/auth'^);
echo.
echo router.get('/voyages', reservationController.getVoyages^);
echo router.get('/voyages/:id', reservationController.getVoyageById^);
echo router.post('/reservations', auth, reservationController.createReservation^);
echo router.get('/reservations', auth, reservationController.getUserReservations^);
echo router.put('/reservations/:id/confirm', auth, reservationController.confirmReservation^);
echo router.delete('/reservations/:id', auth, reservationController.cancelReservation^);
echo.
echo module.exports = router;
) > reservationRoutes.js

echo Creation de adminRoutes.js...
(
echo const express = require('express'^);
echo const router = express.Router(^);
echo const adminController = require('../controllers/adminController'^);
echo const auth = require('../middleware/auth'^);
echo const admin = require('../middleware/admin'^);
echo.
echo router.get('/dashboard', auth, admin, adminController.getDashboardStats^);
echo router.get('/voyages', auth, admin, adminController.getVoyages^);
echo router.post('/voyages', auth, admin, adminController.createVoyage^);
echo router.put('/voyages/:id', auth, admin, adminController.updateVoyage^);
echo router.delete('/voyages/:id', auth, admin, adminController.deleteVoyage^);
echo router.get('/users', auth, admin, adminController.getUsers^);
echo.
echo module.exports = router;
) > adminRoutes.js

echo.
echo ============================================
echo Fichiers apres correction :
dir *.js

echo.
echo ============================================
echo Lancez maintenant : npm run dev
pause
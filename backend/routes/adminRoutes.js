const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

router.get('/dashboard', auth, admin, adminController.getDashboardStats);
router.get('/voyages', auth, admin, adminController.getVoyages);
router.post('/voyages', auth, admin, adminController.createVoyage);
router.put('/voyages/:id', auth, admin, adminController.updateVoyage);
router.delete('/voyages/:id', auth, admin, adminController.deleteVoyage);
router.get('/users', auth, admin, adminController.getUsers);

module.exports = router;
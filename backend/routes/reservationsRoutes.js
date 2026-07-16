const express = require('express');
const router = express.Router();
const reservationController = require('../controllers/reservationController');
const auth = require('../middleware/auth');

router.get('/voyages', reservationController.getVoyages);
router.get('/voyages/:id', reservationController.getVoyageById);
router.post('/reservations', auth, reservationController.createReservation);
router.get('/reservations', auth, reservationController.getUserReservations);
router.put('/reservations/:id/confirm', auth, reservationController.confirmReservation);
router.delete('/reservations/:id', auth, reservationController.cancelReservation);

module.exports = router;
const express = require('express');
const router = express.Router();

// Données de démonstration
const demoVoyages = [
    { id: 1, destination: 'Paris', depart: 'Dakar', date_depart: '2026-08-15', prix: 250000, places_disponibles: 50, description: 'Voyage à Paris' },
    { id: 2, destination: 'New York', depart: 'Dakar', date_depart: '2026-08-20', prix: 500000, places_disponibles: 40, description: 'Voyage à New York' },
    { id: 3, destination: 'Dubai', depart: 'Dakar', date_depart: '2026-09-01', prix: 300000, places_disponibles: 30, description: 'Voyage à Dubai' },
    { id: 4, destination: 'Antsiranana', depart: 'Antananarivo', date_depart: '2026-07-25', prix: 250000, places_disponibles: 32, description: 'Voyage vers le Nord' }
];

const demoReservations = [];

router.get('/voyages', (req, res) => {
    res.json(demoVoyages);
});

router.post('/reservations', (req, res) => {
    const { voyage_id, nombre_places } = req.body;
    const reservation = {
        id: demoReservations.length + 1,
        voyage_id,
        nombre_places,
        montant_total: nombre_places * 250000,
        statut: 'confirmee',
        date_reservation: new Date().toISOString()
    };
    demoReservations.push(reservation);
    res.status(201).json({ message: 'Réservation créée (démo)', reservationId: reservation.id });
});

router.get('/reservations', (req, res) => {
    res.json(demoReservations);
});

module.exports = router;
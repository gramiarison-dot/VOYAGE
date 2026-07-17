const { pool } = require('../config/db');

// ============================================
// DONNÉES DE DÉMONSTRATION
// ============================================
const DEMO_VOYAGES = [
    { 
        id: 1, 
        destination: 'Antsiranana (DIANA)', 
        depart: 'Antananarivo', 
        date_depart: '2026-08-15', 
        date_arrivee: '2026-08-16',
        prix: 250000, 
        places_disponibles: 32,
        places_total: 32,
        description: 'Voyage vers le Nord de Madagascar, Découvrez les plages paradisiaques'
    },
    { 
        id: 2, 
        destination: 'Sambava (SAVA)', 
        depart: 'Antananarivo', 
        date_depart: '2026-08-20', 
        date_arrivee: '2026-08-21',
        prix: 180000, 
        places_disponibles: 28,
        places_total: 28,
        description: 'La région de la vanille et des forêts luxuriantes'
    },
    { 
        id: 3, 
        destination: 'Toamasina (ALAOTRA)', 
        depart: 'Antananarivo', 
        date_depart: '2026-08-25', 
        date_arrivee: '2026-08-26',
        prix: 120000, 
        places_disponibles: 40,
        places_total: 40,
        description: 'Port de l\'Est, lac Alaotra et ses paysages uniques'
    },
    { 
        id: 4, 
        destination: 'Fianarantsoa (ATSIMO)', 
        depart: 'Antananarivo', 
        date_depart: '2026-09-01', 
        date_arrivee: '2026-09-02',
        prix: 150000, 
        places_disponibles: 35,
        places_total: 35,
        description: 'La région du thé et des montagnes verdoyantes'
    },
    { 
        id: 5, 
        destination: 'Toliara (ANDROY)', 
        depart: 'Antananarivo', 
        date_depart: '2026-09-05', 
        date_arrivee: '2026-09-06',
        prix: 200000, 
        places_disponibles: 30,
        places_total: 30,
        description: 'Le Sud sauvage, plages de rêve et désert'
    },
    { 
        id: 6, 
        destination: 'Antsiranana → Toliara', 
        depart: 'Antsiranana', 
        date_depart: '2026-09-10', 
        date_arrivee: '2026-09-12',
        prix: 350000, 
        places_disponibles: 20,
        places_total: 20,
        description: 'Traversée complète du Nord au Sud de Madagascar'
    }
];

let DEMO_RESERVATIONS = [];
let reservationIdCounter = 1;

// ============================================
// VÉRIFICATION DE LA CONNEXION DB
// ============================================
function isDbConnected() {
    return pool !== null;
}

// ============================================
// RÉCUPÉRER TOUS LES VOYAGES
// ============================================
exports.getVoyages = async (req, res) => {
    try {
        // Vérifier si la base de données est connectée
        if (!isDbConnected()) {
            console.log('ℹ️ Mode démo: getVoyages - Données fictives');
            return res.json(DEMO_VOYAGES.filter(v => v.places_disponibles > 0));
        }

        const [voyages] = await pool.query(
            'SELECT * FROM voyages WHERE places_disponibles > 0 ORDER BY date_depart ASC'
        );
        res.json(voyages);
    } catch (error) {
        console.error('❌ Erreur getVoyages:', error.message);
        // Fallback en mode démo
        console.log('ℹ️ Fallback mode démo pour getVoyages');
        res.json(DEMO_VOYAGES.filter(v => v.places_disponibles > 0));
    }
};

// ============================================
// RÉCUPÉRER UN VOYAGE PAR ID
// ============================================
exports.getVoyageById = async (req, res) => {
    try {
        const { id } = req.params;
        const voyageId = parseInt(id);

        if (!isDbConnected()) {
            console.log('ℹ️ Mode démo: getVoyageById - ID:', voyageId);
            const voyage = DEMO_VOYAGES.find(v => v.id === voyageId);
            if (!voyage) {
                return res.status(404).json({ message: 'Voyage non trouvé' });
            }
            return res.json(voyage);
        }

        const [voyages] = await pool.query(
            'SELECT * FROM voyages WHERE id = ?',
            [voyageId]
        );
        
        if (voyages.length === 0) {
            return res.status(404).json({ message: 'Voyage non trouvé' });
        }
        
        res.json(voyages[0]);
    } catch (error) {
        console.error('❌ Erreur getVoyageById:', error.message);
        
        // Fallback en mode démo
        const voyage = DEMO_VOYAGES.find(v => v.id === parseInt(req.params.id));
        if (!voyage) {
            return res.status(404).json({ message: 'Voyage non trouvé' });
        }
        res.json(voyage);
    }
};

// ============================================
// CRÉER UNE RÉSERVATION
// ============================================
exports.createReservation = async (req, res) => {
    try {
        const { voyage_id, nombre_places } = req.body;
        const user_id = req.user ? req.user.id : 1;
        const voyageId = parseInt(voyage_id);
        const places = parseInt(nombre_places);

        // Mode démo
        if (!isDbConnected()) {
            console.log('ℹ️ Mode démo: createReservation');
            
            // Vérifier le voyage
            const voyage = DEMO_VOYAGES.find(v => v.id === voyageId);
            if (!voyage) {
                return res.status(404).json({ message: 'Voyage non trouvé' });
            }
            
            if (voyage.places_disponibles < places) {
                return res.status(400).json({ 
                    message: `Places insuffisantes. Disponibles: ${voyage.places_disponibles}` 
                });
            }
            
            // Créer la réservation
            const montant_total = voyage.prix * places;
            const reservation = {
                id: reservationIdCounter++,
                user_id: user_id,
                voyage_id: voyageId,
                nombre_places: places,
                montant_total: montant_total,
                statut: 'en_attente',
                date_reservation: new Date().toISOString()
            };
            
            DEMO_RESERVATIONS.push(reservation);
            
            // Mettre à jour les places disponibles
            voyage.places_disponibles -= places;
            
            return res.status(201).json({
                message: 'Réservation créée avec succès (mode démo)',
                reservationId: reservation.id,
                montant_total: montant_total
            });
        }

        // Mode réel avec base de données
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const [voyages] = await connection.query(
                'SELECT * FROM voyages WHERE id = ? FOR UPDATE',
                [voyageId]
            );
            
            if (voyages.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Voyage non trouvé' });
            }
            
            const voyage = voyages[0];
            
            if (voyage.places_disponibles < places) {
                await connection.rollback();
                return res.status(400).json({ 
                    message: `Places insuffisantes. Disponibles: ${voyage.places_disponibles}` 
                });
            }
            
            const montant_total = voyage.prix * places;
            
            const [result] = await connection.query(
                `INSERT INTO reservations 
                 (user_id, voyage_id, nombre_places, montant_total, statut) 
                 VALUES (?, ?, ?, ?, ?)`,
                [user_id, voyageId, places, montant_total, 'en_attente']
            );
            
            await connection.query(
                'UPDATE voyages SET places_disponibles = places_disponibles - ? WHERE id = ?',
                [places, voyageId]
            );
            
            await connection.commit();
            
            res.status(201).json({
                message: 'Réservation créée avec succès',
                reservationId: result.insertId,
                montant_total: montant_total
            });
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('❌ Erreur createReservation:', error.message);
        res.status(500).json({ 
            message: 'Erreur serveur', 
            error: error.message 
        });
    }
};

// ============================================
// RÉCUPÉRER LES RÉSERVATIONS D'UN UTILISATEUR
// ============================================
exports.getUserReservations = async (req, res) => {
    try {
        const user_id = req.user ? req.user.id : 1;

        // Mode démo
        if (!isDbConnected()) {
            console.log('ℹ️ Mode démo: getUserReservations');
            const userReservations = DEMO_RESERVATIONS.filter(r => r.user_id === user_id);
            // Ajouter les détails du voyage
            const result = userReservations.map(r => {
                const voyage = DEMO_VOYAGES.find(v => v.id === r.voyage_id);
                return {
                    ...r,
                    destination: voyage ? voyage.destination : 'N/A',
                    depart: voyage ? voyage.depart : 'N/A',
                    date_depart: voyage ? voyage.date_depart : 'N/A',
                    date_arrivee: voyage ? voyage.date_arrivee : 'N/A',
                    prix: voyage ? voyage.prix : 0
                };
            });
            return res.json(result);
        }

        const [reservations] = await pool.query(
            `SELECT r.*, v.destination, v.depart, v.date_depart, v.date_arrivee, v.prix
             FROM reservations r
             JOIN voyages v ON r.voyage_id = v.id
             WHERE r.user_id = ?
             ORDER BY r.date_reservation DESC`,
            [user_id]
        );
        res.json(reservations);
    } catch (error) {
        console.error('❌ Erreur getUserReservations:', error.message);
        // Fallback en mode démo
        const userReservations = DEMO_RESERVATIONS.filter(r => r.user_id === (req.user ? req.user.id : 1));
        res.json(userReservations);
    }
};

// ============================================
// CONFIRMER UNE RÉSERVATION
// ============================================
exports.confirmReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const reservationId = parseInt(id);
        const user_id = req.user ? req.user.id : 1;

        // Mode démo
        if (!isDbConnected()) {
            console.log('ℹ️ Mode démo: confirmReservation - ID:', reservationId);
            const reservation = DEMO_RESERVATIONS.find(r => r.id === reservationId && r.user_id === user_id);
            
            if (!reservation) {
                return res.status(404).json({ message: 'Réservation non trouvée' });
            }
            
            if (reservation.statut === 'annulee') {
                return res.status(400).json({ message: 'Cette réservation est déjà annulée' });
            }
            
            reservation.statut = 'confirmee';
            return res.json({ message: 'Réservation confirmée avec succès (mode démo)' });
        }

        const [result] = await pool.query(
            'UPDATE reservations SET statut = "confirmee" WHERE id = ? AND user_id = ?',
            [reservationId, user_id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Réservation non trouvée' });
        }
        
        res.json({ message: 'Réservation confirmée avec succès' });
    } catch (error) {
        console.error('❌ Erreur confirmReservation:', error.message);
        res.status(500).json({ 
            message: 'Erreur serveur', 
            error: error.message 
        });
    }
};

// ============================================
// ANNULER UNE RÉSERVATION
// ============================================
exports.cancelReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const reservationId = parseInt(id);
        const user_id = req.user ? req.user.id : 1;

        // Mode démo
        if (!isDbConnected()) {
            console.log('ℹ️ Mode démo: cancelReservation - ID:', reservationId);
            const reservation = DEMO_RESERVATIONS.find(r => r.id === reservationId && r.user_id === user_id);
            
            if (!reservation) {
                return res.status(404).json({ message: 'Réservation non trouvée' });
            }
            
            if (reservation.statut === 'annulee') {
                return res.status(400).json({ message: 'Cette réservation est déjà annulée' });
            }
            
            // Restaurer les places
            const voyage = DEMO_VOYAGES.find(v => v.id === reservation.voyage_id);
            if (voyage) {
                voyage.places_disponibles += reservation.nombre_places;
            }
            
            reservation.statut = 'annulee';
            return res.json({ message: 'Réservation annulée avec succès (mode démo)' });
        }

        // Mode réel
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();
            
            const [reservations] = await connection.query(
                'SELECT * FROM reservations WHERE id = ? AND user_id = ? FOR UPDATE',
                [reservationId, user_id]
            );
            
            if (reservations.length === 0) {
                await connection.rollback();
                return res.status(404).json({ message: 'Réservation non trouvée' });
            }
            
            const reservation = reservations[0];
            
            if (reservation.statut === 'annulee') {
                await connection.rollback();
                return res.status(400).json({ message: 'Cette réservation est déjà annulée' });
            }
            
            await connection.query(
                'UPDATE reservations SET statut = "annulee" WHERE id = ?',
                [reservationId]
            );
            
            await connection.query(
                'UPDATE voyages SET places_disponibles = places_disponibles + ? WHERE id = ?',
                [reservation.nombre_places, reservation.voyage_id]
            );
            
            await connection.commit();
            
            res.json({ message: 'Réservation annulée avec succès' });
            
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('❌ Erreur cancelReservation:', error.message);
        res.status(500).json({ 
            message: 'Erreur serveur', 
            error: error.message 
        });
    }
};

// ============================================
// EXPORTER LES DONNÉES DE DÉMO POUR TEST
// ============================================
exports.getDemoData = () => ({
    voyages: DEMO_VOYAGES,
    reservations: DEMO_RESERVATIONS
});
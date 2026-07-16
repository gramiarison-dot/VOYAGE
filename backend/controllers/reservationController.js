const { pool } = require('../config/db');

exports.getVoyages = async (req, res) => {
    try {
        const [voyages] = await pool.query(
            'SELECT * FROM voyages WHERE places_disponibles > 0 ORDER BY date_depart ASC'
        );
        res.json(voyages);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            message: 'Erreur serveur', 
            error: error.message 
        });
    }
};

exports.getVoyageById = async (req, res) => {
    try {
        const { id } = req.params;
        const [voyages] = await pool.query(
            'SELECT * FROM voyages WHERE id = ?',
            [id]
        );
        
        if (voyages.length === 0) {
            return res.status(404).json({ message: 'Voyage non trouvé' });
        }
        
        res.json(voyages[0]);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            message: 'Erreur serveur', 
            error: error.message 
        });
    }
};

exports.createReservation = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { voyage_id, nombre_places } = req.body;
        const user_id = req.user.id;
        
        await connection.beginTransaction();
        
        const [voyages] = await connection.query(
            'SELECT * FROM voyages WHERE id = ? FOR UPDATE',
            [voyage_id]
        );
        
        if (voyages.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Voyage non trouvé' });
        }
        
        const voyage = voyages[0];
        
        if (voyage.places_disponibles < nombre_places) {
            await connection.rollback();
            return res.status(400).json({ 
                message: `Places insuffisantes. Places disponibles: ${voyage.places_disponibles}` 
            });
        }
        
        const montant_total = voyage.prix * nombre_places;
        
        const [result] = await connection.query(
            `INSERT INTO reservations 
             (user_id, voyage_id, nombre_places, montant_total, statut) 
             VALUES (?, ?, ?, ?, ?)`,
            [user_id, voyage_id, nombre_places, montant_total, 'en_attente']
        );
        
        await connection.query(
            'UPDATE voyages SET places_disponibles = places_disponibles - ? WHERE id = ?',
            [nombre_places, voyage_id]
        );
        
        await connection.commit();
        
        res.status(201).json({
            message: 'Réservation créée avec succès',
            reservationId: result.insertId,
            montant_total: montant_total
        });
        
    } catch (error) {
        await connection.rollback();
        console.error('Erreur:', error);
        res.status(500).json({ 
            message: 'Erreur serveur', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
};

exports.getUserReservations = async (req, res) => {
    try {
        const user_id = req.user.id;
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
        console.error('Erreur:', error);
        res.status(500).json({ 
            message: 'Erreur serveur', 
            error: error.message 
        });
    }
};

exports.confirmReservation = async (req, res) => {
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        
        const [result] = await pool.query(
            'UPDATE reservations SET statut = "confirmee" WHERE id = ? AND user_id = ?',
            [id, user_id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Réservation non trouvée' });
        }
        
        res.json({ message: 'Réservation confirmée avec succès' });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            message: 'Erreur serveur', 
            error: error.message 
        });
    }
};

exports.cancelReservation = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        const { id } = req.params;
        const user_id = req.user.id;
        
        await connection.beginTransaction();
        
        const [reservations] = await connection.query(
            'SELECT * FROM reservations WHERE id = ? AND user_id = ? FOR UPDATE',
            [id, user_id]
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
            [id]
        );
        
        await connection.query(
            'UPDATE voyages SET places_disponibles = places_disponibles + ? WHERE id = ?',
            [reservation.nombre_places, reservation.voyage_id]
        );
        
        await connection.commit();
        
        res.json({ message: 'Réservation annulée avec succès' });
        
    } catch (error) {
        await connection.rollback();
        console.error('Erreur:', error);
        res.status(500).json({ 
            message: 'Erreur serveur', 
            error: error.message 
        });
    } finally {
        connection.release();
    }
};
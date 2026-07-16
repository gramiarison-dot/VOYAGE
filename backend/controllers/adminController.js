const { pool } = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        const [totalUsers] = await pool.query('SELECT COUNT(*) as total FROM users WHERE role = "client"');
        const [totalReservations] = await pool.query('SELECT COUNT(*) as total FROM reservations');
        const [totalVoyages] = await pool.query('SELECT COUNT(*) as total FROM voyages WHERE places_disponibles > 0');
        const [totalRevenue] = await pool.query('SELECT SUM(montant_total) as total FROM reservations WHERE statut = "confirmee"');
        
        res.json({
            totalUsers: totalUsers[0].total || 0,
            totalReservations: totalReservations[0].total || 0,
            totalVoyages: totalVoyages[0].total || 0,
            totalRevenue: totalRevenue[0].total || 0
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            message: 'Erreur serveur', 
            error: error.message 
        });
    }
};

exports.getVoyages = async (req, res) => {
    try {
        const [voyages] = await pool.query(
            'SELECT * FROM voyages ORDER BY date_depart DESC'
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

exports.createVoyage = async (req, res) => {
    try {
        const { 
            destination, depart, date_depart, date_arrivee, 
            prix, places_total, description 
        } = req.body;
        
        const [result] = await pool.query(
            `INSERT INTO voyages 
             (destination, depart, date_depart, date_arrivee, 
              prix, places_total, places_disponibles, description)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [destination, depart, date_depart, date_arrivee, 
             prix, places_total, places_total, description || '']
        );
        
        res.status(201).json({
            message: 'Voyage créé avec succès',
            voyageId: result.insertId
        });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            message: 'Erreur serveur', 
            error: error.message 
        });
    }
};

exports.updateVoyage = async (req, res) => {
    try {
        const { id } = req.params;
        const { 
            destination, depart, date_depart, date_arrivee, 
            prix, places_total, description 
        } = req.body;
        
        const [result] = await pool.query(
            `UPDATE voyages 
             SET destination = ?, depart = ?, date_depart = ?, 
                 date_arrivee = ?, prix = ?, places_total = ?, 
                 description = ?
             WHERE id = ?`,
            [destination, depart, date_depart, date_arrivee, 
             prix, places_total, description || '', id]
        );
        
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Voyage non trouvé' });
        }
        
        res.json({ message: 'Voyage mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            message: 'Erreur serveur', 
            error: error.message 
        });
    }
};

exports.deleteVoyage = async (req, res) => {
    try {
        const { id } = req.params;
        
        const [voyages] = await pool.query('SELECT * FROM voyages WHERE id = ?', [id]);
        if (voyages.length === 0) {
            return res.status(404).json({ message: 'Voyage non trouvé' });
        }
        
        await pool.query('DELETE FROM voyages WHERE id = ?', [id]);
        
        res.json({ message: 'Voyage supprimé avec succès' });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            message: 'Erreur serveur', 
            error: error.message 
        });
    }
};

exports.getUsers = async (req, res) => {
    try {
        const [users] = await pool.query(
            'SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'
        );
        res.json(users);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ 
            message: 'Erreur serveur', 
            error: error.message 
        });
    }
};
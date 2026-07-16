@echo off
echo ============================================================
echo CORRECTION COMPLETE DES ERREURS
echo ============================================================
echo.

cd C:\xampp\htdocs\VOYAGE

echo 1. Verification de la structure des dossiers...
if not exist backend\controllers (
    echo ❌ Dossier controllers manquant - Creation...
    mkdir backend\controllers
) else (
    echo ✅ Dossier controllers existe
)

echo.
echo 2. Creation de authController.js...
(
echo const bcrypt = require('bcrypt'^);
echo const jwt = require('jsonwebtoken'^);
echo const { pool } = require('../config/db'^);
echo.
echo const JWT_SECRET = process.env.JWT_SECRET ^|^| 'votre_secret_jwt';
echo.
echo exports.register = async (req, res^) =^> {
echo     try {
echo         const { username, email, password } = req.body;
echo         if (!username ^|^| !email ^|^| !password^) {
echo             return res.status(400^).json({ message: 'Tous les champs sont requis' }^);
echo         }
echo         const [existingUser] = await pool.query(
echo             'SELECT * FROM users WHERE email = ? OR username = ?',
echo             [email, username]
echo         ^);
echo         if (existingUser.length ^> 0^) {
echo             return res.status(400^).json({ message: 'Email ou nom d'utilisateur deja utilise' }^);
echo         }
echo         const hashedPassword = await bcrypt.hash(password, 10^);
echo         const [result] = await pool.query(
echo             'INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)',
echo             [username, email, hashedPassword, 'client']
echo         ^);
echo         res.status(201^).json({ message: 'Compte cree avec succes', userId: result.insertId }^);
echo     } catch (error^) {
echo         console.error('Erreur d'inscription:', error^);
echo         res.status(500^).json({ message: 'Erreur serveur', error: error.message }^);
echo     }
echo };
echo.
echo exports.login = async (req, res^) =^> {
echo     try {
echo         const { email, password } = req.body;
echo         if (!email ^|^| !password^) {
echo             return res.status(400^).json({ message: 'Email et mot de passe requis' }^);
echo         }
echo         const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]^);
echo         if (users.length === 0^) {
echo             return res.status(401^).json({ message: 'Email ou mot de passe incorrect' }^);
echo         }
echo         const user = users[0];
echo         const validPassword = await bcrypt.compare(password, user.password^);
echo         if (!validPassword^) {
echo             return res.status(401^).json({ message: 'Email ou mot de passe incorrect' }^);
echo         }
echo         const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '24h' }^);
echo         res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } }^);
echo     } catch (error^) {
echo         console.error('Erreur de connexion:', error^);
echo         res.status(500^).json({ message: 'Erreur serveur', error: error.message }^);
echo     }
echo };
) > backend\controllers\authController.js
echo ✅ authController.js cree

echo.
echo 3. Creation de reservationController.js...
(
echo const { pool } = require('../config/db'^);
echo.
echo exports.getVoyages = async (req, res^) =^> {
echo     try {
echo         const [voyages] = await pool.query('SELECT * FROM voyages WHERE places_disponibles ^> 0 ORDER BY date_depart ASC'^);
echo         res.json(voyages^);
echo     } catch (error^) {
echo         res.status(500^).json({ message: 'Erreur serveur', error: error.message }^);
echo     }
echo };
echo.
echo exports.getVoyageById = async (req, res^) =^> {
echo     try {
echo         const { id } = req.params;
echo         const [voyages] = await pool.query('SELECT * FROM voyages WHERE id = ?', [id]^);
echo         if (voyages.length === 0^) return res.status(404^).json({ message: 'Voyage non trouve' }^);
echo         res.json(voyages[0]^);
echo     } catch (error^) {
echo         res.status(500^).json({ message: 'Erreur serveur', error: error.message }^);
echo     }
echo };
echo.
echo exports.createReservation = async (req, res^) =^> {
echo     try {
echo         const { voyage_id, nombre_places } = req.body;
echo         const user_id = req.user.id;
echo         const connection = await pool.getConnection(^);
echo         await connection.beginTransaction(^);
echo         const [voyages] = await connection.query('SELECT * FROM voyages WHERE id = ? FOR UPDATE', [voyage_id]^);
echo         if (voyages.length === 0^) { await connection.rollback(^); return res.status(404^).json({ message: 'Voyage non trouve' }^); }
echo         const voyage = voyages[0];
echo         if (voyage.places_disponibles ^< nombre_places^) { await connection.rollback(^); return res.status(400^).json({ message: 'Places insuffisantes' }^); }
echo         const montant_total = voyage.prix * nombre_places;
echo         const [result] = await connection.query('INSERT INTO reservations (user_id, voyage_id, nombre_places, montant_total, statut) VALUES (?, ?, ?, ?, ?)', [user_id, voyage_id, nombre_places, montant_total, 'en_attente']^);
echo         await connection.query('UPDATE voyages SET places_disponibles = places_disponibles - ? WHERE id = ?', [nombre_places, voyage_id]^);
echo         await connection.commit(^);
echo         res.status(201^).json({ message: 'Reservation creee avec succes', reservationId: result.insertId, montant_total }^);
echo     } catch (error^) {
echo         res.status(500^).json({ message: 'Erreur serveur', error: error.message }^);
echo     }
echo };
echo.
echo exports.getUserReservations = async (req, res^) =^> {
echo     try {
echo         const user_id = req.user.id;
echo         const [reservations] = await pool.query('SELECT r.*, v.destination, v.depart, v.date_depart FROM reservations r JOIN voyages v ON r.voyage_id = v.id WHERE r.user_id = ? ORDER BY r.date_reservation DESC', [user_id]^);
echo         res.json(reservations^);
echo     } catch (error^) {
echo         res.status(500^).json({ message: 'Erreur serveur', error: error.message }^);
echo     }
echo };
echo.
echo exports.confirmReservation = async (req, res^) =^> {
echo     try {
echo         const { id } = req.params;
echo         const user_id = req.user.id;
echo         const [result] = await pool.query('UPDATE reservations SET statut = "confirmee" WHERE id = ? AND user_id = ?', [id, user_id]^);
echo         if (result.affectedRows === 0^) return res.status(404^).json({ message: 'Reservation non trouvee' }^);
echo         res.json({ message: 'Reservation confirmee avec succes' }^);
echo     } catch (error^) {
echo         res.status(500^).json({ message: 'Erreur serveur', error: error.message }^);
echo     }
echo };
echo.
echo exports.cancelReservation = async (req, res^) =^> {
echo     try {
echo         const { id } = req.params;
echo         const user_id = req.user.id;
echo         const connection = await pool.getConnection(^);
echo         await connection.beginTransaction(^);
echo         const [reservations] = await connection.query('SELECT * FROM reservations WHERE id = ? AND user_id = ? FOR UPDATE', [id, user_id]^);
echo         if (reservations.length === 0^) { await connection.rollback(^); return res.status(404^).json({ message: 'Reservation non trouvee' }^); }
echo         const reservation = reservations[0];
echo         await connection.query('UPDATE reservations SET statut = "annulee" WHERE id = ?', [id]^);
echo         await connection.query('UPDATE voyages SET places_disponibles = places_disponibles + ? WHERE id = ?', [reservation.nombre_places, reservation.voyage_id]^);
echo         await connection.commit(^);
echo         res.json({ message: 'Reservation annulee avec succes' }^);
echo     } catch (error^) {
echo         res.status(500^).json({ message: 'Erreur serveur', error: error.message }^);
echo     }
echo };
) > backend\controllers\reservationController.js
echo ✅ reservationController.js cree

echo.
echo 4. Creation de adminController.js...
(
echo const { pool } = require('../config/db'^);
echo.
echo exports.getDashboardStats = async (req, res^) =^> {
echo     try {
echo         const [totalUsers] = await pool.query('SELECT COUNT(*) as total FROM users WHERE role = "client"'^);
echo         const [totalReservations] = await pool.query('SELECT COUNT(*) as total FROM reservations'^);
echo         const [totalVoyages] = await pool.query('SELECT COUNT(*) as total FROM voyages WHERE places_disponibles ^> 0'^);
echo         const [totalRevenue] = await pool.query('SELECT SUM(montant_total) as total FROM reservations WHERE statut = "confirmee"'^);
echo         res.json({ totalUsers: totalUsers[0].total ^|^| 0, totalReservations: totalReservations[0].total ^|^| 0, totalVoyages: totalVoyages[0].total ^|^| 0, totalRevenue: totalRevenue[0].total ^|^| 0 }^);
echo     } catch (error^) {
echo         res.status(500^).json({ message: 'Erreur serveur', error: error.message }^);
echo     }
echo };
echo.
echo exports.getVoyages = async (req, res^) =^> {
echo     try {
echo         const [voyages] = await pool.query('SELECT * FROM voyages ORDER BY date_depart DESC'^);
echo         res.json(voyages^);
echo     } catch (error^) {
echo         res.status(500^).json({ message: 'Erreur serveur', error: error.message }^);
echo     }
echo };
echo.
echo exports.createVoyage = async (req, res^) =^> {
echo     try {
echo         const { destination, depart, date_depart, date_arrivee, prix, places_total, description } = req.body;
echo         const [result] = await pool.query('INSERT INTO voyages (destination, depart, date_depart, date_arrivee, prix, places_total, places_disponibles, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [destination, depart, date_depart, date_arrivee, prix, places_total, places_total, description ^|^| '']^);
echo         res.status(201^).json({ message: 'Voyage cree avec succes', voyageId: result.insertId }^);
echo     } catch (error^) {
echo         res.status(500^).json({ message: 'Erreur serveur', error: error.message }^);
echo     }
echo };
echo.
echo exports.updateVoyage = async (req, res^) =^> {
echo     try {
echo         const { id } = req.params;
echo         const { destination, depart, date_depart, date_arrivee, prix, places_total, description } = req.body;
echo         const [result] = await pool.query('UPDATE voyages SET destination = ?, depart = ?, date_depart = ?, date_arrivee = ?, prix = ?, places_total = ?, description = ? WHERE id = ?', [destination, depart, date_depart, date_arrivee, prix, places_total, description ^|^| '', id]^);
echo         if (result.affectedRows === 0^) return res.status(404^).json({ message: 'Voyage non trouve' }^);
echo         res.json({ message: 'Voyage mis a jour avec succes' }^);
echo     } catch (error^) {
echo         res.status(500^).json({ message: 'Erreur serveur', error: error.message }^);
echo     }
echo };
echo.
echo exports.deleteVoyage = async (req, res^) =^> {
echo     try {
echo         const { id } = req.params;
echo         const [voyages] = await pool.query('SELECT * FROM voyages WHERE id = ?', [id]^);
echo         if (voyages.length === 0^) return res.status(404^).json({ message: 'Voyage non trouve' }^);
echo         await pool.query('DELETE FROM voyages WHERE id = ?', [id]^);
echo         res.json({ message: 'Voyage supprime avec succes' }^);
echo     } catch (error^) {
echo         res.status(500^).json({ message: 'Erreur serveur', error: error.message }^);
echo     }
echo };
echo.
echo exports.getUsers = async (req, res^) =^> {
echo     try {
echo         const [users] = await pool.query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC'^);
echo         res.json(users^);
echo     } catch (error^) {
echo         res.status(500^).json({ message: 'Erreur serveur', error: error.message }^);
echo     }
echo };
) > backend\controllers\adminController.js
echo ✅ adminController.js cree

echo.
echo 5. Verification finale...
if exist backend\controllers\authController.js (
    echo ✅ authController.js est present
) else (
    echo ❌ authController.js est absent
)

echo.
echo 6. Nettoyage du cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache
    echo ✅ Cache nettoie
)

echo.
echo ============================================================
echo CORRECTION TERMINEE !
echo.
echo Structure du dossier controllers :
dir backend\controllers
echo.
echo Lancez maintenant : npm run dev
echo ============================================================
pause
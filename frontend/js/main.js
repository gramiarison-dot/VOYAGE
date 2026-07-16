// ============================================
// CONFIGURATION
// ============================================
const API_URL = 'http://localhost:5000/api';

// ============================================
// INITIALISATION AU CHARGEMENT
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM chargé - main.js actif');
    
    // Vérifier l'authentification
    checkAuth();
    
    // Gestion du formulaire de connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        console.log('✅ Formulaire de connexion trouvé');
        loginForm.addEventListener('submit', handleLogin);
    } else {
        console.log('⚠️ Formulaire de connexion non trouvé');
    }
    
    // Gestion du formulaire d'inscription
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        console.log('✅ Formulaire d\'inscription trouvé');
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Gestion du formulaire de réservation
    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        console.log('✅ Formulaire de réservation trouvé');
        reservationForm.addEventListener('submit', handleReservation);
    }
    
    // Charger les voyages
    loadVoyages();
    
    // Gestion de la déconnexion
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    
    // Gestion du sélecteur de voyage
    const voyageSelect = document.getElementById('voyage-select');
    if (voyageSelect) {
        voyageSelect.addEventListener('change', showVoyageDetails);
    }
    
    // Mettre à jour le montant total
    const nombrePlaces = document.getElementById('nombre-places');
    if (nombrePlaces) {
        nombrePlaces.addEventListener('change', updateMontantTotal);
        nombrePlaces.addEventListener('input', updateMontantTotal);
    }
});

// ============================================
// AUTHENTIFICATION
// ============================================
function checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        try {
            const userData = JSON.parse(user);
            console.log('✅ Utilisateur connecté:', userData.username);
            updateUIForAuthenticatedUser(userData);
        } catch (e) {
            console.error('Erreur de parsing user:', e);
        }
    } else {
        console.log('ℹ️ Utilisateur non connecté');
    }
}

// ============================================
// FONCTION DE CONNEXION
// ============================================
async function handleLogin(e) {
    e.preventDefault();
    console.log('🔄 Tentative de connexion...');
    
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const alertDiv = document.getElementById('loginAlert');
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    
    // Vérifier que les champs sont remplis
    if (!email.value || !password.value) {
        showAlert(alertDiv, 'danger', 'Veuillez remplir tous les champs');
        return;
    }
    
    // Désactiver le bouton
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Connexion en cours...';
    }
    
    try {
        console.log('📡 Envoi de la requête à:', `${API_URL}/auth/login`);
        
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email.value.trim(),
                password: password.value
            })
        });
        
        console.log('📥 Réponse reçue - Status:', response.status);
        
        const data = await response.json();
        console.log('📦 Données:', data);
        
        if (response.ok) {
            // Stocker les données
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showAlert(alertDiv, 'success', '✅ Connexion réussie ! Redirection...');
            
            // Rediriger après 1.5 secondes
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } else {
            showAlert(alertDiv, 'danger', data.message || '❌ Email ou mot de passe incorrect');
            
            // Réactiver le bouton
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Se connecter';
            }
        }
    } catch (error) {
        console.error('❌ Erreur:', error);
        showAlert(alertDiv, 'danger', '❌ Erreur de connexion au serveur. Vérifiez que le serveur est lancé.');
        
        // Réactiver le bouton
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Se connecter';
        }
    }
}

// ============================================
// FONCTION D'INSCRIPTION
// ============================================
async function handleRegister(e) {
    e.preventDefault();
    console.log('🔄 Tentative d\'inscription...');
    
    const username = document.getElementById('username');
    const email = document.getElementById('registerEmail');
    const password = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const alertDiv = document.getElementById('registerAlert');
    const submitBtn = document.querySelector('#registerForm button[type="submit"]');
    
    // Vérifier les champs
    if (!username.value || !email.value || !password.value || !confirmPassword.value) {
        showAlert(alertDiv, 'danger', 'Veuillez remplir tous les champs');
        return;
    }
    
    // Vérifier les mots de passe
    if (password.value !== confirmPassword.value) {
        showAlert(alertDiv, 'danger', 'Les mots de passe ne correspondent pas');
        return;
    }
    
    // Vérifier la longueur du mot de passe
    if (password.value.length < 6) {
        showAlert(alertDiv, 'danger', 'Le mot de passe doit contenir au moins 6 caractères');
        return;
    }
    
    // Désactiver le bouton
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Création en cours...';
    }
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username.value.trim(),
                email: email.value.trim(),
                password: password.value
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showAlert(alertDiv, 'success', '✅ Compte créé avec succès ! Redirection vers la connexion...');
            
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
        } else {
            showAlert(alertDiv, 'danger', data.message || '❌ Erreur lors de l\'inscription');
            
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Créer mon compte';
            }
        }
    } catch (error) {
        console.error('Erreur:', error);
        showAlert(alertDiv, 'danger', '❌ Erreur de connexion au serveur');
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Créer mon compte';
        }
    }
}

// ============================================
// FONCTION DE DÉCONNEXION
// ============================================
function handleLogout(e) {
    e.preventDefault();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}

// ============================================
// CHARGEMENT DES VOYAGES
// ============================================
async function loadVoyages() {
    try {
        const response = await fetch(`${API_URL}/reservations/voyages`);
        const voyages = await response.json();
        
        // Remplir le sélecteur
        const select = document.getElementById('voyage-select');
        if (select && voyages.length > 0) {
            select.innerHTML = '<option value="">Sélectionnez un voyage</option>';
            voyages.forEach(v => {
                const option = document.createElement('option');
                option.value = v.id;
                option.textContent = `${v.destination} - ${v.depart} (${v.date_depart})`;
                select.appendChild(option);
            });
        }
        
        // Afficher les voyages sur la page d'accueil
        const voyagesList = document.getElementById('voyages-list');
        if (voyagesList) {
            voyagesList.innerHTML = '';
            voyages.slice(0, 3).forEach(v => {
                const col = document.createElement('div');
                col.className = 'col-md-4 mb-3';
                col.innerHTML = `
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">${v.destination}</h5>
                            <p class="card-text">
                                <i class="bi bi-geo-alt"></i> Départ: ${v.depart}<br>
                                <i class="bi bi-calendar"></i> ${v.date_depart}<br>
                                <i class="bi bi-tag"></i> ${v.prix} FCFA
                            </p>
                            <a href="reservation.html" class="btn btn-primary">Réserver</a>
                        </div>
                    </div>
                `;
                voyagesList.appendChild(col);
            });
        }
    } catch (error) {
        console.error('Erreur de chargement des voyages:', error);
    }
}

// ============================================
// RÉSERVATION
// ============================================
async function handleReservation(e) {
    e.preventDefault();
    console.log('🔄 Tentative de réservation...');
    
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Veuillez vous connecter pour réserver');
        window.location.href = 'login.html';
        return;
    }
    
    const voyageId = document.getElementById('voyage-select').value;
    const nombrePlaces = document.getElementById('nombre-places').value;
    const messageDiv = document.getElementById('reservation-message');
    
    if (!voyageId) {
        messageDiv.innerHTML = '<div class="alert alert-warning">Veuillez sélectionner un voyage</div>';
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/reservations/reservations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                voyage_id: parseInt(voyageId),
                nombre_places: parseInt(nombrePlaces)
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            messageDiv.innerHTML = `
                <div class="alert alert-success">
                    <i class="bi bi-check-circle"></i> ${data.message}
                    <br>Montant total: ${data.montant_total} FCFA
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="alert alert-danger">
                    <i class="bi bi-exclamation-triangle"></i> ${data.message || 'Erreur lors de la réservation'}
                </div>
            `;
        }
    } catch (error) {
        console.error('Erreur:', error);
        messageDiv.innerHTML = `
            <div class="alert alert-danger">
                <i class="bi bi-exclamation-triangle"></i> Erreur de connexion au serveur
            </div>
        `;
    }
}

// ============================================
// AFFICHAGE DES DÉTAILS D'UN VOYAGE
// ============================================
function showVoyageDetails() {
    const select = document.getElementById('voyage-select');
    const detailsDiv = document.getElementById('voyage-details');
    
    if (!select || !detailsDiv) return;
    
    if (select.value) {
        detailsDiv.style.display = 'block';
        const voyageId = select.value;
        
        fetch(`${API_URL}/reservations/voyages/${voyageId}`)
            .then(response => response.json())
            .then(voyage => {
                document.getElementById('dest-detail').textContent = voyage.destination;
                document.getElementById('depart-detail').textContent = voyage.depart;
                document.getElementById('date-depart-detail').textContent = voyage.date_depart;
                document.getElementById('prix-detail').textContent = voyage.prix;
                updateMontantTotal();
            })
            .catch(error => console.error('Erreur:', error));
    } else {
        detailsDiv.style.display = 'none';
    }
}

// ============================================
// MISE À JOUR DU MONTANT TOTAL
// ============================================
function updateMontantTotal() {
    const prixText = document.getElementById('prix-detail')?.textContent;
    const nombrePlaces = document.getElementById('nombre-places');
    const montantTotal = document.getElementById('montant-total');
    
    if (prixText && nombrePlaces && montantTotal) {
        const prix = parseFloat(prixText);
        const total = prix * (parseInt(nombrePlaces.value) || 1);
        montantTotal.textContent = `${total} FCFA`;
    }
}

// ============================================
// MISE À JOUR DE L'UI AUTHENTIFIÉ
// ============================================
function updateUIForAuthenticatedUser(user) {
    const authNav = document.getElementById('auth-nav');
    const registerNav = document.getElementById('register-nav');
    const userNav = document.getElementById('user-nav');
    const logoutNav = document.getElementById('logout-nav');
    const historiqueNav = document.getElementById('historique-nav');
    const adminNav = document.getElementById('admin-nav');
    const usernameDisplay = document.getElementById('usernameDisplay');
    
    if (authNav) authNav.style.display = 'none';
    if (registerNav) registerNav.style.display = 'none';
    if (userNav) userNav.style.display = 'block';
    if (logoutNav) logoutNav.style.display = 'block';
    if (historiqueNav) historiqueNav.style.display = 'block';
    if (usernameDisplay) usernameDisplay.textContent = user.username;
    
    if (user.role === 'admin' && adminNav) {
        adminNav.style.display = 'block';
    }
}

// ============================================
// AFFICHAGE DES ALERTES
// ============================================
function showAlert(alertDiv, type, message) {
    if (!alertDiv) {
        console.warn('Alert div non trouvée');
        return;
    }
    
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = message;
    alertDiv.classList.remove('d-none');
    
    // Auto-fermeture après 5 secondes
    if (window.alertTimeout) {
        clearTimeout(window.alertTimeout);
    }
    window.alertTimeout = setTimeout(() => {
        alertDiv.classList.add('d-none');
    }, 5000);
}

console.log('✅ main.js chargé avec succès');
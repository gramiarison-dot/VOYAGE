// ============================================
// CONFIGURATION
// ============================================
const API_URL = 'http://localhost:5000/api';

// ============================================
// CHARGEMENT DES DONNÉES
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Admin JS chargé');
    
    // Vérifier l'authentification
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        window.location.href = '../login.html';
        return;
    }
    
    try {
        const userData = JSON.parse(user);
        if (userData.role !== 'admin') {
            window.location.href = '../index.html';
            return;
        }
    } catch (e) {
        window.location.href = '../login.html';
        return;
    }
    
    // Charger les données
    loadDashboardStats();
    loadUsers();
    loadRecentActivities();
    initCharts();
});

// ============================================
// CHARGER LES STATISTIQUES
// ============================================
async function loadDashboardStats() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erreur de chargement');
        }
        
        const data = await response.json();
        console.log('📊 Stats:', data);
        
        document.getElementById('totalUsers').textContent = data.totalUsers || 0;
        document.getElementById('totalReservations').textContent = data.totalReservations || 0;
        document.getElementById('totalVoyages').textContent = data.totalVoyages || 0;
        document.getElementById('totalRevenue').textContent = (data.totalRevenue || 0) + ' FCFA';
        
        // Mettre à jour les badges
        const usersBadge = document.getElementById('usersBadge');
        if (usersBadge) usersBadge.textContent = data.totalUsers || 0;
        
        const reservationsBadge = document.getElementById('reservationsBadge');
        if (reservationsBadge) reservationsBadge.textContent = data.totalReservations || 0;
        
        const voyagesBadge = document.getElementById('voyagesBadge');
        if (voyagesBadge) voyagesBadge.textContent = data.totalVoyages || 0;
        
    } catch (error) {
        console.error('❌ Erreur chargement stats:', error);
    }
}

// ============================================
// CHARGER LES UTILISATEURS
// ============================================
async function loadUsers() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/users`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Erreur de chargement');
        }
        
        const users = await response.json();
        console.log('👥 Utilisateurs:', users);
        
        const tbody = document.getElementById('usersTableBody');
        if (!tbody) return;
        
        if (users.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-muted py-4">
                        <i class="fas fa-users"></i> Aucun utilisateur trouvé
                    </td>
                </tr>
            `;
            return;
        }
        
        // Couleurs pour les avatars
        const colors = ['#667eea', '#00b894', '#fdcb6e', '#e17055', '#6c5ce7', '#00cec9', '#fd79a8', '#0984e3'];
        
        let html = '';
        users.slice(0, 10).forEach((user, index) => {
            const initials = user.username.charAt(0).toUpperCase();
            const color = colors[index % colors.length];
            const roleBadge = user.role === 'admin' ? 'admin' : 'client';
            const roleLabel = user.role === 'admin' ? 'Administrateur' : 'Client';
            
            html += `
                <tr>
                    <td>
                        <div class="d-flex align-items-center">
                            <div class="user-avatar" style="background: ${color}">
                                ${initials}
                            </div>
                            <span class="ms-2 fw-bold">${user.username}</span>
                        </div>
                    </td>
                    <td>${user.email}</td>
                    <td>
                        <span class="badge-role ${roleBadge}">${roleLabel}</span>
                    </td>
                    <td>${new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                    <td>
                        <button class="btn-action edit" onclick="editUser(${user.id})" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-action delete" onclick="deleteUser(${user.id})" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        tbody.innerHTML = html;
        
    } catch (error) {
        console.error('❌ Erreur chargement utilisateurs:', error);
        document.getElementById('usersTableBody').innerHTML = `
            <tr>
                <td colspan="5" class="text-center text-danger py-4">
                    <i class="fas fa-exclamation-circle"></i> Erreur de chargement
                </td>
            </tr>
        `;
    }
}

// ============================================
// CHARGER LES ACTIVITÉS RÉCENTES
// ============================================
async function loadRecentActivities() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/admin/dashboard`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) return;
        
        const data = await response.json();
        const activities = data.recentReservations || [];
        
        const container = document.getElementById('recentActivities');
        if (!container) return;
        
        if (activities.length === 0) {
            container.innerHTML = `
                <div class="text-center text-muted py-4">
                    <i class="fas fa-inbox fa-2x mb-2"></i>
                    <p>Aucune activité récente</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        activities.forEach(activity => {
            const status = activity.statut || 'en_attente';
            const statusClass = status === 'confirmee' ? 'confirmed' : 
                               status === 'annulee' ? 'cancelled' : 'pending';
            const statusLabel = status === 'confirmee' ? 'Confirmée' : 
                               status === 'annulee' ? 'Annulée' : 'En attente';
            const avatarClass = status === 'annulee' ? 'cancel' : 'booking';
            
            html += `
                <div class="activity-item">
                    <div class="activity-avatar ${avatarClass}">
                        <i class="fas ${status === 'annulee' ? 'fa-times' : 'fa-ticket-alt'}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-text">
                            <strong>${activity.username || 'Utilisateur'}</strong> 
                            a réservé un voyage pour <strong>${activity.destination || 'Destination'}</strong>
                        </div>
                        <div class="activity-time">
                            <i class="far fa-clock"></i> ${new Date(activity.date_reservation).toLocaleString('fr-FR')}
                        </div>
                    </div>
                    <span class="activity-status ${statusClass}">${statusLabel}</span>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('❌ Erreur chargement activités:', error);
    }
}

// ============================================
// INITIALISER LES GRAPHIQUES
// ============================================
function initCharts() {
    // Graphique des réservations
    const ctx1 = document.getElementById('reservationsChart');
    if (ctx1) {
        new Chart(ctx1, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'],
                datasets: [{
                    label: 'Réservations 2026',
                    data: [12, 19, 15, 22, 28, 35, 42, 38, 45, 52, 48, 58],
                    borderColor: '#667eea',
                    backgroundColor: 'rgba(102, 126, 234, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#667eea',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 10,
                            font: { size: 11 }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Graphique des statuts
    const ctx2 = document.getElementById('statusChart');
    if (ctx2) {
        new Chart(ctx2, {
            type: 'doughnut',
            data: {
                labels: ['Confirmées', 'En attente', 'Annulées'],
                datasets: [{
                    data: [45, 30, 25],
                    backgroundColor: ['#00b894', '#fdcb6e', '#e17055'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle',
                            font: { size: 12 }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }
}

// ============================================
// ACTIONS UTILISATEURS
// ============================================
function editUser(id) {
    alert(`📝 Modifier l'utilisateur #${id}`);
    // Implémenter la modification
}

function deleteUser(id) {
    if (confirm(`⚠️ Êtes-vous sûr de vouloir supprimer l'utilisateur #${id} ?`)) {
        alert(`🗑️ Utilisateur #${id} supprimé`);
        // Implémenter la suppression
        loadUsers();
    }
}

console.log('✅ admin.js chargé avec succès');
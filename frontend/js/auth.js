// Configuration
const API_URL = 'http://localhost:5000/api';

// ==================== PAGE DE CONNEXION ====================
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est déjà connecté
    const token = localStorage.getItem('token');
    if (token) {
        // Rediriger vers l'accueil si déjà connecté
        window.location.href = 'index.html';
        return;
    }

    // Gestion du formulaire de connexion
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Gestion de l'affichage du mot de passe
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.className = 'bi bi-eye-slash';
            } else {
                passwordInput.type = 'password';
                icon.className = 'bi bi-eye';
            }
        });
    }

    // Validation en temps réel
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) {
        emailInput.addEventListener('input', function() {
            validateEmail(this);
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            validatePassword(this);
        });
    }

    // Gestion du "Mot de passe oublié"
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            handleForgotPassword();
        });
    }

    // Gestion de la touche Entrée
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && loginForm) {
            e.preventDefault();
            loginForm.dispatchEvent(new Event('submit'));
        }
    });
});

// Fonction de connexion
async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email');
    const password = document.getElementById('password');
    const alertDiv = document.getElementById('loginAlert');
    const loginBtn = document.getElementById('loginBtn');
    const loginText = document.getElementById('loginText');
    const loginSpinner = document.getElementById('loginSpinner');
    
    // Valider les champs
    if (!validateEmail(email) || !validatePassword(password)) {
        return;
    }
    
    // Désactiver le bouton
    loginBtn.disabled = true;
    loginText.textContent = 'Connexion en cours...';
    loginSpinner.classList.remove('d-none');
    
    try {
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
        
        const data = await response.json();
        
        if (response.ok) {
            // Stocker les données
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Gérer "Se souvenir de moi"
            const rememberMe = document.getElementById('rememberMe');
            if (rememberMe && rememberMe.checked) {
                localStorage.setItem('rememberMe', 'true');
            } else {
                localStorage.removeItem('rememberMe');
            }
            
            // Message de succès
            showAlert(alertDiv, 'success', `
                <i class="bi bi-check-circle"></i> 
                Connexion réussie ! Redirection en cours...
            `);
            
            // Rediriger après 1.5 secondes
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } else {
            // Erreur de connexion
            showAlert(alertDiv, 'danger', `
                <i class="bi bi-exclamation-triangle"></i> 
                ${data.message || 'Email ou mot de passe incorrect'}
            `);
            
            // Réactiver le bouton
            loginBtn.disabled = false;
            loginText.textContent = 'Se connecter';
            loginSpinner.classList.add('d-none');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showAlert(alertDiv, 'danger', `
            <i class="bi bi-exclamation-triangle"></i> 
            Erreur de connexion au serveur. Vérifiez votre connexion internet.
        `);
        
        loginBtn.disabled = false;
        loginText.textContent = 'Se connecter';
        loginSpinner.classList.add('d-none');
    }
}

// ==================== PAGE D'INSCRIPTION ====================
document.addEventListener('DOMContentLoaded', function() {
    // Vérifier si l'utilisateur est déjà connecté
    const token = localStorage.getItem('token');
    if (token && window.location.pathname.includes('register.html')) {
        window.location.href = 'index.html';
        return;
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        // Gestion des étapes
        const step1Next = document.getElementById('step1Next');
        const step2Back = document.getElementById('step2Back');
        const step2Next = document.getElementById('step2Next');
        const step3Back = document.getElementById('step3Back');
        
        if (step1Next) {
            step1Next.addEventListener('click', function() {
                if (validateStep1()) {
                    showStep(2);
                }
            });
        }
        
        if (step2Back) {
            step2Back.addEventListener('click', function() {
                showStep(1);
            });
        }
        
        if (step2Next) {
            step2Next.addEventListener('click', function() {
                if (validateStep2()) {
                    showStep(3);
                    updateConfirmation();
                }
            });
        }
        
        if (step3Back) {
            step3Back.addEventListener('click', function() {
                showStep(2);
            });
        }
        
        // Soumission du formulaire
        registerForm.addEventListener('submit', handleRegister);
        
        // Validation en temps réel
        const username = document.getElementById('username');
        const registerEmail = document.getElementById('registerEmail');
        const registerPassword = document.getElementById('registerPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        const termsCheck = document.getElementById('termsCheck');
        
        if (username) {
            username.addEventListener('input', function() {
                validateUsername(this);
            });
        }
        
        if (registerEmail) {
            registerEmail.addEventListener('input', function() {
                validateEmail(this);
            });
        }
        
        if (registerPassword) {
            registerPassword.addEventListener('input', function() {
                validatePasswordStrength(this);
                checkPasswordMatch(registerPassword, confirmPassword);
            });
        }
        
        if (confirmPassword) {
            confirmPassword.addEventListener('input', function() {
                checkPasswordMatch(registerPassword, this);
            });
        }
        
        if (termsCheck) {
            termsCheck.addEventListener('change', function() {
                validateTerms(this);
            });
        }
        
        // Gestion de l'affichage du mot de passe
        const toggleRegisterPassword = document.getElementById('toggleRegisterPassword');
        if (toggleRegisterPassword) {
            toggleRegisterPassword.addEventListener('click', function() {
                const passwordInput = document.getElementById('registerPassword');
                const icon = this.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.className = 'bi bi-eye-slash';
                } else {
                    passwordInput.type = 'password';
                    icon.className = 'bi bi-eye';
                }
            });
        }
    }
});

// Gestion des étapes
function showStep(step) {
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');
    const progressBar = document.getElementById('progressBar');
    
    // Cacher toutes les étapes
    step1.style.display = 'none';
    step2.style.display = 'none';
    step3.style.display = 'none';
    
    // Afficher l'étape sélectionnée
    if (step === 1) {
        step1.style.display = 'block';
        progressBar.style.width = '33%';
    } else if (step === 2) {
        step2.style.display = 'block';
        progressBar.style.width = '66%';
    } else if (step === 3) {
        step3.style.display = 'block';
        progressBar.style.width = '100%';
    }
    
    // Scroll en haut
    document.querySelector('.card-body').scrollIntoView({ behavior: 'smooth' });
}

// Validation Étape 1
function validateStep1() {
    const username = document.getElementById('username');
    const email = document.getElementById('registerEmail');
    let isValid = true;
    
    if (!validateUsername(username)) {
        isValid = false;
    }
    
    if (!validateEmail(email)) {
        isValid = false;
    }
    
    return isValid;
}

// Validation Étape 2
function validateStep2() {
    const password = document.getElementById('registerPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    let isValid = true;
    
    if (!validatePassword(password)) {
        isValid = false;
    }
    
    if (!checkPasswordMatch(password, confirmPassword)) {
        isValid = false;
    }
    
    return isValid;
}

// Mettre à jour la confirmation
function updateConfirmation() {
    document.getElementById('confirmUsername').textContent = document.getElementById('username').value;
    document.getElementById('confirmFullName').textContent = document.getElementById('fullName').value || 'Non renseigné';
    document.getElementById('confirmEmail').textContent = document.getElementById('registerEmail').value;
}

// Fonction d'inscription
async function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('username');
    const email = document.getElementById('registerEmail');
    const password = document.getElementById('registerPassword');
    const termsCheck = document.getElementById('termsCheck');
    const alertDiv = document.getElementById('registerAlert');
    const submitBtn = document.getElementById('registerSubmitBtn');
    const submitText = document.getElementById('registerSubmitText');
    const submitSpinner = document.getElementById('registerSubmitSpinner');
    
    // Valider les termes
    if (!validateTerms(termsCheck)) {
        return;
    }
    
    // Désactiver le bouton
    submitBtn.disabled = true;
    submitText.textContent = 'Création en cours...';
    submitSpinner.classList.remove('d-none');
    
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
            showAlert(alertDiv, 'success', `
                <i class="bi bi-check-circle"></i> 
                ${data.message || 'Compte créé avec succès !'}
                <br>Redirection vers la page de connexion...
            `);
            
            // Rediriger après 2 secondes
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            
        } else {
            showAlert(alertDiv, 'danger', `
                <i class="bi bi-exclamation-triangle"></i> 
                ${data.message || 'Erreur lors de la création du compte'}
            `);
            
            submitBtn.disabled = false;
            submitText.textContent = 'Créer mon compte';
            submitSpinner.classList.add('d-none');
        }
    } catch (error) {
        console.error('Erreur:', error);
        showAlert(alertDiv, 'danger', `
            <i class="bi bi-exclamation-triangle"></i> 
            Erreur de connexion au serveur. Vérifiez votre connexion internet.
        `);
        
        submitBtn.disabled = false;
        submitText.textContent = 'Créer mon compte';
        submitSpinner.classList.add('d-none');
    }
}

// ==================== FONCTIONS UTILITAIRES ====================

// Validation du nom d'utilisateur
function validateUsername(input) {
    const value = input.value.trim();
    const isValid = value.length >= 3 && /^[a-zA-Z0-9_]+$/.test(value);
    
    if (value.length === 0) {
        input.classList.remove('is-valid', 'is-invalid');
    } else if (isValid) {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');
    } else {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
    }
    
    return isValid;
}

// Validation de l'email
function validateEmail(input) {
    const value = input.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(value);
    
    if (value.length === 0) {
        input.classList.remove('is-valid', 'is-invalid');
    } else if (isValid) {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');
    } else {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
    }
    
    return isValid;
}

// Validation du mot de passe
function validatePassword(input) {
    const value = input.value;
    const isValid = value.length >= 6;
    
    if (value.length === 0) {
        input.classList.remove('is-valid', 'is-invalid');
    } else if (isValid) {
        input.classList.add('is-valid');
        input.classList.remove('is-invalid');
    } else {
        input.classList.add('is-invalid');
        input.classList.remove('is-valid');
    }
    
    return isValid;
}

// Force du mot de passe
function validatePasswordStrength(input) {
    const value = input.value;
    const strengthBar = document.getElementById('passwordStrength');
    const strengthText = document.getElementById('passwordStrengthText');
    
    let strength = 0;
    let level = '';
    let color = '';
    
    if (value.length >= 6) strength++;
    if (value.length >= 10) strength++;
    if (/[A-Z]/.test(value)) strength++;
    if (/[a-z]/.test(value)) strength++;
    if (/[0-9]/.test(value)) strength++;
    if (/[^A-Za-z0-9]/.test(value)) strength++;
    
    if (strength <= 2) {
        level = 'Faible';
        color = '#dc3545';
    } else if (strength <= 4) {
        level = 'Moyen';
        color = '#ffc107';
    } else {
        level = 'Fort';
        color = '#28a745';
    }
    
    if (value.length === 0) {
        strengthBar.style.width = '0%';
        strengthText.textContent = 'Force du mot de passe';
    } else {
        const percentage = Math.min((strength / 6) * 100, 100);
        strengthBar.style.width = percentage + '%';
        strengthBar.style.backgroundColor = color;
        strengthText.textContent = `Force: ${level}`;
        strengthText.style.color = color;
    }
}

// Vérification de la correspondance des mots de passe
function checkPasswordMatch(passwordInput, confirmInput) {
    const password = passwordInput.value;
    const confirm = confirmInput.value;
    
    if (confirm.length === 0) {
        confirmInput.classList.remove('is-valid', 'is-invalid');
        return false;
    }
    
    if (password === confirm && password.length >= 6) {
        confirmInput.classList.add('is-valid');
        confirmInput.classList.remove('is-invalid');
        return true;
    } else {
        confirmInput.classList.add('is-invalid');
        confirmInput.classList.remove('is-valid');
        return false;
    }
}

// Validation des termes
function validateTerms(input) {
    const isValid = input.checked;
    
    if (!isValid) {
        input.classList.add('is-invalid');
    } else {
        input.classList.remove('is-invalid');
    }
    
    return isValid;
}

// Affichage des alertes
function showAlert(alertDiv, type, message) {
    alertDiv.className = `alert alert-${type}`;
    alertDiv.innerHTML = message;
    alertDiv.classList.remove('d-none');
    
    // Auto fermeture après 5 secondes
    setTimeout(() => {
        alertDiv.classList.add('d-none');
    }, 5000);
}

// Gestion du mot de passe oublié
function handleForgotPassword() {
    const email = prompt('Entrez votre adresse email pour réinitialiser votre mot de passe:');
    
    if (email && email.trim()) {
        // Simuler l'envoi d'un email
        alert(`
            Un lien de réinitialisation a été envoyé à ${email.trim()}
            \nVeuillez vérifier votre boîte mail.
        `);
    }
}
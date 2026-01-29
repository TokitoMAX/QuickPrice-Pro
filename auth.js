// QuickPrice Pro - Authentication Module
console.log("auth.js loading...");

const Auth = {
    init() {
        // Initialiser l'état si déjà connecté via Supabase
        this.checkSupabaseClient();
    },

    checkSupabaseClient() {
        if (!window.sbClient) {
            console.error("Supabase client non initialisé");
            return false;
        }
        return true;
    },

    async register(data) {
        // Validation des données
        if (!data.email || !data.password) {
            const error = new Error('Veuillez remplir tous les champs');
            this.showError(error.message);
            throw error;
        }

        if (data.password.length < 6) {
            const error = new Error('Le mot de passe doit contenir au moins 6 caractères');
            this.showError(error.message);
            throw error;
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Erreur lors de l\'inscription');
            }

            // Vérifier si l'email nécessite une confirmation (si le backend retourne un état spécifique)
            if (result.user && !result.token) {
                this.showSuccess('Inscription réussie ! Veuillez vérifier votre email pour confirmer votre compte.');
                setTimeout(() => {
                    if (typeof closeAllModals === 'function') closeAllModals();
                }, 2000);
                return result;
            }

            this.handleAuthSuccess(result);
            return result;
        } catch (error) {
            const errorMessage = this.translateError(error.message);
            this.showError(errorMessage);
            throw error;
        }
    },

    async login(email, password) {
        // Validation des données
        if (!email || !password) {
            const error = new Error('Veuillez remplir tous les champs');
            this.showError(error.message);
            throw error;
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Identifiants incorrects');
            }

            this.handleAuthSuccess(result);
            return result;
        } catch (error) {
            const errorMessage = this.translateError(error.message);
            this.showError(errorMessage);
            throw error;
        }
    },

    translateError(message) {
        const errorTranslations = {
            'Invalid login credentials': 'Email ou mot de passe incorrect',
            'Email not confirmed': 'Veuillez confirmer votre email avant de vous connecter',
            'User already registered': 'Cet email est déjà utilisé',
            'Password should be at least 6 characters': 'Le mot de passe doit contenir au moins 6 caractères',
            'Invalid email': 'Format d\'email invalide',
            'Email rate limit exceeded': 'Trop de tentatives. Veuillez réessayer plus tard',
            'Signup is disabled': 'Les inscriptions sont temporairement désactivées'
        };

        // Chercher une traduction correspondante
        for (const [key, translation] of Object.entries(errorTranslations)) {
            if (message.includes(key) || message.toLowerCase().includes(key.toLowerCase())) {
                return translation;
            }
        }

        // Retourner le message original si aucune traduction trouvée
        return message;
    },

    showError(message) {
        if (typeof App !== 'undefined' && App.showNotification) {
            App.showNotification(message, 'error');
        } else {
            alert(message);
        }
    },

    showSuccess(message) {
        if (typeof App !== 'undefined' && App.showNotification) {
            App.showNotification(message, 'success');
        } else {
            alert(message);
        }
    },

    handleAuthSuccess(authData) {
        const user = authData.user;
        const session = authData.session;

        if (!user) {
            throw new Error('Données utilisateur manquantes');
        }

        const userData = {
            id: user.id,
            email: user.email,
            company: { name: user.user_metadata?.company_name || '' },
            isPro: user.user_metadata?.is_pro || false,
            token: session?.access_token
        };

        localStorage.setItem('qp_token', userData.token || '');
        localStorage.setItem('qp_user', JSON.stringify(userData));

        // Mettre à jour Storage avec les infos utilisateur
        if (typeof Storage !== 'undefined') {
            Storage.setUser(userData);
        }

        this.showSuccess('Bienvenue !');

        // Fermer les modales
        if (typeof closeAllModals === 'function') {
            closeAllModals();
        }

        // Entrer dans l'application
        if (typeof App !== 'undefined' && App.enterApp) {
            App.enterApp();
        } else {
            window.location.reload();
        }
    },

    logout() {
        if (window.sbClient) window.sbClient.auth.signOut();
        localStorage.removeItem('qp_token');
        localStorage.removeItem('qp_user');
        sessionStorage.removeItem('qp_in_app');

        App.showNotification('Déconnexion réussie.', 'info');
        window.location.reload();
    },

    isLoggedIn() {
        return !!localStorage.getItem('qp_token');
    },

    getUser() {
        const user = localStorage.getItem('qp_user');
        return user ? JSON.parse(user) : null;
    }
};

// Exposer Auth globalement
window.Auth = Auth;

try {
    Auth.init();
    console.log("Auth initialized");
} catch (e) {
    console.error("Auth Init Error:", e);
}

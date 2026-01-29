// QuickPrice Pro - Authentication Module

const Auth = {
    API_URL: window.location.origin + '/api/auth',

    init() {
        // Vérifier si un token existe au démarrage
        const token = localStorage.getItem('qp_token');
        if (token) {
            this.setupAjax(token);
        }
    },

    async register(data) {
        try {
            const response = await fetch(`${this.API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Erreur lors de l\'inscription');
            }

            this.handleAuthSuccess(result);
            return result;
        } catch (error) {
            App.showNotification(error.message, 'error');
            throw error;
        }
    },

    async login(email, password) {
        try {
            const response = await fetch(`${this.API_URL}/login`, {
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
            App.showNotification(error.message, 'error');
            throw error;
        }
    },

    handleAuthSuccess(result) {
        localStorage.setItem('qp_token', result.token);
        localStorage.setItem('qp_user', JSON.stringify({
            id: result._id,
            email: result.email,
            company: result.company,
            isPro: result.isPro
        }));

        // Mettre à jour Storage avec les infos utilisateur
        Storage.setUser(result);

        App.showNotification('Bienvenue !', 'success');
        App.enterApp();
    },

    logout() {
        localStorage.removeItem('qp_token');
        localStorage.removeItem('qp_user');
        sessionStorage.removeItem('qp_in_app');

        App.showNotification('Déconnexion réussie.', 'info');
        window.location.reload(); // Recharger pour réinitialiser l'état
    },

    isLoggedIn() {
        return !!localStorage.getItem('qp_token');
    },

    getUser() {
        const user = localStorage.getItem('qp_user');
        return user ? JSON.parse(user) : null;
    },

    setupAjax(token) {
        // Si on utilisait une lib comme Axios, on configurerait les headers ici
        // Pour fetch, on passera le header manuellement dans les futurs appels de synchronisation
    }
};

Auth.init();

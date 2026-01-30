// QuickPrice Pro - Authentication Module
console.log("auth.js loading...");

const Auth = {
    init() {
        // Mode Backend Local - Initialisation standard
    },

    async register(data) {
        if (!data.email || !data.password) {
            this.showError('Veuillez remplir tous les champs obligatoires');
            throw new Error('Champs manquants');
        }

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const contentType = response.headers.get("content-type");
            let result;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                result = await response.json();
            } else {
                const text = await response.text();
                console.error("Non-JSON response received:", { status: response.status, body: text });
                throw new Error(`Erreur serveur (${response.status}): Réponse invalide. Vérifiez la console du serveur.`);
            }

            if (!response.ok) {
                console.error("API error response:", result);
                throw new Error(result.message || `Erreur (${response.status}) lors de l'inscription`);
            }

            if (result.requiresConfirmation || (result.user && !result.session)) {
                this.showSuccess(result.message || 'Inscription réussie ! Veuillez confirmer votre email.');
                if (typeof closeAllModals === 'function') closeAllModals();
                return result;
            }

            this.handleAuthSuccess(result);
            return result;
        } catch (error) {
            this.showError(error.message);
            throw error;
        }
    },

    async login(email, password) {
        if (!email || !password) {
            this.showError('Veuillez remplir tous les champs');
            throw new Error('Champs manquants');
        }

        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const contentType = response.headers.get("content-type");
            let result;
            if (contentType && contentType.indexOf("application/json") !== -1) {
                result = await response.json();
            } else {
                const text = await response.text();
                console.error("Non-JSON response received:", { status: response.status, body: text });
                throw new Error(`Erreur serveur (${response.status}): Réponse invalide.`);
            }

            if (!response.ok) {
                console.error("API error response:", result);
                throw new Error(result.message || `Erreur (${response.status}): Identifiants incorrects`);
            }

            this.handleAuthSuccess(result);
            return result;
        } catch (error) {
            this.showError(error.message);
            throw error;
        }
    },

    showError(message) {
        if (typeof App !== 'undefined' && App.showNotification) {
            App.showNotification(message, 'error');
        } else {
            alert("Erreur: " + message);
        }
    },

    showSuccess(message) {
        if (typeof App !== 'undefined' && App.showNotification) {
            App.showNotification(message, 'success');
        } else {
            console.log("Success:", message);
        }
    },

    handleAuthSuccess(authData) {
        const user = authData.user;
        const session = authData.session;

        if (!user || !session) {
            console.log("Auth success but no user/session (waiting for confirmation?)");
            return;
        }

        const userData = {
            id: user.id,
            email: user.email,
            company: { name: user.user_metadata?.company_name || '' },
            isPro: user.user_metadata?.is_pro || false,
            token: session?.access_token
        };

        localStorage.setItem('qp_token', userData.token);
        localStorage.setItem('qp_user', JSON.stringify(userData));

        if (typeof Storage !== 'undefined') Storage.setUser(userData);

        this.showSuccess('Bienvenue, ' + (userData.company.name || userData.email) + ' !');

        if (typeof closeAllModals === 'function') closeAllModals();

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

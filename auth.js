// QuickPrice Pro - Authentication Module
console.log("auth.js loading...");

const Auth = {
    init() {
        // Mode Local - Pas d'initialisation requise
    },

    async register(data) {
        if (!data.email || !data.password || !data.company?.name) {
            this.showError('Veuillez remplir tous les champs');
            throw new Error('Champs manquants');
        }

        try {
            await new Promise(r => setTimeout(r, 600)); // Simuler un délai
            const users = JSON.parse(localStorage.getItem('qp_local_users') || '[]');

            if (users.find(u => u.email === data.email.trim())) {
                throw new Error('Cet email est déjà utilisé');
            }

            const newUser = {
                id: 'u_' + Date.now(),
                email: data.email.trim(),
                password: data.password,
                company_name: data.company.name,
                is_pro: false,
                createdAt: new Date().toISOString()
            };

            users.push(newUser);
            localStorage.setItem('qp_local_users', JSON.stringify(users));

            this.handleAuthSuccess({
                user: { id: newUser.id, email: newUser.email, user_metadata: { company_name: newUser.company_name, is_pro: newUser.is_pro } },
                session: { access_token: 'local_' + newUser.id }
            });
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
            await new Promise(r => setTimeout(r, 400));
            const users = JSON.parse(localStorage.getItem('qp_local_users') || '[]');
            const user = users.find(u => u.email === email.trim() && u.password === password);

            if (!user) throw new Error('Email ou mot de passe incorrect');

            this.handleAuthSuccess({
                user: { id: user.id, email: user.email, user_metadata: { company_name: user.company_name, is_pro: user.is_pro } },
                session: { access_token: 'local_' + user.id }
            });
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
            alert("Succès: " + message);
        }
    },

    handleAuthSuccess(authData) {
        const user = authData.user;
        const session = authData.session;

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

        this.showSuccess('Bienvenue !');
        if (typeof closeAllModals === 'function') closeAllModals();
        if (typeof App !== 'undefined' && App.enterApp) App.enterApp();
        else window.location.reload();
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

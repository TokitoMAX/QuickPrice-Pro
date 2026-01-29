// QuickPrice Pro - Authentication Module
console.log("auth.js loading...");

const Auth = {
    init() {
        // Initialiser l'état si déjà connecté via Supabase
    },

    async register(data) {
        try {
            const { data: authData, error } = await window.sbClient.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        company_name: data.company?.name || '',
                        is_pro: false
                    }
                }
            });

            if (error) throw error;

            this.handleAuthSuccess(authData);
            return authData;
        } catch (error) {
            App.showNotification(error.message, 'error');
            throw error;
        }
    },

    async login(email, password) {
        try {
            const { data: authData, error } = await window.sbClient.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            this.handleAuthSuccess(authData);
            return authData;
        } catch (error) {
            App.showNotification(error.message || 'Identifiants incorrects', 'error');
            throw error;
        }
    },

    handleAuthSuccess(authData) {
        const user = authData.user;
        const session = authData.session;

        const userData = {
            id: user.id,
            email: user.email,
            company: { name: user.user_metadata.company_name },
            isPro: user.user_metadata.is_pro,
            token: session?.access_token
        };

        localStorage.setItem('qp_token', userData.token);
        localStorage.setItem('qp_user', JSON.stringify(userData));

        // Mettre à jour Storage avec les infos utilisateur
        Storage.setUser(userData);

        App.showNotification('Bienvenue !', 'success');
        App.enterApp();
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

Auth.init();

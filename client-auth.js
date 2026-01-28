const Auth = {
    API_URL: '/api/auth',

    // State
    user: null,
    token: localStorage.getItem('qp_token'),

    // Init
    init() {
        if (this.token) {
            this.fetchProfile();
        }
        this.updateUI();
    },

    // UI Updates
    updateUI() {
        const authButtons = document.getElementById('landing-auth-buttons');
        if (!authButtons) return;

        if (this.token) {
            authButtons.innerHTML = `
                <button class="cta-button small" onclick="App.enterApp()" style="padding: 0.8rem 1.5rem; font-size: 0.9rem;">
                    Accéder au Dashboard
                </button>
            `;
        } else {
            authButtons.innerHTML = `
                <button class="btn-login" onclick="Auth.showLoginModal()">Se connecter</button>
                <button class="cta-button small" onclick="Auth.showRegisterModal()" style="padding: 0.8rem 1.5rem; font-size: 0.9rem;">S'inscrire</button>
            `;
        }
    },

    // Register
    async register(name, email, password, companyName) {
        try {
            const res = await fetch(`${this.API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    company: { name: companyName } // Basic company info for now
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Erreur lors de l\'inscription');
            }

            this.loginSuccess(data);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Login
    async login(email, password) {
        try {
            const res = await fetch(`${this.API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || 'Erreur de connexion');
            }

            this.loginSuccess(data);
            return { success: true };
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Login Success Handler
    loginSuccess(data) {
        this.token = data.token;
        this.user = data;

        localStorage.setItem('qp_token', data.token);

        // Update helper storage
        if (typeof Storage !== 'undefined') {
            localStorage.setItem('qp_user', JSON.stringify({
                ...data,
                isPro: data.isPro
            }));
            // Reload basic storage info
            if (Storage.init) Storage.init();
        }

        this.updateUI();

        // Redirect to app
        if (typeof App !== 'undefined') {
            App.enterApp();
            App.showNotification('👋 Ravi de vous revoir !', 'success');
        }
    },

    // Fetch Profile
    async fetchProfile() {
        if (!this.token) return;

        try {
            const res = await fetch(`${this.API_URL}/me`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (res.ok) {
                const user = await res.json();
                this.user = user;
                // Sync with Storage
                if (typeof Storage !== 'undefined') {
                    localStorage.setItem('qp_user', JSON.stringify(user));
                }
                this.updateUI();
            } else {
                this.logout();
            }
        } catch (error) {
            console.error('Auth check user error', error);
            this.logout();
        }
    },

    // Logout
    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('qp_token');
        this.updateUI();

        // Return to landing
        if (document.getElementById('app-wrapper').style.display !== 'none') {
            window.location.reload();
        }
    },

    // UI Helpers
    showLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) modal.classList.add('active');
    },

    showRegisterModal() {
        const modal = document.getElementById('register-modal');
        if (modal) modal.classList.add('active');

        // Close login if open
        const loginModal = document.getElementById('login-modal');
        if (loginModal) loginModal.classList.remove('active');
    },

    closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(el => el.classList.remove('active'));
    }
};

// Initialize
document.addEventListener('DOMContentLoaded', () => Auth.init());

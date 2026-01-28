// Simple Authentication System
const Auth = {
    currentUser: null,

    init() {
        // Check if user is logged in
        const savedUser = localStorage.getItem('qp_current_user');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
        this.updateUI();
    },

    updateUI() {
        const authButtons = document.getElementById('landing-auth-buttons');
        if (!authButtons) return;

        if (this.currentUser) {
            // User is logged in
            authButtons.innerHTML = `
                <span style="color: #fff; margin-right: 1rem;">Bonjour, ${this.currentUser.name}</span>
                <button class="cta-button small" onclick="App.enterApp()">Dashboard</button>
            `;
        } else {
            // User is not logged in
            authButtons.innerHTML = `
                <button class="btn-login" onclick="Auth.openLoginModal()">Se connecter</button>
                <button class="cta-button small" onclick="Auth.openRegisterModal()">S'inscrire</button>
            `;
        }
    },

    openLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.add('active');
        }
    },

    openRegisterModal() {
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.classList.add('active');
        }
    },

    closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
    },

    async register(name, email, password) {
        // Get existing users
        const users = JSON.parse(localStorage.getItem('qp_users') || '[]');

        // Check if email already exists
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'Cet email est déjà utilisé' };
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password // In production, this should be hashed!
        };

        users.push(newUser);
        localStorage.setItem('qp_users', JSON.stringify(users));

        // Auto-login after registration
        this.currentUser = newUser;
        localStorage.setItem('qp_current_user', JSON.stringify(newUser));

        this.updateUI();
        this.closeModals();

        if (window.App) {
            App.showNotification('Compte créé avec succès !', 'success');
        }

        return { success: true };
    },

    async login(email, password) {
        const users = JSON.parse(localStorage.getItem('qp_users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);

        if (!user) {
            return { success: false, message: 'Email ou mot de passe incorrect' };
        }

        this.currentUser = user;
        localStorage.setItem('qp_current_user', JSON.stringify(user));

        this.updateUI();
        this.closeModals();

        if (window.App) {
            App.showNotification('Connexion réussie !', 'success');
        }

        return { success: true };
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('qp_current_user');
        this.updateUI();

        // Return to landing page
        const landing = document.getElementById('landing-page');
        const appWrapper = document.getElementById('app-wrapper');
        if (landing) landing.style.display = 'block';
        if (appWrapper) appWrapper.style.display = 'none';

        if (window.App) {
            App.showNotification('Déconnexion réussie', 'info');
        }
    },

    isAuthenticated() {
        return this.currentUser !== null;
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    Auth.init();
});

// Make Auth available globally
window.Auth = Auth;

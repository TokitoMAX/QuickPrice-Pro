const Auth = {
    // Current User State
    user: null,

    // --- INITIALIZATION ---
    init() {
        console.log("Auth (Local) initializing...");
        this.checkSession();
    },

    // --- CORE ACTIONS ---

    // Check if user is already logged in (from LocalStorage)
    checkSession() {
        const storedUser = localStorage.getItem('qp_user_session');
        if (storedUser) {
            try {
                this.user = JSON.parse(storedUser);
                console.log("Session restored for:", this.user.email);
            } catch (e) {
                console.error("Session corrupted, clearing.");
                localStorage.removeItem('qp_user_session');
                this.user = null;
            }
        }
        this.updateUI();
    },

    // Login checks against 'qp_users_db' in LocalStorage
    async login(email, password) {
        // Simulate network delay for realism
        await new Promise(r => setTimeout(r, 500));

        const usersDB = JSON.parse(localStorage.getItem('qp_users_db') || '[]');
        const foundUser = usersDB.find(u => u.email === email && u.password === password);

        if (foundUser) {
            this.startSession(foundUser);
            App.showNotification('Connexion réussie !', 'success');
            return { success: true };
        } else {
            return { success: false, message: "Email ou mot de passe incorrect." };
        }
    },

    // Register saves new user to 'qp_users_db'
    async register(company, email, password) {
        await new Promise(r => setTimeout(r, 500));

        const usersDB = JSON.parse(localStorage.getItem('qp_users_db') || '[]');

        // Check if exists
        if (usersDB.find(u => u.email === email)) {
            return { success: false, message: "Cet email est déjà utilisé." };
        }

        const newUser = {
            id: Date.now(),
            company,
            email,
            password, // In a real app never store cleartext passwords!
            createdAt: new Date().toISOString()
        };

        usersDB.push(newUser);
        localStorage.setItem('qp_users_db', JSON.stringify(usersDB));

        this.startSession(newUser);
        App.showNotification('Compte créé avec succès !', 'success');
        return { success: true };
    },

    // Logout clears session
    async logout() {
        localStorage.removeItem('qp_user_session');
        this.user = null;
        App.showNotification('Déconnecté.', 'info');
        window.location.reload();
    },

    // --- INTERNALS ---

    startSession(userObj) {
        this.user = userObj;
        localStorage.setItem('qp_user_session', JSON.stringify(userObj));
        this.updateUI();
    },

    updateUI() {
        const landingButtons = document.getElementById('landing-auth-buttons');
        const appWrapper = document.getElementById('app-wrapper');

        // 1. Logged In State
        if (this.user) {
            if (landingButtons) {
                landingButtons.innerHTML = `
                    <button class="cta-button small" onclick="App.enterApp()">Accéder au Dashboard</button>
                    <button class="btn-login" onclick="Auth.logout()" style="margin-left: 0.5rem; font-size: 0.8rem; padding: 0.5rem 1rem;">Déconnexion</button>
                `;
            }
        }
        // 2. Guest State
        else {
            if (landingButtons) {
                landingButtons.innerHTML = `
                    <button class="btn-login" onclick="Auth.showLoginModal()">Se connecter</button>
                    <button class="cta-button small" onclick="Auth.showRegisterModal()" style="padding: 0.8rem 1.5rem; font-size: 0.9rem;">S'inscrire</button>
                `;
            }
            // If user is inside app but logged out -> Reload to kick them out
            if (appWrapper && appWrapper.style.display !== 'none') {
                window.location.reload();
            }
        }
    },

    // --- MODAL HELPERS ---

    showLoginModal() {
        const modal = document.getElementById('login-modal');
        const regModal = document.getElementById('register-modal');
        if (regModal) { regModal.classList.remove('active'); regModal.style.display = 'none'; }
        if (modal) { modal.classList.add('active'); modal.style.display = 'flex'; }
    },

    showRegisterModal() {
        const modal = document.getElementById('login-modal');
        const regModal = document.getElementById('register-modal');
        if (modal) { modal.classList.remove('active'); modal.style.display = 'none'; }
        if (regModal) { regModal.classList.add('active'); regModal.style.display = 'flex'; }
    },

    closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(el => {
            el.classList.remove('active');
            el.style.display = 'none';
        });
    },

    // Gatekeeper for App.js
    requireAuth() {
        if (!this.user) {
            this.showLoginModal();
            return false;
        }
        return true;
    }
};

// Auto-init
window.addEventListener('load', () => { Auth.init(); });
window.Auth = Auth;

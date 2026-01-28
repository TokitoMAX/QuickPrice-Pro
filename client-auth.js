const Auth = {
    user: null,

    get supabase() {
        return window.supabaseClient || window.supabase;
    },

    async init() {
        try {
            console.log("Auth initializing...");
            if (!this.supabase) {
                console.error("Supabase client not found!");
                return;
            }

            // Check for existing session
            const { data: { session }, error } = await this.supabase.auth.getSession();
            if (error) throw error;

            this.updateAuthState(session);

            // Listen for auth changes
            this.supabase.auth.onAuthStateChange((event, session) => {
                console.log("Auth state change:", event, session);
                this.updateAuthState(session);
            });
        } catch (err) {
            console.error("Auth Init Error:", err);
        }
    },

    updateAuthState(session) {
        this.user = session ? session.user : null;

        const landingAuthButtons = document.getElementById('landing-auth-buttons');
        const appWrapper = document.getElementById('app-wrapper');
        const landingPage = document.getElementById('landing-page');

        if (this.user) {
            console.log("User logged in:", this.user.email);
            if (landingAuthButtons) {
                landingAuthButtons.innerHTML = `
                    <button class="cta-button small" onclick="App.enterApp()">Accéder au Dashboard</button>
                    <button class="btn-login" onclick="Auth.logout()" style="margin-left: 0.5rem; font-size: 0.8rem; padding: 0.5rem 1rem;">Déconnexion</button>
                `;
            }
        } else {
            console.log("User logged out");
            if (landingAuthButtons) {
                landingAuthButtons.innerHTML = `
                   <button class="btn-login" onclick="Auth.showLoginModal()">Se connecter</button>
                    <button class="cta-button small" onclick="Auth.showRegisterModal()"
                        style="padding: 0.8rem 1.5rem; font-size: 0.9rem;">S'inscrire</button>
                `;
            }

            if (appWrapper && appWrapper.style.display !== 'none') {
                window.location.reload();
            }
        }
    },

    async login(email, password) {
        if (!this.supabase) return { success: false, message: "Supabase not initialized" };
        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            App.showNotification('Connexion réussie !', 'success');
            return { success: true };
        } catch (error) {
            console.error('Login error:', error);
            App.showNotification(error.message || 'Erreur de connexion', 'error');
            return { success: false, message: error.message };
        }
    },

    async register(name, email, password, companyName) {
        if (!this.supabase) return { success: false, message: "Supabase not initialized" };
        try {
            const { data, error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name,
                        company: companyName
                    }
                }
            });

            if (error) throw error;

            App.showNotification('Inscription réussie !', 'success');
            return { success: true };
        } catch (error) {
            console.error('Register error:', error);
            App.showNotification(error.message || 'Erreur d\'inscription', 'error');
            return { success: false, message: error.message };
        }
    },

    async logout() {
        if (!this.supabase) return;
        try {
            const { error } = await this.supabase.auth.signOut();
            if (error) throw error;
            App.showNotification('Déconnecté', 'info');
            window.location.reload();
        } catch (error) {
            console.error('Logout error:', error);
            App.showNotification('Erreur lors de la déconnexion', 'error');
        }
    },

    showLoginModal() {
        console.log("Opening login modal");
        // DEBUG: Alert to prove click works
        // alert("DEBUG: Opening Login Modal");

        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
        } else {
            alert("Erreur: Modal de connexion introuvable dans le HTML");
        }

        const regModal = document.getElementById('register-modal');
        if (regModal) {
            regModal.classList.remove('active');
            regModal.style.display = 'none';
        }
    },

    showRegisterModal() {
        console.log("Opening register modal");
        // DEBUG: Alert to prove click works
        // alert("DEBUG: Opening Register Modal");

        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
        } else {
            alert("Erreur: Modal d'inscription introuvable dans le HTML");
        }

        const loginModal = document.getElementById('login-modal');
        if (loginModal) {
            loginModal.classList.remove('active');
            loginModal.style.display = 'none';
        }
    },

    closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(el => {
            el.classList.remove('active');
            el.style.display = 'none';
        });
    },

    requireAuth() {
        if (!this.user) {
            this.showLoginModal();
            return false;
        }
        return true;
    }
};

// Initialize
// Wait for window load to ensure everything is ready
window.addEventListener('load', () => {
    Auth.init();
});

// Expose to window immediately
window.Auth = Auth;

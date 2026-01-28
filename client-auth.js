const Auth = {
    user: null,

    async init() {
        // Check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        this.updateAuthState(session);

        // Listen for auth changes
        supabase.auth.onAuthStateChange((event, session) => {
            console.log("Auth state change:", event, session);
            this.updateAuthState(session);
        });
    },

    updateAuthState(session) {
        this.user = session ? session.user : null;

        const landingAuthButtons = document.getElementById('landing-auth-buttons');
        const appWrapper = document.getElementById('app-wrapper');
        const landingPage = document.getElementById('landing-page');

        if (this.user) {
            console.log("User logged in:", this.user.email);
            // User is logged in
            // If we are on landing page, user might want to go to app or stay
            // But usually we update UI to show "Enter App" instead of "Login"
            if (landingAuthButtons) {
                landingAuthButtons.innerHTML = `
                    <button class="cta-button small" onclick="App.enterApp()">Accéder au Dashboard</button>
                `;
            }
        } else {
            console.log("User logged out");
            // User is logged out
            if (landingAuthButtons) {
                landingAuthButtons.innerHTML = `
                   <button class="btn-login" onclick="Auth.showLoginModal()">Se connecter</button>
                    <button class="cta-button small" onclick="Auth.showRegisterModal()"
                        style="padding: 0.8rem 1.5rem; font-size: 0.9rem;">S'inscrire</button>
                `;
            }

            // Force landing page if currently in app
            // Check if App is visible (simple check via display style or class)
            if (appWrapper && appWrapper.style.display !== 'none' && !landingPage.style.display === 'none') {
                // Determine if we need to kick them out. 
                // App.enterApp() handles showing appWrapper. 
                // We should probably reload or hide appWrapper manually if we want strict logout.
                window.location.reload();
            }
        }
    },

    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
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
        try {
            const { data, error } = await supabase.auth.signUp({
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
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;

            App.showNotification('Déconnecté', 'info');
            // UI update handled by onAuthStateChange
            window.location.reload(); // Hard reload to clear any app state
        } catch (error) {
            console.error('Logout error:', error);
            App.showNotification('Erreur lors de la déconnexion', 'error');
        }
    },

    // UI Helpers
    showLoginModal() {
        document.getElementById('login-modal').classList.add('active');
        document.getElementById('register-modal').classList.remove('active');
    },

    showRegisterModal() {
        document.getElementById('register-modal').classList.add('active');
        document.getElementById('login-modal').classList.remove('active');
    },

    closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(el => el.classList.remove('active'));
    },

    // Check if authenticated, otherwise prompt login
    requireAuth() {
        if (!this.user) {
            this.showLoginModal();
            return false;
        }
        return true;
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    // Auth.init is called inside App.init or independently? 
    // Let's call it here to be sure it runs early
    Auth.init();
});

// Expose to window for inline HTML handlers
window.Auth = Auth;

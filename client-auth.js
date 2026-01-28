const Auth = {
    // Always present "Guest" user
    user: {
        id: 'guest',
        email: 'demo@quickprice.pro',
        name: 'Utilisateur'
    },

    init() {
        console.log("Auth (No-Login Mode) active.");
        this.updateUI();
    },

    // UI Updates: Always show "Access Dashboard"
    updateUI() {
        const landingButtons = document.getElementById('landing-auth-buttons');
        if (landingButtons) {
            landingButtons.innerHTML = `
                <button class="cta-button small" onclick="App.enterApp()">Accéder au Dashboard</button>
            `;
        }
    },

    // No-ops for legacy calls
    login() { return { success: true }; },
    register() { return { success: true }; },
    logout() { window.location.reload(); },

    // Modals no longer exist
    showLoginModal() { App.enterApp(); },
    showRegisterModal() { App.enterApp(); },
    closeModals() { },

    // Always allow
    requireAuth() { return true; }
};

// Initialize immediately
Auth.init();
window.Auth = Auth;

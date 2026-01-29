// QuickPrice Pro - Application Manager
// Gestion du routing et de la navigation SPA

const App = {
    currentPage: 'dashboard',

    // Initialisation de l'application
    init() {
        this.setupNavigation();
        this.checkFreemiumLimits();
        this.renderProBadge();
        this.renderUserInfo();

        // Router / Landing Logic
        const savedPage = localStorage.getItem('qp_last_page') || 'dashboard';
        const isLoggedIn = Auth.isLoggedIn();

        if (isLoggedIn) {
            this.enterApp(false);
            this.navigateTo(savedPage);
            // Sync user data quietly
            this.syncUser();
        } else {
            // Force landing page if not logged in
            const landing = document.getElementById('landing-page');
            const appWrapper = document.getElementById('app-wrapper');
            if (landing) landing.style.display = 'block';
            if (appWrapper) appWrapper.style.display = 'none';
        }

        // Event listener pour fermeture de modales
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal-overlay')) {
                this.closeModal();
            }
        });
    },

    enterApp(animate = true) {
        const landing = document.getElementById('landing-page');
        const appWrapper = document.getElementById('app-wrapper');

        if (landing) landing.style.display = 'none';
        if (appWrapper) {
            appWrapper.style.display = 'block';
            if (animate) {
                appWrapper.style.animation = 'fadeIn 0.5s ease';
            }
        }

        sessionStorage.setItem('qp_in_app', 'true');
        this.renderUserInfo();
        this.navigateTo('dashboard');
    },

    toggleMobileMenu() {
        const sidebar = document.querySelector('.sidebar');
        sidebar.classList.toggle('active');

        const toggle = document.getElementById('mobile-menu-toggle');
        toggle.classList.toggle('active');
    },

    // Configuration de la navigation
    setupNavigation() {
        document.querySelectorAll('[data-nav]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = e.currentTarget.dataset.nav;
                this.navigateTo(page);
            });
        });
    },

    // Navigation entre pages
    navigateTo(page) {
        // Fermer le menu mobile si ouvert
        const sidebar = document.querySelector('.sidebar');
        if (sidebar) sidebar.classList.remove('active');
        const toggle = document.getElementById('mobile-menu-toggle');
        if (toggle) toggle.classList.remove('active');

        // Cacher toutes les pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // Afficher la page demandée
        const pageElement = document.getElementById(`${page}-page`);
        if (pageElement) {
            pageElement.classList.add('active');
            this.currentPage = page;

            // Mettre à jour l'état actif de la navigation
            document.querySelectorAll('[data-nav]').forEach(link => {
                link.classList.remove('active');
                if (link.dataset.nav === page) {
                    link.classList.add('active');
                }
            });

            // Charger le contenu de la page
            this.loadPage(page);
        }
    },

    // Chargement du contenu de chaque page
    loadPage(page) {
        switch (page) {
            case 'dashboard':
                if (typeof Dashboard !== 'undefined') Dashboard.render();
                break;
            case 'calculator':
                // Déjà chargé dans calculator.js
                if (typeof loadCalculatorInputs === 'function') loadCalculatorInputs();
                break;
            case 'services':
                if (typeof Services !== 'undefined') Services.render();
                break;
            case 'scoper':
                if (typeof Scoper !== 'undefined') Scoper.render();
                break;
            case 'clients':
                if (typeof Clients !== 'undefined') Clients.render();
                break;
            case 'leads':
                if (typeof Leads !== 'undefined') Leads.render();
                break;
            case 'quotes':
                if (typeof Quotes !== 'undefined') Quotes.render();
                break;
            case 'invoices':
                if (typeof Invoices !== 'undefined') Invoices.render();
                break;
            case 'settings':
                if (typeof Settings !== 'undefined') Settings.render();
                break;
        }
    },

    // Vérification des limites freemium
    checkFreemiumLimits() {
        const isPro = Storage.isPro();

        // Afficher/cacher la bannière freemium
        const banner = document.getElementById('freemium-banner');
        if (banner) {
            banner.style.display = isPro ? 'none' : 'flex';
        }

        return {
            canAddClient: isPro || Storage.getClients().length < 1,
            canAddQuote: isPro || Storage.getQuotes().length < 3,
            canAddInvoice: isPro || Storage.getInvoices().length < 3,
            canExportPDF: isPro,
            maxClients: isPro ? Infinity : 1,
            maxQuotes: isPro ? Infinity : 3,
            maxInvoices: isPro ? Infinity : 3
        };
    },

    async syncUser() {
        try {
            if (!window.sbClient) return;
            const { data: { user }, error } = await window.sbClient.auth.getUser();

            if (user) {
                const userData = {
                    id: user.id,
                    email: user.email,
                    company: { name: user.user_metadata.company_name },
                    isPro: user.user_metadata.is_pro
                };
                Storage.setUser(userData);
                this.renderUserInfo();
            } else if (error) {
                // Session probablement expirée
                Auth.logout();
            }
        } catch (error) {
            console.error('Failed to sync user:', error);
        }
    },

    // Affichage des informations utilisateur dans la sidebar
    renderUserInfo() {
        const user = Auth.getUser();
        if (!user) return;

        const infoContainer = document.getElementById('user-info-sidebar');
        if (infoContainer) {
            infoContainer.innerHTML = `
                <div class="user-profile">
                    <div class="user-avatar">${user.company?.name?.charAt(0) || 'U'}</div>
                    <div class="user-details">
                        <span class="user-name">${user.company?.name || user.email}</span>
                        <span class="user-status">${user.isPro ? '<span class="pro-badge-small">PRO</span>' : 'Version Gratuite'}</span>
                    </div>
                </div>
            `;
        }
    },

    // Affichage du badge PRO (legacy, used in other places maybe)
    renderProBadge() {
        const isPro = Storage.isPro();
        const badge = document.getElementById('pro-badge');
        if (badge) {
            badge.style.display = isPro ? 'inline-flex' : 'none';
        }
    },

    // Afficher le modal d'upgrade
    showUpgradeModal(reason = 'limit') {
        const messages = {
            limit: 'Vous avez atteint la limite de la version gratuite.',
            pdf: 'L\'export PDF est réservé aux utilisateurs PRO.',
            feature: 'Cette fonctionnalité est réservée aux utilisateurs PRO.'
        };

        const modal = document.getElementById('upgrade-modal');
        const messageEl = modal?.querySelector('.upgrade-message');

        if (messageEl) {
            messageEl.textContent = messages[reason] || messages.limit;
        }

        if (modal) {
            modal.classList.add('active');
        }
    },

    // Afficher le modal d'activation de licence
    showLicenseModal() {
        const modal = document.getElementById('license-modal');
        if (modal) {
            modal.classList.add('active');
            const input = modal.querySelector('#license-key-input');
            if (input) input.value = '';
        }
    },

    // Fermer les modales
    closeModal() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.remove('active');
        });
    },

    // Activer une licence
    activateLicense() {
        const input = document.getElementById('license-key-input');
        const licenseKey = input?.value.trim();

        if (!licenseKey) {
            this.showNotification('Veuillez entrer une clé de licence', 'error');
            return;
        }

        // Validation simple de la clé (format: QPPRO-XXXXX-XXXXX-XXXXX)
        const isValid = this.validateLicenseKey(licenseKey);

        if (isValid) {
            Storage.activatePro(licenseKey);
            this.closeModal();
            this.renderProBadge();
            this.checkFreemiumLimits();
            this.showNotification('Licence activée avec succès.', 'success');

            // Recharger la page actuelle
            this.loadPage(this.currentPage);
        } else {
            this.showNotification('Clé de licence invalide', 'error');
        }
    },

    // Validation de clé de licence
    validateLicenseKey(key) {
        // Format attendu: QPPRO-XXXXX-XXXXX-XXXXX
        const pattern = /^QPPRO-[A-Z0-9]{5}-[A-Z0-9]{5}-[A-Z0-9]{5}$/;
        return pattern.test(key);
    },

    // Générer une clé de licence (pour admin/test)
    generateLicenseKey() {
        const randomSegment = () => {
            return Array.from({ length: 5 }, () =>
                'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[Math.floor(Math.random() * 36)]
            ).join('');
        };

        return `QPPRO-${randomSegment()}-${randomSegment()}-${randomSegment()}`;
    },

    // Notification système
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
                    'linear-gradient(135deg, #6366f1, #4f46e5)'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 12px;
            font-weight: 600;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 10000;
            animation: slideInRight 0.5s ease, slideOutRight 0.5s ease 2.5s;
            max-width: 400px;
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    },

    // Formatage de devises
    formatCurrency(amount) {
        const settings = Storage.get(Storage.KEYS.SETTINGS);
        return `${Math.round(amount).toLocaleString('fr-FR')} ${settings.currency}`;
    },

    // Formatage de dates
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
    },

    // Calcul de total avec TVA
    calculateTotal(items, includeTax = true) {
        const settings = Storage.get(Storage.KEYS.SETTINGS);
        const subtotal = items.reduce((sum, item) =>
            sum + (item.quantity * item.unitPrice), 0
        );

        if (!includeTax) return subtotal;

        const taxAmount = subtotal * (settings.taxRate / 100);
        return subtotal + taxAmount;
    }
};

window.App = App;

// Auto-démarrage quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        try {
            App.init();
            console.log("App initialized");
        } catch (e) {
            console.error("App Init Error:", e);
        }
    });
} else {
    try {
        App.init();
    } catch (e) {
        console.error("App Init Error:", e);
    }
}

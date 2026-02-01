/**
 * SoloPrice Pro - Network Module
 * Handles Personal Service Providers & DomTomConnect Ecosystem
 */
const Network = {
    providers: [],

    init() {
        console.log('Network module initialized');
        this.loadProviders();
        this.render();
    },

    loadProviders() {
        this.providers = JSON.parse(localStorage.getItem('sp_network_providers') || '[]');
    },

    saveProviders() {
        localStorage.setItem('sp_network_providers', JSON.stringify(this.providers));
        this.render();
    },

    render() {
        const container = document.getElementById('network-content');
        if (!container) return;

        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Mon Cercle</h1>
                <p class="page-subtitle">Gérez vos clients, prospects et partenaires réseau.</p>
            </div>

            <div class="settings-tabs">
                <button class="settings-tab active" onclick="Network.switchTab('clients')">Mes Clients</button>
                <button class="settings-tab" onclick="Network.switchTab('leads')">Mes Prospects</button>
                <button class="settings-tab" onclick="Network.switchTab('partners')">Partenaires Réseau</button>
            </div>
            <div id="cercle-dynamic-content" style="margin-top: 2rem;">
                <!-- Rempli par switchTab -->
            </div>
        `;

        // Par défaut sur clients
        this.switchTab('clients');
    },

    switchTab(tabId) {
        document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`.settings-tab[onclick*="${tabId}"]`);
        if (activeTab) activeTab.classList.add('active');

        const container = document.getElementById('cercle-dynamic-content');
        if (!container) return;

        if (tabId === 'clients') {
            container.innerHTML = '<div id="clients-embedded-container"></div>';
            if (typeof Clients !== 'undefined') {
                Clients.render('clients-embedded-container');
            }
        } else if (tabId === 'leads') {
            container.innerHTML = '<div id="leads-embedded-container"></div>';
            if (typeof Leads !== 'undefined') {
                Leads.render('leads-embedded-container');
            }
        } else if (tabId === 'partners') {
            this.renderPartners(container);
        }
    },

    renderPartners(container) {
        if (this.providers.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Vous n'avez pas encore de prestataires dans votre réseau.</p>
                    <div style="display: flex; gap: 1rem; justify-content: center;">
                        <button class="button-primary" onclick="Network.showAddModal()">Ajouter manuellement</button>
                        <button class="button-secondary" onclick="App.navigateTo('marketplace', 'experts')">Découvrir des Experts</button>
                    </div>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="network-container">
                 <div class="section-header-inline">
                    <h3 class="section-title-small">Partenaires Réseau</h3>
                    <div style="display: flex; gap: 0.5rem;">
                        <button class="button-secondary small" onclick="App.navigateTo('marketplace', 'experts')">Trouver des Experts</button>
                        <button class="button-primary small" onclick="Network.showAddModal()">+ Nouveau</button>
                    </div>
                </div>
                <div class="partners-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 1rem;">
                    ${this.providers.map(p => `
                        <div class="network-card glass">
                            <div class="provider-avatar">${p.name.charAt(0)}</div>
                            <div class="provider-info">
                                <h3>${p.name}</h3>
                                <p class="provider-specialty">${p.specialty}</p>
                            </div>
                            <div class="provider-actions">
                                <button class="button-secondary sm" onclick="Network.deleteProvider('${p.id}')">Supprimer</button>
                            </div>
                        </div>
                    `).join('')}
                </div>

            </div>
        `;
    },
    showAddModal() {
        const modal = document.getElementById('network-add-modal');
        if (modal) modal.classList.add('active');
    },

    hideAddModal() {
        const modal = document.getElementById('network-add-modal');
        if (modal) modal.classList.remove('active');
    },

    addProvider(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newProvider = {
            id: Date.now().toString(),
            name: formData.get('name'),
            specialty: formData.get('specialty'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            city: formData.get('city')
        };

        this.providers.push(newProvider);
        this.saveProviders();
        this.hideAddModal();
        e.target.reset();
        App.showNotification('Partenaire ajouté au réseau.', 'success');
    },

    deleteProvider(id) {
        if (confirm('Supprimer ce partenaire de votre réseau ?')) {
            this.providers = this.providers.filter(p => p.id !== id);
            this.saveProviders();
            App.showNotification('Partenaire supprimé.', 'success');
        }
    }
};

// Auto-init for testing
window.Network = Network;

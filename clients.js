// QuickPrice Pro - Clients Module

const Clients = {
    editingId: null,

    render() {
        const container = document.getElementById('clients-content');
        if (!container) return;

        const clients = Storage.getClients();
        const limits = App.checkFreemiumLimits();

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Clients</h1>
                    <p class="page-subtitle">${clients.length} client(s) enregistré(s) ${!limits.canAddClient ? `(limite: ${limits.maxClients})` : ''}</p>
                </div>
                <button class="button-primary" onclick="Clients.showAddForm()" ${!limits.canAddClient ? 'disabled' : ''}>
                    <span>➕</span> Nouveau Client
                </button>
            </div>

            <div id="client-form-container"></div>

            ${clients.length > 0 ? `
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Email</th>
                                <th>Téléphone</th>
                                <th>Ville</th>
                                <th>Ajouté le</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${clients.map(client => `
                                <tr>
                                    <td><strong>${this.escapeHtml(client.name)}</strong></td>
                                    <td>${this.escapeHtml(client.email || '-')}</td>
                                    <td>${this.escapeHtml(client.phone || '-')}</td>
                                    <td>${this.escapeHtml(client.city || '-')}</td>
                                    <td>${App.formatDate(client.createdAt)}</td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="btn-icon" onclick="Clients.edit('${client.id}')" title="Modifier">
                                                ✏️
                                            </button>
                                            <button class="btn-icon btn-danger" onclick="Clients.delete('${client.id}')" title="Supprimer">
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            ` : `
                <div class="empty-state">
                    <div class="empty-icon">👥</div>
                    <p>Aucun client enregistré</p>
                    <button class="button-primary" onclick="Clients.showAddForm()">Ajouter mon premier client</button>
                </div>
            `}
        `;
    },

    showAddForm() {
        const limits = App.checkFreemiumLimits();
        if (!limits.canAddClient) {
            App.showUpgradeModal('limit');
            return;
        }

        this.editingId = null;
        const container = document.getElementById('client-form-container');

        container.innerHTML = `
            <div class="form-card">
                <div class="form-header">
                    <h3>Nouveau Client</h3>
                    <button class="btn-close" onclick="Clients.hideForm()">✕</button>
                </div>
                <form id="client-form" onsubmit="Clients.save(event)">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Nom / Entreprise *</label>
                            <input type="text" name="name" class="form-input" required>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" name="email" class="form-input">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Téléphone</label>
                            <input type="tel" name="phone" class="form-input">
                        </div>

                        <div class="form-group">
                            <label class="form-label">SIRET</label>
                            <input type="text" name="siret" class="form-input">
                        </div>

                        <div class="form-group full-width">
                            <label class="form-label">Adresse</label>
                            <input type="text" name="address" class="form-input">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Code Postal</label>
                            <input type="text" name="zipCode" class="form-input">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Ville</label>
                            <input type="text" name="city" class="form-input">
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="button-secondary" onclick="Clients.hideForm()">Annuler</button>
                        <button type="submit" class="button-primary">Enregistrer</button>
                    </div>
                </form>
            </div>
        `;

        container.scrollIntoView({ behavior: 'smooth' });
    },

    edit(id) {
        this.editingId = id;
        const client = Storage.getClient(id);
        if (!client) return;

        this.showAddForm();

        // Pré-remplir le formulaire
        const form = document.getElementById('client-form');
        const header = form.previousElementSibling.querySelector('h3');
        header.textContent = 'Modifier le Client';

        ['name', 'email', 'phone', 'siret', 'address', 'zipCode', 'city'].forEach(field => {
            const input = form.elements[field];
            if (input && client[field]) {
                input.value = client[field];
            }
        });
    },

    save(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const clientData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            siret: formData.get('siret'),
            address: formData.get('address'),
            zipCode: formData.get('zipCode'),
            city: formData.get('city')
        };

        if (this.editingId) {
            Storage.updateClient(this.editingId, clientData);
            App.showNotification('✅ Client modifié avec succès', 'success');
        } else {
            Storage.addClient(clientData);
            App.showNotification('✅ Client ajouté avec succès', 'success');
        }

        this.hideForm();
        this.render();
    },

    delete(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
            Storage.deleteClient(id);
            App.showNotification('✅ Client supprimé', 'success');
            this.render();
        }
    },

    hideForm() {
        const container = document.getElementById('client-form-container');
        container.innerHTML = '';
        this.editingId = null;
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

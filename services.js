// QuickPrice Pro - Services Catalog Module

const Services = {
    render() {
        const container = document.getElementById('services-content');
        if (!container) return;

        const services = Storage.getServices();

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Catalogue de Prestations</h1>
                    <p class="page-subtitle">${services.length} prestation(s) enregistrée(s)</p>
                </div>
                <button class="button-primary" onclick="Services.showAddForm()">
                    <span>➕</span> Nouvelle Prestation
                </button>
            </div>

            <div id="service-form-container"></div>

            ${services.length > 0 ? `
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Intitulé</th>
                                <th>Description par défaut</th>
                                <th>Prix Unitaire</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${services.sort((a, b) => a.label.localeCompare(b.label)).map(service => `
                                <tr>
                                    <td><strong>${service.label}</strong></td>
                                    <td>${service.description || '-'}</td>
                                    <td>${App.formatCurrency(service.unitPrice)}</td>
                                    <td>
                                        <div class="action-buttons">
                                            <button class="btn-icon btn-danger" onclick="Services.delete('${service.id}')" title="Supprimer">
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
                    <div class="empty-icon">🏷️</div>
                    <p>Créez votre catalogue de prestations pour aller plus vite dans vos devis</p>
                    <button class="button-primary" onclick="Services.showAddForm()">Ajouter ma première prestation</button>
                </div>
            `}
        `;
    },

    showAddForm() {
        const container = document.getElementById('service-form-container');
        container.innerHTML = `
            <div class="form-card">
                <div class="form-header">
                    <h3>Nouvelle Prestation</h3>
                    <button class="btn-close" onclick="Services.hideForm()">✕</button>
                </div>
                <form onsubmit="Services.save(event)">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Titre (ex: Site Vitrine) *</label>
                            <input type="text" name="label" class="form-input" required placeholder="Titre court pour la sélection">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Prix Unitaire *</label>
                            <input type="number" name="unitPrice" class="form-input" required min="0" step="0.01">
                        </div>

                        <div class="form-group full-width">
                            <label class="form-label">Description (apparaîtra sur le devis)</label>
                            <textarea name="description" class="form-input" rows="2" placeholder="Détails de la prestation..."></textarea>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="button-secondary" onclick="Services.hideForm()">Annuler</button>
                        <button type="submit" class="button-primary">Enregistrer</button>
                    </div>
                </form>
            </div>
        `;
        container.scrollIntoView({ behavior: 'smooth' });
    },

    save(e) {
        e.preventDefault();
        const formData = new FormData(e.target);

        const serviceData = {
            label: formData.get('label'),
            unitPrice: parseFloat(formData.get('unitPrice')),
            description: formData.get('description')
        };

        Storage.addService(serviceData);
        App.showNotification('✅ Prestation ajoutée au catalogue', 'success');
        this.render();
    },

    delete(id) {
        if (confirm('Supprimer cette prestation du catalogue ?')) {
            Storage.deleteService(id);
            App.showNotification('✅ Prestation supprimée', 'success');
            this.render();
        }
    },

    hideForm() {
        document.getElementById('service-form-container').innerHTML = '';
    }
};

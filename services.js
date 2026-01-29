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
                <div class="services-list-container">
                    ${this.renderGroupedServices(services)}
                </div>
            ` : `
                <div class="empty-state">
                    <div class="empty-icon">⚡</div>
                    <h3>Votre catalogue est vide</h3>
                    <p>Enregistrez vos prestations habituelles pour gagner du temps lors de vos devis.</p>
                    <button class="button-primary" onclick="Services.showAddForm()">Ajouter ma première prestation</button>
                </div>
            `}
        `;
    },

    renderGroupedServices(services) {
        // Group by category
        const groups = {};
        services.forEach(s => {
            const cat = s.category || 'Autres';
            if (!groups[cat]) groups[cat] = [];
            groups[cat].push(s);
        });

        // Generate HTML
        return Object.keys(groups).sort().map(cat => `
            <div class="service-category-group" style="margin-bottom: 2rem;">
                <h3 style="margin-bottom: 0.5rem; font-size: 1rem; color: var(--primary-color); border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">${cat}</h3>
                <table class="data-table">
                    <thead>
                        <tr>
                            <th style="width: 40%;">Intitulé</th>
                            <th style="width: 30%;">Description</th>
                            <th style="width: 15%;">Prix</th>
                            <th style="width: 10%;">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${groups[cat].map(service => `
                            <tr>
                                <td>
                                    <div style="font-weight: 600;">${service.label}</div>
                                    <div style="font-size: 0.8rem; color: var(--text-muted);">${service.unitType ? `Tarif par : ${service.unitType}` : ''}</div>
                                </td>
                                <td style="font-size: 0.9rem; color: var(--text-muted);">${service.description || '-'}</td>
                                <td style="font-weight: 600;">${App.formatCurrency(service.unitPrice)}</td>
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
        `).join('');
    },

    showAddForm() {
        const container = document.getElementById('service-form-container');
        container.innerHTML = `
            <div class="form-card">
                <div class="form-header">
                    <h3>Nouvelle Prestation</h3>
                    <button class="btn-close" onclick="Services.hideForm()">✕</button>
                </div>
                <form id="service-form" onsubmit="Services.save(event)">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Catégorie</label>
                            <input type="text" name="category" class="form-input" list="category-list" placeholder="Ex: Développement, Design...">
                            <datalist id="category-list">
                                <option value="Développement Web">
                                <option value="Design Graphique">
                                <option value="Consulting">
                                <option value="Maintenance">
                                <option value="Formation">
                            </datalist>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Intitulé de la prestation *</label>
                            <input type="text" name="label" class="form-input" required placeholder="Ex: Création Site Vitrine">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Prix Unitaire HT *</label>
                            <input type="number" name="unitPrice" class="form-input" required min="0" step="0.01">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Unité de facturation</label>
                            <select name="unitType" class="form-input">
                                <option value="Forfait">Forfait (Global)</option>
                                <option value="Jour">Jour (TJM)</option>
                                <option value="Heure">Heure</option>
                                <option value="Page">Page</option>
                                <option value="Article">Article</option>
                                <option value="Mois">Mois (Abonnement)</option>
                            </select>
                        </div>

                        <div class="form-group full-width">
                            <label class="form-label">Description par défaut</label>
                            <textarea name="description" class="form-input" rows="2" placeholder="Sera affiché sur le devis..."></textarea>
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
        const service = {
            label: formData.get('label'),
            unitPrice: parseFloat(formData.get('unitPrice')),
            category: formData.get('category'),
            unitType: formData.get('unitType'),
            description: formData.get('description')
        };

        Storage.addService(service);
        App.showNotification('✅ Prestation ajoutée', 'success');
        this.hideForm();
        this.render();
    },

    delete(id) {
        if (confirm('Supprimer cette prestation ?')) {
            Storage.deleteService(id);
            this.render();
        }
    },

    hideForm() {
        const container = document.getElementById('service-form-container');
        container.innerHTML = '';
    }
};

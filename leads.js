// QuickPrice Pro - Leads Module (Radar à Prospects)

const Leads = {
    render() {
        const container = document.getElementById('leads-content');
        if (!container) return;

        const leads = Storage.getLeads();

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Radar à Prospects</h1>
                    <p class="page-subtitle">Transformez vos opportunités en clients réels</p>
                </div>
                <button class="button-primary" onclick="Leads.showAddForm()">
                    <span>🎯</span> Nouveau Prospect
                </button>
            </div>

            <div id="lead-form-container"></div>

            <div class="leads-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; margin-top: 2rem;">
                ${leads.length > 0 ? leads.map(lead => this.renderLeadCard(lead)).join('') : `
                    <div class="empty-state" style="grid-column: 1 / -1;">
                        <div class="empty-icon">🔭</div>
                        <h3>Aucun prospect pour le moment</h3>
                        <p>Ne laissez aucune opportunité s'échapper. Ajoutez votre premier contact.</p>
                        <button class="button-secondary" onclick="Leads.showAddForm()">Ajouter un prospect</button>
                    </div>
                `}
            </div>
        `;
    },

    renderLeadCard(lead) {
        const statusColors = {
            cold: '#60a5fa', // Blue
            warm: '#fbbf24', // Amber
            won: '#10b981'   // Emerald
        };

        const statusLabels = {
            cold: '❄️ Froid',
            warm: '🔥 Chaud',
            won: '✅ Client'
        };

        return `
            <div class="lead-card glass" style="padding: 1.5rem; border-radius: 16px; border: 1px solid var(--border-color); background: var(--bg-card); position: relative;">
                <div class="lead-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                    <div>
                        <h3 style="margin: 0; font-size: 1.1rem; color: var(--text-primary);">${this.escapeHtml(lead.name)}</h3>
                        <p style="margin: 0.2rem 0 0; font-size: 0.85rem; color: var(--text-muted);">${this.escapeHtml(lead.activity || 'Activité non spécifiée')}</p>
                    </div>
                    <span class="status-tag" style="background: ${statusColors[lead.status]}20; color: ${statusColors[lead.status]}; padding: 4px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 600;">
                        ${statusLabels[lead.status]}
                    </span>
                </div>
                
                <div class="lead-info" style="margin-bottom: 1.5rem; font-size: 0.9rem; color: var(--text-secondary); line-height: 1.4;">
                    <div>📧 ${this.escapeHtml(lead.email || '-')}</div>
                    <div>📞 ${this.escapeHtml(lead.phone || '-')}</div>
                </div>

                <div class="lead-actions" style="display: flex; gap: 0.5rem; border-top: 1px solid var(--border-color); padding-top: 1rem;">
                    ${lead.status !== 'cold' ? `<button class="btn-icon" onclick="Leads.updateStatus('${lead.id}', 'cold')" title="Passer en Froid">❄️</button>` : ''}
                    ${lead.status !== 'warm' ? `<button class="btn-icon" onclick="Leads.updateStatus('${lead.id}', 'warm')" title="Passer en Chaud">🔥</button>` : ''}
                    ${lead.status !== 'won' ? `<button class="btn-icon" onclick="Leads.convertToClient('${lead.id}')" title="Convertir en Client">✅</button>` : ''}
                    <button class="btn-icon btn-danger" style="margin-left: auto;" onclick="Leads.delete('${lead.id}')" title="Supprimer">🗑️</button>
                </div>
            </div>
        `;
    },

    showAddForm() {
        const container = document.getElementById('lead-form-container');
        container.innerHTML = `
            <div class="form-card" style="margin-bottom: 2rem; animation: slideDown 0.3s ease;">
                <div class="form-header">
                    <h3>Nouveau Prospect</h3>
                    <button class="btn-close" onclick="Leads.hideForm()">✕</button>
                </div>
                <form onsubmit="Leads.save(event)">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Nom / Entreprise *</label>
                            <input type="text" name="name" class="form-input" required placeholder="Ex: Jean Dupont">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Activité</label>
                            <input type="text" name="activity" class="form-input" placeholder="Ex: Boulangerie, Startup...">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Email</label>
                            <input type="email" name="email" class="form-input" placeholder="Ex: contact@email.com">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Téléphone</label>
                            <input type="tel" name="phone" class="form-input" placeholder="Ex: 06 00 00 00 00">
                        </div>
                    </div>
                    <div class="form-actions">
                        <button type="button" class="button-secondary" onclick="Leads.hideForm()">Annuler</button>
                        <button type="submit" class="button-primary">Suivre ce prospect</button>
                    </div>
                </form>
            </div>
        `;
        container.scrollIntoView({ behavior: 'smooth' });
    },

    save(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const leadData = {
            name: formData.get('name'),
            activity: formData.get('activity'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            status: 'cold'
        };

        Storage.addLead(leadData);
        App.showNotification('✅ Prospect ajouté au radar', 'success');
        this.hideForm();
        this.render();
    },

    updateStatus(id, newStatus) {
        Storage.updateLead(id, { status: newStatus });
        App.showNotification(`🚀 Statut mis à jour`, 'success');
        this.render();
    },

    convertToClient(id) {
        if (!confirm('Convertir ce prospect en client ? Ses informations seront transférées dans le module Clients.')) return;

        const lead = Storage.getLeads().find(l => l.id === id);
        if (lead) {
            // Add to clients
            Storage.addClient({
                name: lead.name,
                email: lead.email,
                phone: lead.phone,
                activity: lead.activity
            });

            // Delete from leads
            Storage.deleteLead(id);

            App.showNotification('🎉 Félicitations ! Nouveau client ajouté.', 'success');
            App.navigateTo('clients');
        }
    },

    delete(id) {
        if (confirm('Supprimer ce prospect ?')) {
            Storage.deleteLead(id);
            this.render();
        }
    },

    hideForm() {
        document.getElementById('lead-form-container').innerHTML = '';
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

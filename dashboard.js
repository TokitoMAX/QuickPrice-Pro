// QuickPrice Pro - Dashboard Module

const Dashboard = {
    render() {
        const container = document.getElementById('dashboard-content');
        if (!container) return;

        const stats = Storage.getStats();
        // Récupérer l'objectif (sauvegardé par le calculateur ou par défaut)
        const calculatorData = Storage.get('qp_calculator_data');
        const monthlyGoal = calculatorData ? parseFloat(calculatorData.monthlyRevenue) : 5000;

        // Calcul du progrès
        const progress = Math.min(100, Math.round((stats.monthlyRevenue / monthlyGoal) * 100));

        // Calcul du pipeline (devis envoyés)
        const quotes = Storage.getQuotes();
        const pipelineValue = quotes
            .filter(q => q.status === 'sent')
            .reduce((sum, q) => sum + (q.total || 0), 0);

        const recentQuotes = Storage.getQuotes()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        const recentInvoices = Storage.getInvoices()
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, 5);

        container.innerHTML = `
            <div class="dashboard-header">
                <h1 class="page-title">Tableau de Bord</h1>
                <p class="page-subtitle">Vue d'ensemble de votre activité</p>
            </div>

            <div class="stats-grid" style="grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
                <!-- Goal Card with Ring -->
                <div class="goal-card">
                    <div class="goal-info">
                        <h3>Objectif Mensuel</h3>
                        <div class="goal-current">${App.formatCurrency(stats.monthlyRevenue)}</div>
                        <div class="goal-target">sur ${App.formatCurrency(monthlyGoal)}</div>
                    </div>
                    <div class="goal-ring-container">
                        <div class="progress-ring" style="--progress: ${progress}%">
                            <span class="progress-text">${progress}%</span>
                        </div>
                    </div>
                </div>

                <!-- Pipeline Card -->
                <div class="stat-card pipeline-card">
                    <div class="stat-header">
                        <span class="stat-label">Pipeline (Devis en cours)</span>
                    </div>
                    <div class="stat-value pipeline-value">${App.formatCurrency(pipelineValue)}</div>
                    <div class="stat-description">${quotes.filter(q => q.status === 'sent').length} devis en attente</div>
                </div>

                <div class="stat-card">
                    <div class="stat-header">
                        <span class="stat-label">Portefeuille Clients</span>
                    </div>
                    <div class="stat-value">${stats.totalClients}</div>
                    <div class="stat-description">Base client</div>
                </div>

                <div class="stat-card ${stats.unpaidCount > 0 ? 'warning' : ''}">
                    <div class="stat-header">
                        <span class="stat-label">Factures en attente</span>
                    </div>
                    <div class="stat-value" style="color: ${stats.unpaidCount > 0 ? 'var(--warning)' : ''}">${App.formatCurrency(stats.unpaidAmount)}</div>
                    <div class="stat-description">${stats.unpaidCount} facture(s)</div>
                </div>
            </div>

            <div class="dashboard-sections">
                <div class="dashboard-section">
                    <div class="section-header-inline">
                        <h2 class="section-title-small">Derniers Devis</h2>
                        <a href="#" data-nav="quotes" class="link-button">Voir tout →</a>
                    </div>
                    
                    ${recentQuotes.length > 0 ? `
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Numéro</th>
                                        <th>Client</th>
                                        <th>Montant</th>
                                        <th>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${recentQuotes.map(quote => {
            const client = Storage.getClient(quote.clientId);
            return `
                                            <tr>
                                                <td><strong>${quote.number}</strong></td>
                                                <td>${client?.name || 'Client supprimé'}</td>
                                                <td>${App.formatCurrency(quote.total)}</td>
                                                <td><span class="status-badge status-${quote.status}">${this.getStatusLabel(quote.status)}</span></td>
                                            </tr>
                                        `;
        }).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="empty-state">
                            <p>Aucun devis enregistré</p>
                            <button class="button-primary" onclick="App.navigateTo('quotes');">Créer mon premier devis</button>
                        </div>
                    `}
                </div>

                <div class="dashboard-section">
                    <div class="section-header-inline">
                        <h2 class="section-title-small">Dernières Factures</h2>
                        <a href="#" data-nav="invoices" class="link-button">Voir tout →</a>
                    </div>
                    
                    ${recentInvoices.length > 0 ? `
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Numéro</th>
                                        <th>Client</th>
                                        <th>Montant</th>
                                        <th>Statut</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${recentInvoices.map(invoice => {
            const client = Storage.getClient(invoice.clientId);
            return `
                                            <tr>
                                                <td><strong>${invoice.number}</strong></td>
                                                <td>${client?.name || 'Client supprimé'}</td>
                                                <td>${App.formatCurrency(invoice.total)}</td>
                                                <td><span class="status-badge status-${invoice.status}">${this.getStatusLabel(invoice.status)}</span></td>
                                            </tr>
                                        `;
        }).join('')}
                                </tbody>
                            </table>
                        </div>
                    ` : `
                        <div class="empty-state">
                            <p>Aucune facture enregistrée</p>
                            <button class="button-primary" onclick="App.navigateTo('quotes');">Gérer mes factures</button>
                        </div>
                    `}
                </div>

                <div class="dashboard-section">
                    <h2 class="section-title-small">Actions Rapides</h2>
                    <div class="quick-actions">
                        <button class="action-card" onclick="App.navigateTo('clients'); if(typeof Clients !== 'undefined') Clients.showAddForm();">
                            <span class="action-label">Nouveau Client</span>
                        </button>
                        <button class="action-card" onclick="App.navigateTo('quotes'); if(typeof Quotes !== 'undefined') Quotes.showAddForm();">
                            <span class="action-label">Nouveau Devis</span>
                        </button>
                        <button class="action-card" onclick="App.navigateTo('invoices');">
                            <span class="action-label">Gérer Factures</span>
                        </button>
                        <button class="action-card" onclick="App.navigateTo('settings')">
                            <span class="action-label">Paramètres</span>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Réactiver les event listeners si besoin (géré par App)
    },

    getStatusLabel(status) {
        const labels = {
            draft: 'Brouillon',
            sent: 'Envoyée',
            paid: 'Payée',
            overdue: 'En retard',
            accepted: 'Accepté',
            refused: 'Refusé'
        };
        return labels[status] || status;
    }
};

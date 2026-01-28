// QuickPrice Pro - Quotes Module

const Quotes = {
    editingId: null,
    currentItems: [],

    render() {
        const container = document.getElementById('quotes-content');
        if (!container) return;

        const quotes = Storage.getQuotes();
        const limits = App.checkFreemiumLimits();

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Devis</h1>
                    <p class="page-subtitle">${quotes.length} devis ${!limits.canAddQuote ? `(limite: ${limits.maxQuotes})` : ''}</p>
                </div>
                <button class="button-primary" onclick="Quotes.showAddForm()" ${!limits.canAddQuote ? 'disabled' : ''}>
                    <span>➕</span> Nouveau Devis
                </button>
            </div>

            <div id="quote-form-container"></div>

            ${quotes.length > 0 ? `
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Numéro</th>
                                <th>Client</th>
                                <th>Date</th>
                                <th>Montant TTC</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${quotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(quote => {
            const client = Storage.getClient(quote.clientId);
            return `
                                    <tr>
                                        <td><strong>${quote.number}</strong></td>
                                        <td>${client?.name || 'Client supprimé'}</td>
                                        <td>${App.formatDate(quote.createdAt)}</td>
                                        <td>${App.formatCurrency(quote.total)}</td>
                                        <td><span class="status-badge status-${quote.status}">${this.getStatusLabel(quote.status)}</span></td>
                                        <td>
                                            <div class="action-buttons">
                                                <button class="btn-icon" onclick="Quotes.changeStatus('${quote.id}')" title="Changer statut">
                                                    🔄
                                                </button>
                                                ${quote.status === 'accepted' ? `
                                                    <button class="btn-icon btn-success" onclick="Quotes.convertToInvoice('${quote.id}')" title="Convertir en facture">
                                                        🧾
                                                    </button>
                                                ` : ''}
                                                <button class="btn-icon" onclick="Quotes.downloadPDF('${quote.id}')" title="PDF">
                                                    📄
                                                </button>
                                                <button class="btn-icon btn-danger" onclick="Quotes.delete('${quote.id}')" title="Supprimer">
                                                    🗑️
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
        }).join('')}
                        </tbody>
                    </table>
                </div>
            ` : `
                <div class="empty-state">
                    <div class="empty-icon">📋</div>
                    <p>Aucun devis pour le moment</p>
                    <button class="button-primary" onclick="Quotes.showAddForm()">Créer mon premier devis</button>
                </div>
            `}
        `;
    },

    showAddForm() {
        const limits = App.checkFreemiumLimits();
        if (!limits.canAddQuote) {
            App.showUpgradeModal('limit');
            return;
        }

        const clients = Storage.getClients();
        if (clients.length === 0) {
            App.showNotification('⚠️ Veuillez d\'abord créer un client', 'error');
            App.navigateTo('clients');
            return;
        }

        this.editingId = null;

        // Check for draft items (array) from scoper
        const draftItems = Storage.get('qp_draft_quote_items');
        // Check for single draft item from calculator (legacy or simple)
        const draftItem = Storage.get('qp_draft_quote_item');

        if (draftItems && Array.isArray(draftItems) && draftItems.length > 0) {
            this.currentItems = draftItems;
            Storage.set('qp_draft_quote_items', null);
            App.showNotification('✅ Estimation importée avec succès !', 'success');
        } else if (draftItem) {
            this.currentItems = [draftItem];
            Storage.set('qp_draft_quote_item', null);
            App.showNotification('✅ Tarif importé depuis le calculateur !', 'success');
        } else {
            this.currentItems = [{ description: '', quantity: 1, unitPrice: 0 }];
        }

        const container = document.getElementById('quote-form-container');
        container.innerHTML = this.renderForm(clients);
        container.scrollIntoView({ behavior: 'smooth' });
    },

    renderForm(clients, quote = null) {
        const settings = Storage.get(Storage.KEYS.SETTINGS);
        const items = quote ? quote.items : this.currentItems;

        return `
            <div class="form-card">
                <div class="form-header">
                    <h3>${quote ? 'Modifier le Devis' : 'Nouveau Devis'}</h3>
                    <button class="btn-close" onclick="Quotes.hideForm()">✕</button>
                </div>
                <form id="quote-form" onsubmit="Quotes.save(event)">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Client *</label>
                            <select name="clientId" class="form-input" required>
                                <option value="">Sélectionner un client</option>
                                ${clients.map(c => `
                                    <option value="${c.id}" ${quote?.clientId === c.id ? 'selected' : ''}>
                                        ${c.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Statut</label>
                            <select name="status" class="form-input">
                                <option value="draft" ${quote?.status === 'draft' ? 'selected' : ''}>Brouillon</option>
                                <option value="sent" ${quote?.status === 'sent' ? 'selected' : ''}>Envoyé</option>
                                <option value="accepted" ${quote?.status === 'accepted' ? 'selected' : ''}>Accepté</option>
                                <option value="refused" ${quote?.status === 'refused' ? 'selected' : ''}>Refusé</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-section">
                        <div class="section-header-inline">
                            <h4>Lignes du devis</h4>
                            <button type="button" class="button-secondary" onclick="Quotes.addItem()">
                                ➕ Ajouter une ligne
                            </button>
                        </div>

                        <div id="items-container">
                            ${items.map((item, index) => this.renderItemRow(item, index)).join('')}
                        </div>

                        <div class="invoice-totals">
                            <div class="total-row">
                                <span>Sous-total HT :</span>
                                <span id="subtotal-display">0€</span>
                            </div>
                            <div class="total-row">
                                <span>TVA (${settings.taxRate}%) :</span>
                                <span id="tax-display">0€</span>
                            </div>
                            <div class="total-row total">
                                <span>Total TTC :</span>
                                <span id="total-display">0€</span>
                            </div>
                        </div>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="button-secondary" onclick="Quotes.hideForm()">Annuler</button>
                        <button type="submit" class="button-primary">Enregistrer</button>
                    </div>
                </form>
            </div>
        `;
    },

    renderItemRow(item, index) {
        return `
            <div class="item-row" data-index="${index}">
                <div class="item-field item-description">
                    <input type="text" 
                           name="items[${index}][description]" 
                           placeholder="Description" 
                           class="form-input" 
                           value="${item.description || ''}"
                           onchange="Quotes.updateTotals()"
                           required>
                </div>
                <div class="item-field item-quantity">
                    <input type="number" 
                           name="items[${index}][quantity]" 
                           placeholder="Qté" 
                           class="form-input" 
                           value="${item.quantity || 1}"
                           min="0.01"
                           step="0.01"
                           onchange="Quotes.updateTotals()"
                           required>
                </div>
                <div class="item-field item-price">
                    <input type="number" 
                           name="items[${index}][unitPrice]" 
                           placeholder="Prix unitaire" 
                           class="form-input" 
                           value="${item.unitPrice || 0}"
                           min="0"
                           step="0.01"
                           onchange="Quotes.updateTotals()"
                           required>
                </div>
                <div class="item-field item-total">
                    <span class="item-total-display">${App.formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}</span>
                </div>
                <div class="item-field item-actions">
                    <button type="button" class="btn-icon btn-danger" onclick="Quotes.removeItem(${index})">
                        🗑️
                    </button>
                </div>
            </div>
        `;
    },

    addItem() {
        this.currentItems.push({ description: '', quantity: 1, unitPrice: 0 });
        const container = document.getElementById('items-container');
        container.insertAdjacentHTML('beforeend',
            this.renderItemRow({ description: '', quantity: 1, unitPrice: 0 }, this.currentItems.length - 1)
        );
        this.updateTotals();
    },

    removeItem(index) {
        if (this.currentItems.length <= 1) {
            App.showNotification('⚠️ Un devis doit avoir au moins une ligne', 'error');
            return;
        }
        this.currentItems.splice(index, 1);
        document.querySelector(`.item-row[data-index="${index}"]`).remove();
        this.updateTotals();
    },

    updateTotals() {
        const form = document.getElementById('quote-form');
        if (!form) return;

        const settings = Storage.get(Storage.KEYS.SETTINGS);
        let subtotal = 0;

        form.querySelectorAll('.item-row').forEach(row => {
            const qty = parseFloat(row.querySelector('[name*="[quantity]"]')?.value) || 0;
            const price = parseFloat(row.querySelector('[name*="[unitPrice]"]')?.value) || 0;
            const itemTotal = qty * price;

            const display = row.querySelector('.item-total-display');
            if (display) display.textContent = App.formatCurrency(itemTotal);

            subtotal += itemTotal;
        });

        const tax = subtotal * (settings.taxRate / 100);
        const total = subtotal + tax;

        document.getElementById('subtotal-display').textContent = App.formatCurrency(subtotal);
        document.getElementById('tax-display').textContent = App.formatCurrency(tax);
        document.getElementById('total-display').textContent = App.formatCurrency(total);
    },

    save(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const items = [];
        form.querySelectorAll('.item-row').forEach((row, index) => {
            const description = formData.get(`items[${index}][description]`);
            const quantity = parseFloat(formData.get(`items[${index}][quantity]`));
            const unitPrice = parseFloat(formData.get(`items[${index}][unitPrice]`));

            if (description && quantity && unitPrice >= 0) {
                items.push({ description, quantity, unitPrice });
            }
        });

        if (items.length === 0) {
            App.showNotification('⚠️ Ajoutez au moins une ligne au devis', 'error');
            return;
        }

        const settings = Storage.get(Storage.KEYS.SETTINGS);
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const tax = subtotal * (settings.taxRate / 100);
        const total = subtotal + tax;

        const quoteData = {
            clientId: formData.get('clientId'),
            status: formData.get('status'),
            items: items,
            subtotal: subtotal,
            tax: tax,
            total: total
        };

        if (this.editingId) {
            Storage.updateQuote(this.editingId, quoteData);
            App.showNotification('✅ Devis modifié avec succès', 'success');
        } else {
            Storage.addQuote(quoteData);
            App.showNotification('✅ Devis créé avec succès', 'success');
        }

        this.hideForm();
        this.render();
    },

    // Convertir un devis en facture
    convertToInvoice(id) {
        const quote = Storage.getQuote(id);
        if (!quote) return;

        if (confirm('Voulez-vous convertir ce devis en facture ?')) {
            // Créer la facture basée sur le devis
            const invoiceData = {
                clientId: quote.clientId,
                status: 'draft',
                items: quote.items,
                subtotal: quote.subtotal,
                tax: quote.tax,
                total: quote.total,
                dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // J+30
            };

            const newInvoice = Storage.addInvoice(invoiceData);

            App.showNotification('🎉 Devis converti en facture !', 'success');
            App.navigateTo('invoices');

            // Optionnel: proposer d'éditer la facture tout de suite
            // Invoices.showAddForm(newInvoice); // Nécessiterait modification de invoice.js
        }
    },

    changeStatus(id) {
        const quote = Storage.getQuote(id);
        if (!quote) return;

        const statuses = [
            { value: 'draft', label: 'Brouillon' },
            { value: 'sent', label: 'Envoyé' },
            { value: 'accepted', label: 'Accepté' },
            { value: 'refused', label: 'Refusé' }
        ];

        const currentIndex = statuses.findIndex(s => s.value === quote.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        const nextStatus = statuses[nextIndex].value;

        Storage.updateQuote(id, { status: nextStatus });
        App.showNotification(`✅ Statut changé: ${statuses[nextIndex].label}`, 'success');
        this.render();
    },

    downloadPDF(id) {
        const isPro = Storage.isPro();
        if (!isPro) {
            App.showUpgradeModal('pdf');
            return;
        }

        const user = Storage.getUser();
        if (!user.company.name || !user.company.address) {
            if (confirm('⚠️ Vos informations entreprise sont incomplètes.\n\nVoulez-vous les remplir maintenant pour qu\'elles apparaissent sur le devis ?')) {
                App.navigateTo('settings');
            }
            return;
        }

        const quote = Storage.getQuote(id);
        const client = Storage.getClient(quote.clientId);

        if (typeof PDFGenerator !== 'undefined' && PDFGenerator.generateQuote) {
            PDFGenerator.generateQuote(quote, client, user);
        } else {
            // Fallback si la méthode n'existe pas encore
            App.showNotification('⚠️ Génération PDF de devis bientôt disponible', 'info');
        }
    },

    delete(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce devis ?')) {
            Storage.deleteQuote(id);
            App.showNotification('✅ Devis supprimé', 'success');
            this.render();
        }
    },

    hideForm() {
        const container = document.getElementById('quote-form-container');
        container.innerHTML = '';
        this.editingId = null;
        this.currentItems = [];
    },

    getStatusLabel(status) {
        const labels = {
            draft: 'Brouillon',
            sent: 'Envoyé',
            accepted: 'Accepté',
            refused: 'Refusé'
        };
        return labels[status] || status;
    }
};

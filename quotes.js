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
                    Nouveau Devis
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
                                                <button class="btn-icon ${quote.status === 'accepted' ? 'btn-success' : ''}" 
                                                        onclick="Quotes.convertToInvoice('${quote.id}')" 
                                                        title="${quote.status === 'accepted' ? 'Convertir en facture' : 'Valider et Facturer'}">
                                                    
                                                </button>
                                                <button class="btn-icon" onclick="Quotes.duplicate('${quote.id}')" title="Dupliquer">
                                                    
                                                </button>
                                                <button class="btn-icon" onclick="Quotes.downloadPDF('${quote.id}')" title="PDF">
                                                    
                                                </button>
                                                <button class="btn-icon btn-danger" onclick="Quotes.delete('${quote.id}')" title="Supprimer">
                                                    
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
                    <p>Aucun devis enregistré</p>
                    <button class="button-primary" onclick="Quotes.showAddForm()">Créer mon premier devis</button>
                </div>
            `}
        `;
    },

    duplicate(id) {
        const quote = Storage.getQuote(id);
        if (!quote) return;

        if (confirm('Voulez-vous dupliquer ce devis (créer une copie) ?')) {
            const newQuoteData = {
                clientId: quote.clientId,
                status: 'draft',
                items: JSON.parse(JSON.stringify(quote.items)), // Deep copy
                subtotal: quote.subtotal,
                tax: quote.tax,
                total: quote.total
            };

            Storage.addQuote(newQuoteData);
            App.showNotification('Devis dupliqué.', 'success');
            this.render();
        }
    },

    showAddForm(preselectedClientId = null) {
        const limits = App.checkFreemiumLimits();
        if (!limits.canAddQuote) {
            App.showUpgradeModal('limit');
            return;
        }

        const clients = Storage.getClients();
        // Removed the check "if clients.length === 0 return" to allow adding first client via Quick Add inside form

        this.editingId = null;

        // Check for draft items (array) from scoper
        const draftItems = Storage.get('qp_draft_quote_items');
        // Check for single draft item from calculator (legacy or simple)
        const draftItem = Storage.get('qp_draft_quote_item');

        if (draftItems && Array.isArray(draftItems) && draftItems.length > 0) {
            this.currentItems = draftItems;
            Storage.set('qp_draft_quote_items', null);
            App.showNotification('Estimation importée avec succès !', 'success');
        } else if (draftItem) {
            this.currentItems = [draftItem];
            Storage.set('qp_draft_quote_item', null);
            App.showNotification('Tarif importé depuis le calculateur !', 'success');
        } else {
            this.currentItems = [{ description: '', quantity: 1, unitPrice: 0 }];
        }

        const container = document.getElementById('quote-form-container');
        container.innerHTML = this.renderForm(clients, null, preselectedClientId);
        container.scrollIntoView({ behavior: 'smooth' });
    },

    renderForm(clients, quote = null, preselectedClientId = null) {
        const settings = Storage.get(Storage.KEYS.SETTINGS);
        const items = quote ? quote.items : this.currentItems;
        const services = Storage.getServices(); // Fetch services

        return `
            <div class="form-card">
                <datalist id="quote-services-list">
                    ${services.map(s => `<option value="${s.label}">${App.formatCurrency(s.unitPrice)}</option>`).join('')}
                </datalist>

                <div class="form-header">
                    <h3>${quote ? 'Modifier le Devis' : 'Nouveau Devis'}</h3>
                    <button class="btn-close" onclick="Quotes.hideForm()">✕</button>
                </div>
                <form id="quote-form" onsubmit="Quotes.save(event)">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Client *</label>
                            <div style="display: flex; gap: 10px;">
                                <select name="clientId" id="quote-client-select" class="form-input" required style="flex: 1;">
                                    <option value="">Sélectionner un client</option>
                                    ${clients.map(c => `
                                        <option value="${c.id}" ${(quote?.clientId === c.id || preselectedClientId === c.id) ? 'selected' : ''}>
                                            ${c.name}
                                        </option>
                                    `).join('')}
                                </select>
                                <button type="button" class="button-secondary" onclick="Quotes.openQuickClientAdd()">
                                    Nouveau
                                </button>
                            </div>
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
                                Ajouter une ligne
                            </button>
                        </div>

                        <div id="items-container">
                            ${items.map((item, index) => this.renderItemRow(item, index)).join('')}
                        </div>

                        <div id="margin-guard-container" style="margin-top: 1.5rem;"></div>

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
                           placeholder="Description (ou choisir dans la liste)" 
                           class="form-input" 
                           list="quote-services-list"
                           value="${item.description || ''}"
                           oninput="Quotes.handleServiceSelect(this, ${index})"
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
                        Supprimer
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
            App.showNotification('Un devis doit avoir au moins une ligne.', 'error');
            return;
        }
        this.currentItems.splice(index, 1);
        document.querySelector(`.item-row[data-index="${index}"]`).remove();
        this.updateTotals();
    },

    handleServiceSelect(input, index) {
        const val = input.value;
        const services = Storage.getServices();
        const found = services.find(s => s.label === val);

        if (found) {
            const row = document.querySelector(`.item-row[data-index="${index}"]`);
            if (row) {
                const priceInput = row.querySelector('[name*="[unitPrice]"]');
                if (priceInput) {
                    priceInput.value = found.unitPrice;
                    this.updateTotals();
                }
            }
        }
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

        this.renderMarginGuard(subtotal);
    },

    renderMarginGuard(subtotal) {
        const container = document.getElementById('margin-guard-container');
        if (!container) return;

        const calcData = Storage.get('qp_calculator_data') || { dailyRate: 400 };
        const targetTJM = calcData.dailyRate || 400;

        const health = Math.min(100, (subtotal / targetTJM) * 100);
        let color = '#ef4444'; // Red
        let label = 'Rentabilité critique';

        if (health > 80) { color = '#10b981'; label = 'Seuil de rentabilité atteint'; }
        else if (health > 50) { color = '#fbbf24'; label = 'Vigilance rentabilité'; }

        container.innerHTML = `
            <div style="background: var(--bg-card); padding: 1rem; border-radius: 12px; border: 1px solid var(--border-color);">
                <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.85rem; font-weight: 600;">
                    <span style="color: var(--text-secondary);">Analyse de Rentabilité</span>
                    <span style="color: ${color};">${label}</span>
                </div>
                <div style="height: 8px; background: var(--border-color); border-radius: 4px; overflow: hidden;">
                    <div style="width: ${health}%; height: 100%; background: ${color}; transition: width 0.3s ease;"></div>
                </div>
                <p style="font-size: 0.75rem; color: var(--text-muted); margin-top: 0.5rem;">Basé sur votre TJM cible de ${App.formatCurrency(targetTJM)}.</p>
            </div>
        `;
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
            App.showNotification('Veuillez ajouter au moins une ligne.', 'error');
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
            App.showNotification('Devis modifié.', 'success');
        } else {
            Storage.addQuote(quoteData);
            App.showNotification('Devis créé.', 'success');
        }

        this.hideForm();
        this.render();
    },

    // Convertir un devis en facture
    convertToInvoice(id) {
        const quote = Storage.getQuote(id);
        if (!quote) return;

        if (quote.status !== 'accepted') {
            if (!confirm('Le devis n\'est pas encore marqué comme accepté. Souhaitez-vous tout de même générer la facture ?')) {
                return;
            }
            Storage.updateQuote(id, { status: 'accepted' });
        } else {
            if (!confirm('Voulez-vous convertir ce devis en facture ?')) {
                return;
            }
        }

        const invoiceData = {
            clientId: quote.clientId,
            status: 'draft',
            items: quote.items,
            subtotal: quote.subtotal,
            tax: quote.tax,
            total: quote.total,
            dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        };

        Storage.addInvoice(invoiceData);
        App.showNotification('Facture générée avec succès.', 'success');
        App.navigateTo('invoices');
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
        App.showNotification(`Statut mis à jour : ${statuses[nextIndex].label}`, 'success');
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
            if (confirm('Vos informations entreprise sont incomplètes. Souhaitez-vous les compléter maintenant ?')) {
                App.navigateTo('settings');
            }
            return;
        }

        const quote = Storage.getQuote(id);
        const client = Storage.getClient(quote.clientId);

        if (typeof PDFGenerator !== 'undefined' && PDFGenerator.generateQuote) {
            PDFGenerator.generateQuote(quote, client, user);
        } else {
            App.showNotification('Module PDF indisponible pour le moment.', 'info');
        }
    },

    delete(id) {
        if (confirm('Confirmer la suppression de ce devis ?')) {
            Storage.deleteQuote(id);
            App.showNotification('Devis supprimé.', 'success');
            this.render();
        }
    },

    hideForm() {
        const container = document.getElementById('quote-form-container');
        if (container) container.innerHTML = '';
        this.editingId = null;
        this.currentItems = [];
    },

    openQuickClientAdd() {
        if (typeof Clients !== 'undefined') {
            Clients.openQuickAdd((newClient) => {
                const select = document.getElementById('quote-client-select');
                if (select) {
                    const option = document.createElement('option');
                    option.value = newClient.id;
                    option.text = newClient.name;
                    option.selected = true;
                    select.add(option);
                    select.value = newClient.id;
                }
            });
        }
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

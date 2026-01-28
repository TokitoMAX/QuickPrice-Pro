// QuickPrice Pro - Invoices Module

const Invoices = {
    editingId: null,
    currentItems: [],

    render() {
        const container = document.getElementById('invoices-content');
        if (!container) return;

        const invoices = Storage.getInvoices();
        const limits = App.checkFreemiumLimits();

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Factures</h1>
                    <p class="page-subtitle">${invoices.length} facture(s) ${!limits.canAddInvoice ? `(limite: ${limits.maxInvoices})` : ''}</p>
                </div>
                <button class="button-primary" onclick="Invoices.showAddForm()" ${!limits.canAddInvoice ? 'disabled' : ''}>
                    <span>➕</span> Nouvelle Facture
                </button>
            </div>

            <div id="invoice-form-container"></div>

            ${invoices.length > 0 ? `
                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Numéro</th>
                                <th>Client</th>
                                <th>Date</th>
                                <th>Échéance</th>
                                <th>Montant HT</th>
                                <th>Montant TTC</th>
                                <th>Statut</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${invoices.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(invoice => {
            const client = Storage.getClient(invoice.clientId);
            const subtotal = invoice.items.reduce((sum, item) =>
                sum + (item.quantity * item.unitPrice), 0
            );
            return `
                                    <tr>
                                        <td><strong>${invoice.number}</strong></td>
                                        <td>${client?.name || 'Client supprimé'}</td>
                                        <td>${App.formatDate(invoice.createdAt)}</td>
                                        <td>${invoice.dueDate ? App.formatDate(invoice.dueDate) : '-'}</td>
                                        <td>${App.formatCurrency(subtotal)}</td>
                                        <td>${App.formatCurrency(invoice.total)}</td>
                                        <td><span class="status-badge status-${invoice.status}">${this.getStatusLabel(invoice.status)}</span></td>
                                        <td>
                                            <div class="action-buttons">
                                                <button class="btn-icon" onclick="Invoices.changeStatus('${invoice.id}')" title="Changer statut">
                                                    🔄
                                                </button>
                                                <button class="btn-icon" onclick="Invoices.downloadPDF('${invoice.id}')" title="PDF">
                                                    📄
                                                </button>
                                                <button class="btn-icon btn-danger" onclick="Invoices.delete('${invoice.id}')" title="Supprimer">
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
                    <div class="empty-icon">🧾</div>
                    <p>Aucune facture pour le moment</p>
                    <button class="button-primary" onclick="Invoices.showAddForm()">Créer ma première facture</button>
                </div>
            `}
        `;
    },

    showAddForm() {
        const limits = App.checkFreemiumLimits();
        if (!limits.canAddInvoice) {
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
        this.currentItems = [{ description: '', quantity: 1, unitPrice: 0 }];

        const container = document.getElementById('invoice-form-container');
        container.innerHTML = this.renderForm(clients);
        container.scrollIntoView({ behavior: 'smooth' });
    },

    renderForm(clients, invoice = null) {
        const settings = Storage.get(Storage.KEYS.SETTINGS);
        const items = invoice ? invoice.items : this.currentItems;

        // Calcul du due date par défaut (30 jours)
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 30);
        const dueDateStr = defaultDueDate.toISOString().split('T')[0];

        return `
            <div class="form-card">
                <div class="form-header">
                    <h3>${invoice ? 'Modifier la Facture' : 'Nouvelle Facture'}</h3>
                    <button class="btn-close" onclick="Invoices.hideForm()">✕</button>
                </div>
                <form id="invoice-form" onsubmit="Invoices.save(event)">
                    <div class="form-grid">
                        <div class="form-group">
                            <label class="form-label">Client *</label>
                            <select name="clientId" class="form-input" required>
                                <option value="">Sélectionner un client</option>
                                ${clients.map(c => `
                                    <option value="${c.id}" ${invoice?.clientId === c.id ? 'selected' : ''}>
                                        ${c.name}
                                    </option>
                                `).join('')}
                            </select>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Date d'échéance</label>
                            <input type="date" name="dueDate" class="form-input" 
                                   value="${invoice?.dueDate ? invoice.dueDate.split('T')[0] : dueDateStr}">
                        </div>

                        <div class="form-group">
                            <label class="form-label">Statut</label>
                            <select name="status" class="form-input">
                                <option value="draft" ${invoice?.status === 'draft' ? 'selected' : ''}>Brouillon</option>
                                <option value="sent" ${invoice?.status === 'sent' ? 'selected' : ''}>Envoyée</option>
                                <option value="paid" ${invoice?.status === 'paid' ? 'selected' : ''}>Payée</option>
                                <option value="overdue" ${invoice?.status === 'overdue' ? 'selected' : ''}>En retard</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-section">
                        <div class="section-header-inline">
                            <h4>Lignes de facturation</h4>
                            <button type="button" class="button-secondary" onclick="Invoices.addItem()">
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
                        <button type="button" class="button-secondary" onclick="Invoices.hideForm()">Annuler</button>
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
                           onchange="Invoices.updateTotals()"
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
                           onchange="Invoices.updateTotals()"
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
                           onchange="Invoices.updateTotals()"
                           required>
                </div>
                <div class="item-field item-total">
                    <span class="item-total-display">${App.formatCurrency((item.quantity || 0) * (item.unitPrice || 0))}</span>
                </div>
                <div class="item-field item-actions">
                    <button type="button" class="btn-icon btn-danger" onclick="Invoices.removeItem(${index})">
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
            App.showNotification('⚠️ Une facture doit avoir au moins une ligne', 'error');
            return;
        }
        this.currentItems.splice(index, 1);
        document.querySelector(`.item-row[data-index="${index}"]`).remove();
        this.updateTotals();
    },

    updateTotals() {
        const form = document.getElementById('invoice-form');
        if (!form) return;

        const settings = Storage.get(Storage.KEYS.SETTINGS);
        let subtotal = 0;

        // Calculer à partir des inputs actuels
        form.querySelectorAll('.item-row').forEach(row => {
            const qty = parseFloat(row.querySelector('[name*="[quantity]"]')?.value) || 0;
            const price = parseFloat(row.querySelector('[name*="[unitPrice]"]')?.value) || 0;
            const itemTotal = qty * price;

            // Mettre à jour l'affichage du total de ligne
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

        // Extraire les items
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
            App.showNotification('⚠️ Ajoutez au moins une ligne à la facture', 'error');
            return;
        }

        const settings = Storage.get(Storage.KEYS.SETTINGS);
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        const tax = subtotal * (settings.taxRate / 100);
        const total = subtotal + tax;

        const invoiceData = {
            clientId: formData.get('clientId'),
            dueDate: formData.get('dueDate'),
            status: formData.get('status'),
            items: items,
            subtotal: subtotal,
            tax: tax,
            total: total
        };

        if (this.editingId) {
            Storage.updateInvoice(this.editingId, invoiceData);
            App.showNotification('✅ Facture modifiée avec succès', 'success');
        } else {
            Storage.addInvoice(invoiceData);
            App.showNotification('✅ Facture créée avec succès', 'success');
        }

        this.hideForm();
        this.render();
    },

    changeStatus(id) {
        const invoice = Storage.getInvoice(id);
        if (!invoice) return;

        const statuses = [
            { value: 'draft', label: 'Brouillon' },
            { value: 'sent', label: 'Envoyée' },
            { value: 'paid', label: 'Payée' },
            { value: 'overdue', label: 'En retard' }
        ];

        const currentIndex = statuses.findIndex(s => s.value === invoice.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        const nextStatus = statuses[nextIndex].value;

        Storage.updateInvoice(id, { status: nextStatus });
        App.showNotification(`✅ Statut changé: ${statuses[nextIndex].label}`, 'success');
        this.render();
    },

    downloadPDF(id) {
        const isPro = Storage.isPro();
        if (!isPro) {
            App.showUpgradeModal('pdf');
            return;
        }

        const invoice = Storage.getInvoice(id);
        const client = Storage.getClient(invoice.clientId);
        const user = Storage.getUser();

        // Utiliser le module PDF si disponible
        if (typeof PDFGenerator !== 'undefined') {
            PDFGenerator.generateInvoice(invoice, client, user);
        } else {
            App.showNotification('⚠️ Module PDF en cours de chargement...', 'error');
        }
    },

    delete(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette facture ?')) {
            Storage.deleteInvoice(id);
            App.showNotification('✅ Facture supprimée', 'success');
            this.render();
        }
    },

    hideForm() {
        const container = document.getElementById('invoice-form-container');
        container.innerHTML = '';
        this.editingId = null;
        this.currentItems = [];
    },

    getStatusLabel(status) {
        const labels = {
            draft: 'Brouillon',
            sent: 'Envoyée',
            paid: 'Payée',
            overdue: 'En retard'
        };
        return labels[status] || status;
    }
};

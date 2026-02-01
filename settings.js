// SoloPrice Pro - Settings Module

const Settings = {
    render(activeTabId = 'profile') {
        const container = document.getElementById('settings-content');
        if (!container) return;

        const user = Storage.getUser();
        const settings = Storage.get(Storage.KEYS.SETTINGS);

        const isPro = Storage.isPro();
        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Réglages</h1>
                <p class="page-subtitle">Configurez votre profil et vos outils de chiffrage.</p>
            </div>
 
            <div class="settings-tabs" style="display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; overflow-x: auto;">
                <button class="settings-tab ${activeTabId === 'profile' ? 'active' : ''}" onclick="Settings.switchTab('profile')">Profil & PRO</button>
                <button class="settings-tab ${activeTabId === 'tjm' ? 'active' : ''}" onclick="Settings.switchTab('tjm')">Mon TJM</button>
                <button class="settings-tab ${activeTabId === 'services' ? 'active' : ''}" onclick="Settings.switchTab('services')">Mes Services</button>
                <button class="settings-tab ${activeTabId === 'billing' ? 'active' : ''}" onclick="Settings.switchTab('billing')">Facturation & Zones</button>
                <button class="settings-tab ${activeTabId === 'data' ? 'active' : ''}" onclick="Settings.switchTab('data')">Données</button>
            </div>
 
            <div class="settings-content-wrapper">
                <!-- Tab: Profile -->
                <div id="settings-tab-profile" class="settings-tab-content ${activeTabId === 'profile' ? 'active' : ''}">
                    <div class="settings-section">
                        <h2 class="section-title-small">Licence</h2>
                        ${isPro ? `
                            <div class="pro-status-card" style="background: rgba(16, 185, 129, 0.05); border: 1px solid var(--primary); padding: 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 1.5rem;">
                                <div class="pro-icon" style="font-size: 2rem;">🏆</div>
                                <div>
                                    <h3 style="color: var(--primary); margin: 0;">SoloPrice PRO</h3>
                                    <p style="font-size: 0.9rem; margin: 0.2rem 0;">Clé: <code style="background: #111; padding: 2px 6px; border-radius: 4px;">${user.licenseKey}</code></p>
                                    <p class="text-sm" style="opacity: 0.6;">Activée le ${App.formatDate(user.activatedAt)}</p>
                                </div>
                            </div>
                        ` : `
                            <div class="upgrade-card" style="background: #0a0a0a; border: 1px solid var(--border); padding: 2rem; border-radius: 12px;">
                                <h3 style="margin-bottom: 1rem;">Version Standard</h3>
                                <p style="color: var(--text-muted); margin-bottom: 1.5rem;">Débloquez l'arsenal complet avec SoloPrice PRO</p>
                                <div class="upgrade-features" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem;">
                                    <div class="feature-item">✓ Clients illimités</div>
                                    <div class="feature-item">✓ Factures & Devis illimités</div>
                                    <div class="feature-item">✓ Export PDF Haute Résolution</div>
                                    <div class="feature-item">✓ Support Prioritaire (Direct)</div>
                                </div>
                                <div class="upgrade-actions" style="display: flex; gap: 1rem;">
                                    <button class="button-primary" onclick="Settings.buyPro()">
                                        Acheter PRO (39€)
                                    </button>
                                    <button class="button-secondary" onclick="App.showLicenseModal()">
                                        Saisir une clé
                                    </button>
                                </div>
                            </div>
                        `}
                    </div>

                    <div class="settings-section profile-section-split" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                        <div class="profile-form-container">
                            <h2 class="section-title-small">Mon Profil Entreprise</h2>
                            <form id="company-form" onsubmit="Settings.saveCompany(event)">
                                <div class="form-grid">
                                    <div class="form-group full-width">
                                        <label class="form-label">Nom / Entreprise *</label>
                                        <input type="text" name="name" class="form-input" value="${user.company.name || ''}" required oninput="Settings.updateIdentityCard()">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Email Professionnel *</label>
                                        <input type="email" name="email" class="form-input" value="${user.company.email || ''}" required oninput="Settings.updateIdentityCard()">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Téléphone</label>
                                        <input type="tel" name="phone" class="form-input" value="${user.company.phone || ''}" oninput="Settings.updateIdentityCard()">
                                    </div>
                                    <div class="form-group full-width">
                                        <label class="form-label">Adresse complète *</label>
                                        <input type="text" name="address" class="form-input" value="${user.company.address || ''}" required oninput="Settings.updateIdentityCard()">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Numéro SIRET</label>
                                        <input type="text" name="siret" class="form-input" value="${user.company.siret || ''}" oninput="Settings.updateIdentityCard()">
                                    </div>
                                    <div class="form-group">
                                        <label class="form-label">Mentions Légales</label>
                                        <input type="text" name="footer_mentions" class="form-input" value="${user.company.footer_mentions || ''}" oninput="Settings.updateIdentityCard()">
                                    </div>
                                    <div class="form-group full-width">
                                        <label class="form-label">Logo de l'entreprise</label>
                                        <div class="logo-upload-container" style="display: flex; gap: 1rem; align-items: center; background: rgba(255,255,255,0.03); padding: 1rem; border-radius: 12px; border: 1px dashed var(--border);">
                                            <div id="logo-preview" style="width: 60px; height: 60px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--border);">
                                                ${user.company.logo ? `<img src="${user.company.logo}" style="width: 100%; height: 100%; object-fit: contain;">` : '<i class="fas fa-image" style="font-size: 20px; color: #ccc;"></i>'}
                                            </div>
                                            <div style="flex: 1;">
                                                <input type="file" id="logo-input" accept="image/*" style="display: none;" onchange="Settings.handleLogoUpload(event)">
                                                <button type="button" class="button-secondary small" onclick="document.getElementById('logo-input').click()">Changer</button>
                                                <input type="hidden" name="logo" id="logo-base64" value="${user.company.logo || ''}">
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-actions" style="margin-top: 1.5rem;">
                                    <button type="submit" class="button-primary">Enregistrer mon profil</button>
                                </div>
                            </form>
                        </div>

                        <!-- Card Identity Preview -->
                        <div class="profile-preview-container">
                            <h2 class="section-title-small">Aperçu Identité</h2>
                            <p class="section-subtitle">Comment vos clients voient votre marque sur les documents.</p>
                            
                            <div class="identity-card-wrapper" style="margin-top: 1.5rem;">
                                <div id="identity-card-preview" class="identity-card premium-glass">
                                    <div class="card-glow"></div>
                                    <div class="card-header">
                                        <div id="card-logo" class="card-logo">
                                            ${user.company.logo ? `<img src="${user.company.logo}">` : '<div class="logo-placeholder">QP</div>'}
                                        </div>
                                        <div class="card-badge">PRO ACCOUNT</div>
                                    </div>
                                    <div class="card-body">
                                        <div id="card-name" class="card-name">${user.company.name || 'Votre Entreprise'}</div>
                                        <div id="card-address" class="card-info"><i class="fas fa-map-marker-alt"></i> ${user.company.address || 'Votre adresse ici'}</div>
                                        <div id="card-contact" class="card-info"><i class="fas fa-envelope"></i> ${user.company.email || 'contact@votre-entreprise.fr'}</div>
                                    </div>
                                    <div class="card-footer">
                                        <div id="card-siret" class="card-siret">${user.company.siret ? 'SIRET: ' + user.company.siret : 'SIRET: non défini'}</div>
                                        <div class="card-verify"><i class="fas fa-check-circle"></i> Vérifié par DomTomConnect</div>
                                    </div>
                                </div>
                                
                                <div class="preview-tip" style="margin-top: 1.5rem; display: flex; gap: 1rem; align-items: flex-start; padding: 1rem; background: rgba(99, 102, 241, 0.1); border-radius: 12px; border: 1px solid var(--primary-glass);">
                                    <p style="font-size: 0.85rem; color: var(--primary-light);">Ces informations sont automatiquement injectées dans vos **Devis** et **Factures** pour maintenir une image de marque forte.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab: TJM -->
                <div id="settings-tab-tjm" class="settings-tab-content ${activeTabId === 'tjm' ? 'active' : ''}">
                    <div class="settings-section">
                        <h2 class="section-title-small">Calculateur de Tarif (TJM)</h2>
                        <p class="section-subtitle">Définissez vos objectifs de revenus pour calculer vos tarifs optimaux.</p>
                        <div id="calculator-embed-container" style="margin-top: 1.5rem;">
                            <div class="empty-state">
                                <button class="button-primary" onclick="App.navigateTo('calculator')">Ouvrir le calculateur</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Tab: Services -->
                <div id="settings-tab-services" class="settings-tab-content ${activeTabId === 'services' ? 'active' : ''}">
                    <div class="settings-section">
                        <h2 class="section-title-small">Catalogue de Prestations</h2>
                        <p class="section-subtitle">Gérez vos prestations habituelles pour les ajouter rapidement à vos devis.</p>
                        <div id="settings-services-container">
                            ${typeof Services !== 'undefined' && Storage.getServices().length > 0 ?
                `<div class="page-actions" style="margin: 1.5rem 0;">
                                    <button class="button-primary" onclick="Services.showAddForm()">
                                        Nouvelle Prestation
                                    </button>
                                </div>
                                <div id="service-form-container"></div>
                                <div class="services-settings-list">
                                    ${Services.renderGroupedServices(Storage.getServices())}
                                </div>` : ''}
                        </div>
                    </div>
                </div>

                <!-- Tab: Billing -->
                <div id="settings-tab-billing" class="settings-tab-content ${activeTabId === 'billing' ? 'active' : ''}">
                    <div class="settings-section">
                        <h2 class="section-title-small">Localité & Taxes</h2>
                        <p class="section-subtitle">Définissez votre zone pour l'application automatique des taxes.</p>
                        <div id="settings-tax-selector-container" style="margin: 1.5rem 0;">
                            <!-- TaxEngine will render here -->
                        </div>
                        
                        <h2 class="section-title-small" style="margin-top: 2rem;">Numérotation & Prefixes</h2>
                        <form id="billing-settings-form" onsubmit="Settings.saveBillingSettings(event)">
                            <div class="form-grid">
                                <div class="form-group">
                                    <label class="form-label">Taux TVA par défaut (%)</label>
                                    <input type="number" name="taxRate" class="form-input" value="${settings.taxRate}" step="0.1">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Validité par défaut (Jours)</label>
                                    <input type="number" name="quoteValidityDays" class="form-input" value="${settings.quoteValidityDays || 30}" min="1">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Préfixe Devis</label>
                                    <input type="text" name="quotePrefix" class="form-input" value="${settings.quotePrefix}">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Préfixe Factures</label>
                                    <input type="text" name="invoicePrefix" class="form-input" value="${settings.invoicePrefix}">
                                </div>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="button-primary">Enregistrer les paramètres</button>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- Tab: Data -->
                <div id="settings-tab-data" class="settings-tab-content ${activeTabId === 'data' ? 'active' : ''}">
                    <div class="settings-section">
                        <h2 class="section-title-small">Gestion des Données</h2>
                        <p class="section-subtitle">Sauvegardez vos données localement ou réinitialisez l'application.</p>
                        <div class="data-actions" style="display: flex; gap: 1rem; margin-top: 1.5rem; flex-wrap: wrap;">
                            <button class="button-secondary" onclick="Settings.exportData()">Exporter (Backup JSON)</button>
                            <button class="button-secondary" onclick="Settings.importData()">Importer un Backup</button>
                            <input type="file" id="import-file-input" style="display: none" onchange="Settings.handleImportFile(event)">
                            <button class="button-danger" onclick="Settings.resetData()">Réinitialiser tout</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        if (typeof TaxEngine !== 'undefined') {
            TaxEngine.renderSelector('settings-tax-selector-container', (ctxId) => {
                const ctx = TaxEngine.contexts[ctxId];
                if (!ctx) return;

                // Update VAT input
                const vatInput = document.querySelector('input[name="taxRate"]');
                if (vatInput) {
                    vatInput.value = ctx.vat;
                    // Add a small highlight effect
                    vatInput.style.borderColor = 'var(--primary)';
                    setTimeout(() => vatInput.style.borderColor = '', 1000);
                }

                // Update Prefixes (Smart Suggestion)
                const quoteInput = document.querySelector('input[name="quotePrefix"]');
                const invInput = document.querySelector('input[name="invoicePrefix"]');

                // If the user is using default prefixes, we update them to be zone-specific
                const defaultQuotePrefix = 'DEV-';
                const defaultInvPrefix = 'FACT-';

                if (quoteInput) {
                    const currentVal = quoteInput.value;
                    // Check if it's the absolute default or a zone-prefixed default from before
                    if (currentVal === defaultQuotePrefix || /^[A-Z]{2,3}-DEV-$/.test(currentVal)) {
                        quoteInput.value = ctx.code === 'FR' ? defaultQuotePrefix : `${ctx.code}-DEV-`;
                        quoteInput.style.borderColor = 'var(--primary)';
                        setTimeout(() => quoteInput.style.borderColor = '', 1000);
                    }
                }

                if (invInput) {
                    const currentVal = invInput.value;
                    if (currentVal === defaultInvPrefix || /^[A-Z]{2,3}-FACT-$/.test(currentVal)) {
                        invInput.value = ctx.code === 'FR' ? defaultInvPrefix : `${ctx.code}-FACT-`;
                        invInput.style.borderColor = 'var(--primary)';
                        setTimeout(() => invInput.style.borderColor = '', 1000);
                    }
                }

                App.showNotification(`Zone ${ctx.name} appliquée : TVA et Préfixes mis à jour.`, 'info');
            });
        }
    },

    switchTab(tabId) {
        document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.settings-tab-content').forEach(c => c.classList.remove('active'));

        const activeTab = document.querySelector(`.settings-tab[onclick*="${tabId}"]`);
        if (activeTab) activeTab.classList.add('active');

        const activeContent = document.getElementById(`settings-tab-${tabId}`);
        if (activeContent) activeContent.classList.add('active');

        if (tabId === 'tjm' && typeof renderCalculatorUI === 'function') {
            document.getElementById('calculator-embed-container').innerHTML = ''; // Clear and re-render
            renderCalculatorUI('calculator-embed-container');
        }

        if (tabId === 'profile') {
            this.updateIdentityCard();
        }
    },

    updateIdentityCard() {
        const form = document.getElementById('company-form');
        if (!form) return;

        const name = form.querySelector('[name="name"]').value || 'Votre Entreprise';
        const address = form.querySelector('[name="address"]').value || 'Votre adresse ici';
        const email = form.querySelector('[name="email"]').value || 'contact@votre-entreprise.fr';
        const siret = form.querySelector('[name="siret"]').value;
        const logo = document.getElementById('logo-base64').value;

        const cardName = document.getElementById('card-name');
        const cardAddress = document.getElementById('card-address');
        const cardContact = document.getElementById('card-contact');
        const cardSiret = document.getElementById('card-siret');
        const cardLogo = document.getElementById('card-logo');

        if (cardName) cardName.textContent = name;
        if (cardAddress) cardAddress.innerHTML = `<i class="fas fa-map-marker-alt"></i> ${address}`;
        if (cardContact) cardContact.innerHTML = `<i class="fas fa-envelope"></i> ${email}`;
        if (cardSiret) cardSiret.textContent = siret ? `SIRET: ${siret}` : 'SIRET: non défini';

        if (cardLogo) {
            if (logo) {
                cardLogo.innerHTML = `<img src="${logo}">`;
            } else {
                const initial = name.charAt(0).toUpperCase();
                cardLogo.innerHTML = `<div class="logo-placeholder">${initial}</div>`;
            }
        }
    },

    saveCompany(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        try {
            const companyData = {
                name: formData.get('name'),
                email: formData.get('email'),
                phone: formData.get('phone'),
                address: formData.get('address'),
                siret: formData.get('siret') || '',
                footer_mentions: formData.get('footer_mentions') || '',
                logo: formData.get('logo') || ''
            };

            const updated = Storage.updateUser({ company: companyData });

            if (!updated) {
                throw new Error("Échec de la mise à jour de l'utilisateur dans le stockage.");
            }

            // Refresh UI components
            if (typeof App !== 'undefined') {
                if (App.renderUserInfo) App.renderUserInfo();
                if (App.showNotification) App.showNotification('Profil mis à jour avec succès', 'success');
            } else {
                alert('Profil mis à jour !');
            }
        } catch (error) {
            console.error('Error saving company:', error);
            if (typeof App !== 'undefined' && App.showNotification) {
                App.showNotification('Erreur lors de la sauvegarde : ' + error.message, 'error');
            } else {
                alert('Erreur: ' + error.message);
            }
        }
    },

    saveBillingSettings(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const settingsData = {
            taxRate: parseFloat(formData.get('taxRate')),
            invoicePrefix: formData.get('invoicePrefix'),
            quotePrefix: formData.get('quotePrefix'),
            quoteValidityDays: parseInt(formData.get('quoteValidityDays')) || 30
        };

        Storage.set(Storage.KEYS.SETTINGS, {
            ...Storage.get(Storage.KEYS.SETTINGS),
            ...settingsData
        });

        App.showNotification('Paramètres enregistrés', 'success');
    },

    handleLogoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 500 * 1024) {
            App.showNotification('L\'image est trop lourde (500KB max)', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            document.getElementById('logo-base64').value = base64;
            document.getElementById('logo-preview').innerHTML = `<img src="${base64}" style="width: 100%; height: 100%; object-fit: contain;">`;
            App.showNotification('Logo chargé. N\'oubliez pas d\'enregistrer votre profil.', 'info');
        };
        reader.readAsDataURL(file);
    },

    removeLogo() {
        document.getElementById('logo-base64').value = '';
        document.getElementById('logo-preview').innerHTML = '<i class="fas fa-image" style="font-size: 24px; color: var(--text-muted);"></i>';
        App.showNotification('Logo supprimé. N\'oubliez pas d\'enregistrer votre profil.', 'info');
    },

    buyPro() {
        // Rediriger vers Stripe Checkout
        // Pour l'instant, on affiche juste une info
        const message = `
1. Visitez: https://buy.stripe.com/votre-lien
2. Complétez le paiement
3. Vous recevrez une clé de licence par email
4. Activez-la ici dans les paramètres

Pour tester l'application, vous pouvez générer une clé de test.
        `;

        alert(message);
    },

    generateTestKey() {
        const key = App.generateLicenseKey();

        if (confirm(`Clé de test générée :\n\n${key}\n\nVoulez-vous l'activer maintenant ?`)) {
            Storage.activatePro(key);
            App.showNotification('Version PRO activée.', 'success');
            App.renderProBadge();
            App.checkFreemiumLimits();
            this.render();
        } else {
            // Copier dans le presse-papier
            navigator.clipboard.writeText(key).then(() => {
                App.showNotification('Clé copiée.', 'success');
            });
        }
    },

    exportData() {
        const data = Storage.exportAll();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `quickprice-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        App.showNotification('Données exportées', 'success');
    },

    importData() {
        document.getElementById('import-file-input').click();
    },

    handleImportFile(e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const success = Storage.importAll(event.target.result);
                if (success) {
                    App.showNotification('Données importées avec succès', 'success');
                    window.location.reload();
                } else {
                    App.showNotification('Erreur lors de l\'import', 'error');
                }
            } catch (e) {
                App.showNotification('Fichier invalide', 'error');
            }
        };
        reader.readAsText(file);
    },

    resetData() {
        if (confirm('Attention : Cette action supprimera toutes vos données. Cette action est irréversible.\n\nSouhaitez-vous continuer ?')) {
            if (confirm('Dernière confirmation : toutes vos données seront supprimées. Continuer ?')) {
                Storage.clearAll();
                localStorage.removeItem('qp_marketplace_missions'); // Cleaner le radar aussi
                App.showNotification('Données réinitialisées', 'success');
                window.location.reload();
            }
        }
    }
};

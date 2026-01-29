// QuickPrice Pro - Settings Module

const Settings = {
    render() {
        const container = document.getElementById('settings-content');
        if (!container) return;

        const user = Storage.getUser();
        const settings = Storage.get(Storage.KEYS.SETTINGS);

        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Paramètres</h1>
                <p class="page-subtitle">Configuration de votre compte</p>
            </div>

            <div class="settings-sections">
                <!-- Statut PRO -->
                <div class="settings-section">
                    <h2 class="section-title-small">Licence</h2>
                    ${user.isPro ? `
                        <div class="pro-status-card">
                            <div>
                                <h3>Licence QuickPrice PRO Active</h3>
                                <p>Clé: ${user.licenseKey}</p>
                                <p class="text-sm">Activée le ${App.formatDate(user.activatedAt)}</p>
                            </div>
                        </div>
                    ` : `
                        <div class="upgrade-card">
                            <h3>Version Gratuite</h3>
                            <p>Débloquez toutes les fonctionnalités avec QuickPrice PRO</p>
                            <div class="upgrade-features">
                                <div class="feature-item">Clients illimités</div>
                                <div class="feature-item">Factures et devis illimités</div>
                                <div class="feature-item">Export PDF professionnel</div>
                                <div class="feature-item">Templates de documents</div>
                                <div class="feature-item">Support prioritaire</div>
                            </div>
                            <div class="upgrade-actions">
                                <button class="button-primary" onclick="Settings.buyPro()">
                                    Acheter PRO (39€)
                                </button>
                                <button class="button-secondary" onclick="App.showLicenseModal()">
                                    J'ai déjà une clé
                                </button>
                            </div>
                            <p class="text-sm text-muted">Aide : Pour tester, vous pouvez générer une clé de démonstration.</p>
                            <button class="button-secondary" onclick="Settings.generateTestKey()">
                                Générer une clé de test
                            </button>
                        </div>
                    `}
                </div>

                <!-- Informations entreprise (Profil Utilisateur) -->
                <div class="settings-section">
                    <h2 class="section-title-small">Mon Profil Entreprise (Affiché sur les devis)</h2>
                    <form id="company-form" onsubmit="Settings.saveCompany(event)">
                        <div class="form-grid">
                            <div class="form-group full-width">
                                <label class="form-label">Nom de votre entreprise / Votre Nom *</label>
                                <input type="text" name="name" class="form-input" value="${user.company.name || ''}" required placeholder="Ex: Studio Web Design">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Email de contact *</label>
                                <input type="email" name="email" class="form-input" value="${user.company.email || ''}" required placeholder="contact@maboite.com">
                            </div>
                            <!-- ... fields ... -->
                        </div>
                        <!-- Hidden inputs for rest of fields to simplify view for this snippet -->
                    </form>
                </div>
                
                <!-- Outils Financiers (Moved from Sidebar) -->
                <div class="settings-section">
                    <h2 class="section-title-small">Aide à la Tarification</h2>
                    <div class="settings-grid">
                       <div class="setting-card" onclick="App.navigateTo('calculator')">
                           <div class="setting-icon">⚡</div>
                           <div class="setting-info">
                               <h3>Calculateur de TJM</h3>
                               <p>Définissez votre taux horaire idéal en fonction de vos charges et objectifs.</p>
                           </div>
                           <div class="setting-action">
                               <button class="button-secondary">Ouvrir</button>
                           </div>
                       </div>
                    </div>
                </div>
                    <form id="company-form" onsubmit="Settings.saveCompany(event)">
                        <div class="form-grid">
                            <div class="form-group full-width">
                                <label class="form-label">Nom de votre entreprise / Votre Nom *</label>
                                <input type="text" name="name" class="form-input" value="${user.company.name || ''}" required placeholder="Ex: Studio Web Design">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Email de contact *</label>
                                <input type="email" name="email" class="form-input" value="${user.company.email || ''}" required placeholder="contact@maboite.com">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Téléphone</label>
                                <input type="tel" name="phone" class="form-input" value="${user.company.phone || ''}" placeholder="06 00 00 00 00">
                            </div>

                            <div class="form-group full-width">
                                <label class="form-label">Adresse complète *</label>
                                <input type="text" name="address" class="form-input" value="${user.company.address || ''}" required placeholder="123 Rue de la Startup, 75000 Paris">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Numéro SIRET</label>
                                <input type="text" name="siret" class="form-input" value="${user.company.siret || ''}" placeholder="123 456 789 00012">
                            </div>
                            
                            <div class="form-group">
                                <label class="form-label">Mentions légales (Bas de page)</label>
                                <input type="text" name="footer_mentions" class="form-input" value="${user.company.footer_mentions || ''}" placeholder="TVA non applicable, art. 293 B du CGI">
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="button-primary">Enregistrer mon profil</button>
                        </div>
                    </form>
                </div>

                <!-- Outils Financiers (Déplacés du menu) -->
                <div class="settings-section">
                    <h2 class="section-title-small">Mon Taux Journalier (TJM)</h2>
                    <p class="section-subtitle">Utilisez le calculateur pour vérifier si vous êtes rentable.</p>
                    <div class="settings-grid">
                       <div class="setting-card" onclick="App.navigateTo('calculator')">
                               <h3>Accéder à l'outil</h3>
                               <p>Définissez votre prix idéal selon vos charges réelles.</p>
                           </div>
                           <button class="button-secondary">Ouvrir</button>
                       </div>
                    </div>
                </div>

                <!-- Paramètres de facturation -->
                <div class="settings-section">
                    <h2 class="section-title-small">Facturation</h2>
                    <form id="billing-settings-form" onsubmit="Settings.saveBillingSettings(event)">
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Taux de TVA (%)</label>
                                <input type="number" name="taxRate" class="form-input" 
                                       value="${settings.taxRate}" min="0" max="100" step="0.1">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Préfixe factures</label>
                                <input type="text" name="invoicePrefix" class="form-input" 
                                       value="${settings.invoicePrefix}">
                            </div>

                            <div class="form-group">
                                <label class="form-label">Préfixe devis</label>
                                <input type="text" name="quotePrefix" class="form-input" 
                                       value="${settings.quotePrefix}">
                            </div>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="button-primary">Enregistrer</button>
                        </div>
                    </form>
                </div>

                <!-- Export / Import -->
                <div class="settings-section">
                    <h2 class="section-title-small">Données</h2>
                    <div class="data-actions">
                        <button class="button-secondary" onclick="Settings.exportData()">
                            Exporter les données
                        </button>
                        <button class="button-secondary" onclick="Settings.importData()">
                            Importer des données
                        </button>
                        <button class="button-danger" onclick="Settings.resetData()">
                            Réinitialiser l'application
                        </button>
                    </div>
                    <input type="file" id="import-file-input" accept=".json" style="display:none" onchange="Settings.handleImportFile(event)">
                </div>
            </div>
        `;
    },

    saveCompany(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const companyData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            siret: formData.get('siret'),
            footer_mentions: formData.get('footer_mentions')
        };

        Storage.updateUser({ company: companyData });
        App.showNotification('Informations enregistrées', 'success');
    },

    saveBillingSettings(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const settingsData = {
            taxRate: parseFloat(formData.get('taxRate')),
            invoicePrefix: formData.get('invoicePrefix'),
            quotePrefix: formData.get('quotePrefix')
        };

        Storage.set(Storage.KEYS.SETTINGS, {
            ...Storage.get(Storage.KEYS.SETTINGS),
            ...settingsData
        });

        App.showNotification('Paramètres enregistrés', 'success');
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

        App.showNotification('✅ Données exportées', 'success');
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
                    App.showNotification('✅ Données importées avec succès', 'success');
                    window.location.reload();
                } else {
                    App.showNotification('❌ Erreur lors de l\'import', 'error');
                }
            } catch (e) {
                App.showNotification('❌ Fichier invalide', 'error');
            }
        };
        reader.readAsText(file);
    },

    resetData() {
        if (confirm('Attention : Cette action supprimera toutes vos données. Cette action est irréversible.\n\nSouhaitez-vous continuer ?')) {
            if (confirm('Dernière confirmation : toutes vos données seront supprimées. Continuer ?')) {
                Storage.clearAll();
                App.showNotification('Données réinitialisées', 'success');
                window.location.reload();
            }
        }
    }
};

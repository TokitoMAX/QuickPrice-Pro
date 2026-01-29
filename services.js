// QuickPrice Pro - Services Catalog Module

const Services = {
    PRESETS: {
        PRESETS: {
            'web': [
                { label: 'Site Vitrine Standard', unitPrice: 1500, description: 'Création site WordPress 5 pages, Responsive, SEO de base', category: 'Développement Web', unitType: 'Forfait' },
                { label: 'Développement TJM', unitPrice: 450, description: 'Journée de développement web (Front/Back)', category: 'Développement Web', unitType: 'Jour' },
                { label: 'Maintenance Mensuelle', unitPrice: 80, description: 'Mises à jour, sauvegardes et sécurité', category: 'Maintenance', unitType: 'Mois' }
            ],
            'design': [
                { label: 'Création de Logo', unitPrice: 800, description: '3 propositions, fichiers vectoriels et déclinaisons', category: 'Design Graphique', unitType: 'Forfait' },
                { label: 'Charte Graphique', unitPrice: 1200, description: 'Palette couleurs, typographies, guide d\'utilisation', category: 'Design Graphique', unitType: 'Forfait' },
                { label: 'Maquette UI Home', unitPrice: 400, description: 'Design page d\'accueil Desktop/Mobile', category: 'UI/UX Design', unitType: 'Page' }
            ],
            'consulting': [
                { label: 'Audit SEO', unitPrice: 900, description: 'Analyse technique, sémantique et concurrence', category: 'Consulting', unitType: 'Forfait' },
                { label: 'Consulting Stratégique', unitPrice: 150, description: 'Visio-conférence et plan d\'action', category: 'Consulting', unitType: 'Heure' }
            ]
        },

        importPresets(type) {
            if (!confirm('Voulez-vous importer ces prestations exemples dans votre catalogue ?')) return;

            const items = this.PRESETS[type];
            if (items) {
                items.forEach(item => Storage.addService(item));
                App.showNotification('✅ Pack de prestations importé !', 'success');
                this.render();
            }
        },

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
                
                <div class="presets-section" style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid var(--border-color);">
                   <h3 style="margin-bottom: 1rem; font-size: 0.9rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 1px;">Packs de Démarrage Rapide</h3>
                   <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
                       <button class="button-secondary" onclick="Services.importPresets('web')">📦 Import Pack Web</button>
                       <button class="button-secondary" onclick="Services.importPresets('design')">🎨 Import Pack Design</button>
                       <button class="button-secondary" onclick="Services.importPresets('consulting')">🧠 Import Pack Consulting</button>
                   </div>
                </div>

            ` : `
                <div class="empty-state">
                    <div class="empty-icon">⚡</div>
                    <h3>Démarrez en 3 secondes</h3>
                    <p>Ne perdez pas de temps à tout créer. Importez un pack métier :</p>
                    
                    <div class="quick-start-packs" style="display: flex; gap: 1rem; justify-content: center; margin-top: 1.5rem; flex-wrap: wrap;">
                         <button class="pack-card" onclick="Services.importPresets('web')" style="padding: 1.5rem; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: 12px; cursor: pointer; transition: all 0.2s; min-width: 150px;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">💻</div>
                            <strong>Freelance Web</strong>
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">Site, Maintenance, TJM</div>
                         </button>

                         <button class="pack-card" onclick="Services.importPresets('design')" style="padding: 1.5rem; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: 12px; cursor: pointer; transition: all 0.2s; min-width: 150px;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🎨</div>
                            <strong>Designer</strong>
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">Logo, Branding, UI</div>
                         </button>

                         <button class="pack-card" onclick="Services.importPresets('consulting')" style="padding: 1.5rem; border: 1px solid var(--border-color); background: var(--bg-card); border-radius: 12px; cursor: pointer; transition: all 0.2s; min-width: 150px;">
                            <div style="font-size: 2rem; margin-bottom: 0.5rem;">🧠</div>
                            <strong>Consultant</strong>
                            <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.5rem;">Audit, Coaching</div>
                         </button>
                    </div>

                    <p style="margin-top: 2rem; font-size: 0.9rem; color: var(--text-muted);">Ou créez le vôtre manuellement</p>
                    <button class="button-secondary" onclick="Services.showAddForm()">+ Ajouter une prestation vide</button>
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

/**
 * SoloPrice Pro - Marketplace & Hub Module
 * Fusion des Opportunités DomTomConnect, de la Prospection et du Réseau.
 */
const Marketplace = {
    activeTab: 'missions',

    missions: [],

    render(containerId = 'marketplace-content') {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Marketplace <span style="color: var(--primary);">DomTomConnect</span></h1>
                    <p class="page-subtitle">Développez votre business, trouvez des clients et des partenaires qualifiés.</p>
                </div>
                <button class="button-primary" onclick="Marketplace.showPostMissionForm()">
                    + Poster une Mission
                </button>
            </div>

            <div id="mission-form-container"></div>

            <div class="settings-tabs" style="margin-bottom: 2rem;">
                <button class="settings-tab ${this.activeTab === 'missions' ? 'active' : ''}" onclick="Marketplace.switchTab('missions')">Missions (Radar)</button>
                <button class="settings-tab ${this.activeTab === 'my-missions' ? 'active' : ''}" onclick="Marketplace.switchTab('my-missions')">Mes Annonces</button>
                <button class="settings-tab ${this.activeTab === 'providers' ? 'active' : ''}" onclick="Marketplace.switchTab('providers')">Mes Prestataires</button>
                <button class="settings-tab ${this.activeTab === 'experts' ? 'active' : ''}" onclick="Marketplace.switchTab('experts')">Experts Vérifiés</button>
            </div>

            <div id="marketplace-dynamic-content" class="marketplace-container">
                <!-- Rempli par switchTab -->
            </div>
        `;

        this.switchTab(this.activeTab);
    },

    switchTab(tabId) {
        this.activeTab = tabId;
        document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
        const activeTab = document.querySelector(`.settings-tab[onclick*="${tabId}"]`);
        if (activeTab) activeTab.classList.add('active');

        const container = document.getElementById('marketplace-dynamic-content');
        if (!container) return;

        if (tabId === 'missions') {
            this.renderMissions(container);
        } else if (tabId === 'my-missions') {
            this.renderMyMissions(container);
        } else if (tabId === 'providers') {
            this.renderProviders(container);
        } else if (tabId === 'experts') {
            this.renderExperts(container);
        }
    },

    getPublicMissions() {
        return JSON.parse(localStorage.getItem('sp_marketplace_missions') || '[]');
    },

    // ===== MISSIONS RADAR (from others) =====
    renderMissions(container) {
        // Utilisation des données publiques (simulées via localStorage pour le prototype)
        const missions = this.getPublicMissions();

        if (missions.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1.5rem;">📡</div>
                    <h3 style="color: var(--white); margin-bottom: 1rem;">Aucune opportunité pour le moment</h3>
                    <p style="color: var(--text-muted); margin-bottom: 2rem; max-width: 500px; margin-left: auto; margin-right: auto;">
                        Les nouvelles missions apparaîtront ici dès qu'elles seront disponibles sur le réseau DomTom Connect.
                    </p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="section-header-inline">
                <h3 class="section-title-small">Opportunités en cours</h3>
            </div>
            <div class="partners-grid">
                ${missions.map(m => `
                    <div class="stat-card" style="position: relative; overflow: hidden; border-left: 4px solid ${m.urgency === 'Haute' ? 'var(--danger)' : 'var(--primary)'};">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                            <h4 style="margin: 0; font-size: 1.1rem; color: var(--white);">${m.title}</h4>
                            <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: ${m.urgency === 'Haute' ? 'var(--danger)' : 'var(--text-muted)'};">${m.urgency}</span>
                        </div>
                        <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem;">Budget : ${m.budget}</div>
                        <div style="font-size: 0.9rem; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
                            <span>📍 ${m.zone}</span>
                            <span style="margin-left: auto; opacity: 0.7;">Publié il y a 2h</span>
                        </div>
                        <button class="button-primary small" style="margin-top: 1.5rem; width: 100%;" onclick="Marketplace.applyForMission(${m.id})">Postuler via DomTom Connect</button>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // ===== MY MISSIONS (posted by user) =====
    renderMyMissions(container) {
        const myMissions = this.getMyMissions();

        if (myMissions.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 4rem 2rem;">
                    <h3 style="color: var(--white); margin-bottom: 1rem;">Aucune mission publiée</h3>
                    <p style="color: var(--text-muted); margin-bottom: 2rem;">Postez une mission pour trouver des experts qualifiés.</p>
                    <button class="button-primary" onclick="Marketplace.showPostMissionForm()">Poster ma première mission</button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="section-header-inline">
                <h3 class="section-title-small">Mes annonces publiées</h3>
                <span class="badge" style="background: var(--primary-glass); color: var(--primary);">${myMissions.length} mission(s)</span>
            </div>
            <div class="partners-grid">
                ${myMissions.map(m => `
                    <div class="stat-card" style="position: relative; overflow: hidden; border-left: 4px solid var(--primary);">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem;">
                            <h4 style="margin: 0; font-size: 1.1rem; color: var(--white);">${this.escapeHtml(m.title)}</h4>
                            <span style="font-size: 0.75rem; text-transform: uppercase; font-weight: 800; color: var(--primary);">ACTIVE</span>
                        </div>
                        <div style="font-size: 1.4rem; font-weight: 800; color: var(--primary); margin-bottom: 0.5rem;">Budget : ${this.escapeHtml(m.budget)} €</div>
                        <div style="font-size: 0.9rem; color: var(--text-muted); margin-bottom: 0.5rem;">📍 ${this.escapeHtml(m.zone)}</div>
                        <p style="font-size: 0.85rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 1rem;">${this.escapeHtml(m.description).substring(0, 100)}...</p>
                        <div style="display: flex; gap: 0.5rem; margin-top: auto;">
                            <button class="button-secondary small" style="flex: 1;" onclick="Marketplace.editMission('${m.id}')">Modifier</button>
                            <button class="button-secondary small" style="flex: 1; border-color: var(--danger); color: var(--danger);" onclick="Marketplace.deleteMission('${m.id}')">Supprimer</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // ===== POST MISSION FORM =====
    showPostMissionForm() {
        const container = document.getElementById('mission-form-container');
        if (!container) return;

        const user = Auth.getUser();
        const companyName = user?.company?.name || '';

        container.innerHTML = `
            <div class="form-card" style="margin-bottom: 2rem; animation: slideDown 0.3s ease; background: #0a0a0a; border: 1px solid var(--border); border-radius: 12px; padding: 2rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                    <h3 style="margin: 0; color: var(--white);">📤 Poster une nouvelle mission</h3>
                    <button class="btn-close" onclick="Marketplace.hidePostMissionForm()" style="background: none; border: none; color: var(--text-muted); font-size: 1.5rem; cursor: pointer;">✕</button>
                </div>
                <form onsubmit="Marketplace.saveMission(event)">
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                        <div class="form-group">
                            <label class="form-label">Titre de la mission *</label>
                            <input type="text" name="title" class="form-input" required placeholder="Ex: Développement d'une app mobile">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Budget estimé (€) *</label>
                            <input type="number" name="budget" class="form-input" required placeholder="Ex: 3500">
                        </div>
                        <div class="form-group">
                            <label class="form-label">Zone géographique *</label>
                            <select name="zone" class="form-input" required>
                                <option value="">-- Sélectionner --</option>
                                <option value="Guadeloupe">Guadeloupe (971)</option>
                                <option value="Martinique">Martinique (972)</option>
                                <option value="Guyane">Guyane (973)</option>
                                <option value="La Réunion">La Réunion (974)</option>
                                <option value="Mayotte">Mayotte (976)</option>
                                <option value="France Métropolitaine">France Métropolitaine</option>
                                <option value="Remote">100% Remote</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label class="form-label">Urgence</label>
                            <select name="urgency" class="form-input">
                                <option value="Basse">Basse (flexible)</option>
                                <option value="Moyenne" selected>Moyenne (quelques semaines)</option>
                                <option value="Haute">Haute (urgent)</option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group" style="margin-top: 1.5rem;">
                        <label class="form-label">Description de la mission *</label>
                        <textarea name="description" class="form-input" rows="4" required placeholder="Décrivez le projet, les compétences recherchées, les délais..."></textarea>
                    </div>
                    <div style="display: flex; gap: 1rem; margin-top: 2rem; justify-content: flex-end;">
                        <button type="button" class="button-secondary" onclick="Marketplace.hidePostMissionForm()">Annuler</button>
                        <button type="submit" class="button-primary">Publier la mission</button>
                    </div>
                </form>
            </div>
        `;
        container.scrollIntoView({ behavior: 'smooth' });
    },

    hidePostMissionForm() {
        const container = document.getElementById('mission-form-container');
        if (container) container.innerHTML = '';
    },

    saveMission(e) {
        e.preventDefault();
        const formData = new FormData(e.target);
        const mission = {
            id: Date.now().toString(),
            title: formData.get('title'),
            budget: formData.get('budget'),
            zone: formData.get('zone'),
            urgency: formData.get('urgency'),
            description: formData.get('description'),
            createdAt: new Date().toISOString(),
            status: 'active'
        };

        const missions = this.getMyMissions();
        missions.push(mission);
        localStorage.setItem('sp_my_missions', JSON.stringify(missions));

        // ALSO push to public missions (Radar) so it appears there
        const publicMissions = this.getPublicMissions();
        publicMissions.push(mission);
        localStorage.setItem('sp_marketplace_missions', JSON.stringify(publicMissions));

        this.hidePostMissionForm();
        this.switchTab('my-missions');
        App.showNotification('Mission publiée avec succès !', 'success');
    },

    getMyMissions() {
        return JSON.parse(localStorage.getItem('sp_my_missions') || '[]');
    },

    deleteMission(id) {
        if (!confirm('Supprimer cette mission ?')) return;

        // 1. Supprimer de "Mes Annonces" (Liste privée)
        let missions = this.getMyMissions();
        missions = missions.filter(m => m.id !== id);
        localStorage.setItem('sp_my_missions', JSON.stringify(missions));

        // 2. Supprimer du "Radar" (Liste publique)
        let publicMissions = this.getPublicMissions();
        publicMissions = publicMissions.filter(m => m.id !== id);
        localStorage.setItem('sp_marketplace_missions', JSON.stringify(publicMissions));

        this.switchTab('my-missions');
        App.showNotification('Mission supprimée et retirée du Radar.', 'success');
    },

    editMission(id) {
        App.showNotification('Fonctionnalité d\'édition à venir.', 'info');
    },

    // ===== PROVIDERS (Mes Prestataires) =====
    renderProviders(container) {
        // Unifié avec le module Network
        const providers = JSON.parse(localStorage.getItem('sp_network_providers') || '[]');

        if (providers.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1.5rem;">🤝</div>
                    <h3 style="color: var(--white); margin-bottom: 1rem;">Vos collaborations actives</h3>
                    <p style="color: var(--text-muted); margin-bottom: 2rem; max-width: 500px; margin-left: auto; margin-right: auto;">
                        Retrouvez ici les experts avec qui vous travaillez. Contactez un expert vérifié pour démarrer une collaboration.
                    </p>
                    <button class="button-primary" onclick="Marketplace.switchTab('experts')">Trouver un Expert</button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="section-header-inline">
                <h3 class="section-title-small">Mes Prestataires Actifs</h3>
            </div>
            <div class="partners-grid">
                ${providers.map(p => `
                    <div class="network-card glass" style="background: #0a0a0a; border: 1px solid var(--border); padding: 1.5rem; border-radius: 12px;">
                        <h3 style="margin: 0; font-size: 1.1rem; color: var(--white);">${p.name}</h3>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">${p.role}</p>
                        <button class="button-secondary small" style="margin-top: 1rem; width: 100%;">Contacter</button>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // ===== EXPERTS =====
    renderExperts(container) {
        // Simulation d'experts vérifiés DomTomConnect
        const experts = [
            { id: 'exp1', name: 'Jean Expert', specialty: 'Expertise Comptable', zone: 'Guadeloupe (971)', avatar: 'J' },
            { id: 'exp2', name: 'Marie Strategie', specialty: 'Marketing Digital', zone: 'Martinique (972)', avatar: 'M' },
            { id: 'exp3', name: 'Lucas Tech', specialty: 'Développement Web', zone: 'Réunion (974)', avatar: 'L' }
        ];

        if (experts.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 3rem; margin-bottom: 1.5rem;">💎</div>
                    <h3 style="color: var(--white); margin-bottom: 1rem;">Rejoignez les Experts Vérifiés</h3>
                    <p style="color: var(--text-muted); margin-bottom: 2rem; max-width: 500px; margin-left: auto; margin-right: auto;">
                        Aucun expert n'est affiché pour le moment. Vous êtes un professionnel qualifié ? Postulez pour rejoindre notre réseau exclusif.
                    </p>
                    <button class="button-primary" onclick="Marketplace.becomeExpert()">Devenir un Expert Vérifié (Postuler)</button>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="section-header-inline">
                <h3 class="section-title-small">Prestataires Qualifiés</h3>
                <button class="button-secondary small">Inviter un Partenaire</button>
            </div>
            <div class="partners-grid">
                ${experts.map(e => `
                    <div class="network-card glass" style="background: #0a0a0a; border: 1px solid var(--border); padding: 1.5rem; border-radius: 12px; display: flex; align-items: center; gap: 1.5rem; transition: all 0.3s ease;">
                        <div class="provider-avatar" style="width: 50px; height: 50px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.2rem; border: 2px solid white;">${e.avatar}</div>
                        <div class="provider-info">
                            <h3 style="margin: 0; font-size: 1.1rem;">${e.name} <span class="pro-badge-small" style="background: var(--primary); margin-left: 5px;">VÉRIFIÉ</span></h3>
                            <p style="margin: 0.2rem 0; color: var(--text-muted); font-size: 0.9rem;">${e.specialty}</p>
                            <p style="margin: 0; font-size: 0.8rem; opacity: 0.7;">📍 ${e.zone}</p>
                        </div>
                        <div style="margin-left: auto; display: flex; gap: 0.5rem;">
                            <button class="button-secondary small" style="padding: 0.4rem;" onclick="Marketplace.contactExpert('${e.name}')">Message</button>
                            <button class="button-primary small" style="padding: 0.4rem;" onclick="Marketplace.addExpertToCircle('${e.id}')">+ Mon Cercle</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    addExpertToCircle(id) {
        // Retrouver l'expert dans la liste simulée
        const experts = [
            { id: 'exp1', name: 'Jean Expert', specialty: 'Expertise Comptable', zone: 'Guadeloupe (971)', avatar: 'J' },
            { id: 'exp2', name: 'Marie Strategie', specialty: 'Marketing Digital', zone: 'Martinique (972)', avatar: 'M' },
            { id: 'exp3', name: 'Lucas Tech', specialty: 'Développement Web', zone: 'Réunion (974)', avatar: 'L' }
        ];

        const expert = experts.find(e => e.id === id);
        if (!expert) return;

        const myCircle = JSON.parse(localStorage.getItem('sp_network_providers') || '[]');

        // Vérifier si déjà présent
        if (myCircle.some(p => p.email === expert.id)) {
            App.showNotification('Cet expert est déjà dans votre cercle.', 'info');
            return;
        }

        const newPartner = {
            id: 'dtc_' + expert.id,
            name: expert.name,
            specialty: expert.specialty,
            city: expert.zone,
            isVerified: true
        };

        myCircle.push(newPartner);
        localStorage.setItem('sp_network_providers', JSON.stringify(myCircle));
        App.showNotification(`${expert.name} ajouté à votre cercle !`, 'success');
        this.switchTab('providers');
    },

    applyForMission(id) {
        const mission = this.missions.find(m => m.id === id);
        if (mission) {
            const subject = encodeURIComponent(`Candidature pour la mission : ${mission.title}`);
            const body = encodeURIComponent(`Bonjour,\n\nJe souhaite postuler pour la mission "${mission.title}" (Budget: ${mission.budget}).\n\nCordialement,`);
            window.location.href = `mailto:domtomconnect@gmail.com?subject=${subject}&body=${body}`;
            App.showNotification('Ouverture de votre messagerie...', 'success');
        } else {
            window.location.href = `mailto:domtomconnect@gmail.com`;
        }
    },

    contactExpert(name) {
        App.showNotification(`Lancer une conversation avec ${name} via DomTomConnect...`, 'info');
    },

    becomeExpert() {
        const subject = encodeURIComponent("Candidature Expert Vérifié DomTom Connect");
        const body = encodeURIComponent("Bonjour,\n\nJe souhaite rejoindre le réseau d'experts DomTom Connect.\n\nVoici mon profil et mes compétences :\n\nCordialement,");
        window.location.href = `mailto:domtomconnect@gmail.com?subject=${subject}&body=${body}`;
        App.showNotification('Ouverture de votre messagerie...', 'success');
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

window.Marketplace = Marketplace;

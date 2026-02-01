// SoloPrice Pro - Profile Module
// Handles user identity, branding, and license management

const Profile = {
    render() {
        const container = document.getElementById('profile-content');
        if (!container) return;

        const user = Storage.getUser();
        const isPro = Storage.isPro();

        container.innerHTML = `
            <div class="page-header">
                <h1 class="page-title">Mon Profil</h1>
                <p class="page-subtitle">Gérez votre identité professionnelle et votre licence SoloPrice Pro.</p>
            </div>

            <div class="profile-layout" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
                
                <!-- Left: Professional Profile Form -->
                <div class="profile-section">
                    <div class="glass-card" style="padding: 2rem; border-radius: 20px; border: 1px solid var(--border);">
                        <h2 class="section-title-small" style="margin-bottom: 1.5rem;">Identité Entreprise</h2>
                        <form id="company-form" onsubmit="Profile.save(event)">
                            <div class="form-grid">
                                <div class="form-group full-width">
                                    <label class="form-label">Nom Commercial / Entreprise *</label>
                                    <input type="text" name="name" class="form-input" value="${user.company?.name || ''}" required oninput="Profile.updatePreview()">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Email Professionnel *</label>
                                    <input type="email" name="email" class="form-input" value="${user.company?.email || ''}" required oninput="Profile.updatePreview()">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Téléphone</label>
                                    <input type="tel" name="phone" class="form-input" value="${user.company?.phone || ''}" oninput="Profile.updatePreview()">
                                </div>
                                <div class="form-group full-width">
                                    <label class="form-label">Adresse Siège Social *</label>
                                    <input type="text" name="address" class="form-input" value="${user.company?.address || ''}" required oninput="Profile.updatePreview()">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">SIRET</label>
                                    <input type="text" name="siret" class="form-input" value="${user.company?.siret || ''}" oninput="Profile.updatePreview()">
                                </div>
                                <div class="form-group">
                                    <label class="form-label">Mentions Légales (Pied de page)</label>
                                    <input type="text" name="footer_mentions" class="form-input" value="${user.company?.footer_mentions || ''}" oninput="Profile.updatePreview()" placeholder="Ex: TVA Intracom FR...">
                                </div>
                                
                                <div class="form-group full-width">
                                    <label class="form-label">Logo de l'entreprise</label>
                                    <div class="logo-upload-container" style="display: flex; gap: 1rem; align-items: center; background: rgba(255,255,255,0.02); padding: 1.5rem; border-radius: 12px; border: 1px dashed var(--border);">
                                        <div id="logo-preview" style="width: 80px; height: 80px; background: white; border-radius: 12px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 1px solid var(--border);">
                                            ${user.company?.logo ? `<img src="${user.company.logo}" style="width: 100%; height: 100%; object-fit: contain;">` : '<i class="fas fa-image" style="font-size: 24px; color: #ccc;"></i>'}
                                        </div>
                                        <div style="flex: 1;">
                                            <input type="file" id="logo-input" accept="image/*" style="display: none;" onchange="Profile.handleLogoUpload(event)">
                                            <div style="display: flex; gap: 0.5rem;">
                                                <button type="button" class="button-primary small" onclick="document.getElementById('logo-input').click()">Charger Logo</button>
                                                ${user.company?.logo ? `<button type="button" class="button-danger small" onclick="Profile.removeLogo()">Supprimer</button>` : ''}
                                            </div>
                                            <p class="text-xs text-muted" style="margin-top: 0.5rem;">PNG or JPG. Max 500KB.</p>
                                            <input type="hidden" name="logo" id="logo-base64" value="${user.company?.logo || ''}">
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="form-actions" style="margin-top: 2rem;">
                                <button type="submit" class="button-primary full-width">Mettre à jour mon profil</button>
                            </div>
                        </form>
                    </div>

                    <!-- License Section Below Form -->
                    <div class="license-status-card" style="margin-top: 2rem; padding: 1.5rem; border-radius: 16px; border: 1px solid ${isPro ? 'var(--primary-glass)' : 'var(--border)'}; background: ${isPro ? 'rgba(16, 185, 129, 0.03)' : 'var(--bg-sidebar)'};">
                         <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h3 style="margin: 0; font-size: 1.1rem; color: ${isPro ? 'var(--primary-light)' : 'var(--white)'};">
                                    ${isPro ? 'Compte SoloPrice PRO' : 'Compte Standard'}
                                </h3>
                                <p style="font-size: 0.85rem; color: var(--text-muted); margin: 4px 0 0 0;">
                                    ${isPro ? `Clé active: ${user.licenseKey}` : 'Limite de 5 clients et 3 devis'}
                                </p>
                            </div>
                            ${isPro ? '<span class="pro-badge" style="padding: 4px 10px; font-size: 0.7rem;">PRO ACTIF</span>' : '<button class="button-primary small" onclick="App.showUpgradeModal()">Upgrade</button>'}
                         </div>
                    </div>
                </div>

                <!-- Right: Branding Preview -->
                <div class="branding-preview-section">
                    <div class="sticky-top" style="position: sticky; top: 2rem;">
                        <h2 class="section-title-small" style="margin-bottom: 1.5rem;">Aperçu de Marque</h2>
                        <div id="identity-card-preview" class="identity-card premium-glass" style="width: 100%;">
                            <div class="card-glow"></div>
                            <div class="card-header">
                                <div id="card-logo" class="card-logo">
                                    <!-- Placeholder or Logo image -->
                                </div>
                                <div class="card-badge">${isPro ? 'PRO ACCOUNT' : 'FREE USER'}</div>
                            </div>
                            <div class="card-body">
                                <div id="card-name" class="card-name"></div>
                                <div id="card-address" class="card-info"><i class="fas fa-map-marker-alt"></i> <span></span></div>
                                <div id="card-contact" class="card-info"><i class="fas fa-envelope"></i> <span></span></div>
                            </div>
                            <div class="card-footer">
                                <div id="card-siret" class="card-siret"></div>
                                <div class="card-verify"><i class="fas fa-check-circle"></i> Identité Vérifiée</div>
                            </div>
                        </div>
                        
                        <div class="preview-tip" style="margin-top: 2.5rem; padding: 1.5rem; background: var(--bg-card); border: 1px solid var(--border); border-radius: 16px;">
                            <h4 style="margin-bottom: 1rem; font-size: 0.95rem;">💡 Pourquoi compléter ce profil ?</h4>
                            <ul style="font-size: 0.85rem; color: var(--text-muted); padding-left: 1.2rem; display: grid; gap: 0.75rem;">
                                <li><strong>Crédibilité</strong> : Votre logo et SIRET apparaissent sur vos PDF.</li>
                                <li><strong>Gain de Temps</strong> : Vos coordonnées sont pré-remplies partout.</li>
                                <li><strong>Conformité</strong> : Les mentions légales sont obligatoires pour vos factures.</li>
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        `;

        this.updatePreview();
    },

    updatePreview() {
        const form = document.getElementById('company-form');
        if (!form) return;

        const name = form.querySelector('[name="name"]').value || 'Votre Entreprise';
        const address = form.querySelector('[name="address"]').value || 'Votre adresse ici';
        const email = form.querySelector('[name="email"]').value || 'votre@email.com';
        const siret = form.querySelector('[name="siret"]').value;
        const logo = document.getElementById('logo-base64').value;

        const cardName = document.getElementById('card-name');
        const cardAddress = document.getElementById('card-address');
        const cardContact = document.getElementById('card-contact');
        const cardSiret = document.getElementById('card-siret');
        const cardLogo = document.getElementById('card-logo');

        if (cardName) cardName.textContent = name;
        if (cardAddress) cardAddress.querySelector('span').textContent = address;
        if (cardContact) cardContact.querySelector('span').textContent = email;
        if (cardSiret) cardSiret.textContent = siret ? `SIRET: ${siret}` : 'SIRET: non défini';

        if (cardLogo) {
            if (logo) {
                cardLogo.innerHTML = `<img src="${logo}" style="width:100%; height:100%; object-fit:contain;">`;
            } else {
                const initial = name.charAt(0).toUpperCase();
                cardLogo.innerHTML = `<div class="logo-placeholder">${initial}</div>`;
            }
        }
    },

    save(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);

        const companyData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: formData.get('address'),
            siret: formData.get('siret') || '',
            footer_mentions: formData.get('footer_mentions') || '',
            logo: formData.get('logo') || ''
        };

        Storage.updateUser({ company: companyData });
        App.renderUserInfo();
        App.showNotification('Profil mis à jour', 'success');
        this.render();
    },

    handleLogoUpload(e) {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 500 * 1024) {
            App.showNotification('Image trop lourde (500KB max)', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target.result;
            document.getElementById('logo-base64').value = base64;
            document.getElementById('logo-preview').innerHTML = `<img src="${base64}" style="width:100%; height:100%; object-fit:contain;">`;
            App.showNotification('Logo chargé. N\'oubliez pas d\'enregistrer.', 'info');
            this.updatePreview();
        };
        reader.readAsDataURL(file);
    },

    removeLogo() {
        document.getElementById('logo-base64').value = '';
        document.getElementById('logo-preview').innerHTML = '<i class="fas fa-image" style="font-size: 24px; color: #ccc;"></i>';
        App.showNotification('Logo supprimé. N\'oubliez pas d\'enregistrer.', 'info');
        this.updatePreview();
    }
};

window.Profile = Profile;

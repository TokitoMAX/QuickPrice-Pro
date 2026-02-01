/**
 * SoloPrice Pro - Territorial Tax Engine
 * Manages specific tax rules for DOM-TOM, France, and Africa contexts.
 */
const TaxEngine = {
    contexts: {
        'FR-METRO': { name: 'France (Métropole)', vat: 20, description: 'TVA standard 20%', code: 'FR' },
        'FR-REUNION': { name: 'La Réunion', vat: 8.5, description: 'TVA 8.5% (Taux normal)', code: 'REU' },
        'FR-GUADELOUPE': { name: 'Guadeloupe', vat: 8.5, description: 'TVA 8.5% (Taux normal)', code: 'GUA' },
        'FR-MARTINIQUE': { name: 'Martinique', vat: 8.5, description: 'TVA 8.5% (Taux normal)', code: 'MAR' },
        'FR-GUYANE': { name: 'Guyane', vat: 0, description: 'Exonéré de TVA', code: 'GUY' },
        'AFRICA-GENERAL': { name: 'Afrique (H. TVA)', vat: 0, description: 'Export de services - HT', code: 'AFR' }
    },

    currentContext: 'FR-METRO',

    init() {
        const saved = localStorage.getItem('sp_tax_context');
        if (saved) {
            this.currentContext = saved;
        }
    },

    setContext(ctxId) {
        if (this.contexts[ctxId]) {
            this.currentContext = ctxId;
            localStorage.setItem('sp_tax_context', ctxId);
            return true;
        }
        return false;
    },

    getCurrent() {
        return this.contexts[this.currentContext];
    },

    calculate(amountHT) {
        const ctx = this.getCurrent();
        const taxAmount = (amountHT * ctx.vat) / 100;
        return {
            ht: amountHT,
            vat: taxAmount,
            ttc: amountHT + taxAmount,
            description: ctx.description
        };
    },

    renderSelector(containerId, onchange) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="tax-selector-group">
                <label class="form-label">Régime Fiscal / Zone</label>
                <select class="form-input" id="tax-context-select">
                    ${Object.entries(this.contexts).map(([id, ctx]) => `
                        <option value="${id}" ${id === this.currentContext ? 'selected' : ''}>
                            ${ctx.name} (${ctx.vat}%)
                        </option>
                    `).join('')}
                </select>
                <p class="text-xs text-muted" id="tax-context-desc">${this.getCurrent().description}</p>
            </div>
        `;

        const select = document.getElementById('tax-context-select');
        select.addEventListener('change', (e) => {
            this.setContext(e.target.value);
            document.getElementById('tax-context-desc').textContent = this.getCurrent().description;
            if (onchange) onchange(e.target.value);
        });
    }
};

TaxEngine.init();
window.TaxEngine = TaxEngine;

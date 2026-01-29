// QuickPrice Pro - Project Scoper Module
// Outil d'estimation intelligente de projets

const Scoper = {
    tasks: [],

    render() {
        const container = document.getElementById('scoper-content');
        if (!container) return;

        container.innerHTML = `
            <div class="page-header">
                <div>
                    <h1 class="page-title">Estimateur de Projet</h1>
                    <p class="page-subtitle">Calculez une estimation juste basée sur l'incertitude</p>
                </div>
                <!-- <button class="button-secondary" onclick="Scoper.clear()">
                    Tout effacer
                </button> -->
            </div>

            <div class="calculator-container" style="grid-template-columns: 1.5fr 1fr;">
                
                <!-- Task List Input -->
                <div class="calculator-inputs">
                    <div class="section-header-inline">
                        <h3>Liste des Tâches</h3>
                        <button class="button-secondary small" onclick="Scoper.addTask()">
                            Ajouter une tâche
                        </button>
                    </div>

                    <div id="scoper-tasks" class="scoper-tasks-list">
                        ${this.tasks.length === 0 ? '<div class="empty-state text-sm"><p>Ajoutez des tâches pour commencer l\'estimation</p></div>' : ''}
                    </div>
                </div>

                <!-- Results & Analysis -->
                <div class="results-panel">
                    <div class="results-header">
                        <h3 class="results-title">Estimation</h3>
                    </div>

                    <div class="result-cards">
                        <div class="result-card primary">
                            <div class="result-label">Temps Estimé (Sécurisé)</div>
                            <div class="result-value" id="scoper-total-time">0h</div>
                            <div class="result-description" id="scoper-range">Entre 0h et 0h</div>
                        </div>

                        <div class="result-card">
                            <div class="result-label">Montant Suggéré</div>
                            <div class="result-value" id="scoper-total-price">0€</div>
                            <div class="result-description">Basé sur votre TJM</div>
                        </div>
                    </div>

                    <div class="breakdown-section">
                        <h4 class="breakdown-title">Paramètres</h4>
                        <div class="input-group">
                            <label class="form-label">TJM (Tarif Journalier)</label>
                            <input type="number" id="scoper-tjm" class="form-input" value="${this.getTJM()}" onchange="Scoper.calculate()">
                        </div>
                        <div class="input-group">
                            <label class="form-label">Marge d'incertitude (%)</label>
                            <input type="number" id="scoper-buffer" class="form-input" value="20" onchange="Scoper.calculate()">
                        </div>
                    </div>

                    <div class="calculator-actions">
                        <button class="button-primary full-width" onclick="Scoper.createQuote()" ${this.tasks.length === 0 ? 'disabled' : ''} id="btn-create-quote">
                            Créer le Devis
                        </button>
                    </div>
                </div>
            </div>
        `;

        if (this.tasks.length > 0) {
            this.renderTasks();
        } else {
            // Add a default empty task
            this.addTask();
        }
    },

    getTJM() {
        const calcData = Storage.get('qp_calculator_data');
        if (calcData && calcData.hoursPerDay && calcData.monthlyRevenue) {
            // Recalculate TJM roughly if not customized
            // For simplicity, let's try to get it from the last calculator run result displayed if possible, 
            // but here we just re-estimate or default to 350
            return 400;
        }
        return 400;
    },

    addTask() {
        this.tasks.push({ name: '', min: 1, max: 2 });
        this.renderTasks();
        this.calculate();
    },

    removeTask(index) {
        this.tasks.splice(index, 1);
        this.renderTasks();
        this.calculate();
    },

    renderTasks() {
        const container = document.getElementById('scoper-tasks');
        if (!container) return;

        if (this.tasks.length === 0) {
            container.innerHTML = '<div class="empty-state text-sm"><p>Ajoutez des tâches pour commencer l\'estimation</p></div>';
            return;
        }

        container.innerHTML = this.tasks.map((task, index) => `
            <div class="scoper-task-row">
                <input type="text" placeholder="Nom de la tâche" class="form-input task-name" value="${task.name}" onchange="Scoper.updateTask(${index}, 'name', this.value)">
                <div class="task-times">
                    <div class="time-input">
                        <label>Min (h)</label>
                        <input type="number" class="form-input" value="${task.min}" min="0.5" step="0.5" onchange="Scoper.updateTask(${index}, 'min', this.value)">
                    </div>
                    <div class="time-input">
                        <label>Max (h)</label>
                        <input type="number" class="form-input" value="${task.max}" min="0.5" step="0.5" onchange="Scoper.updateTask(${index}, 'max', this.value)">
                    </div>
                </div>
                <button class="btn-icon btn-danger" onclick="Scoper.removeTask(${index})">Supprimer</button>
            </div>
        `).join('');

        // Improve styling for rows
        const style = document.createElement('style');
        if (!document.getElementById('scoper-styles')) {
            style.id = 'scoper-styles';
            style.textContent = `
                .scoper-task-row {
                    display: grid;
                    grid-template-columns: 2fr 1.5fr auto;
                    gap: 1rem;
                    background: var(--dark);
                    padding: 1rem;
                    border-radius: 10px;
                    margin-bottom: 0.8rem;
                    align-items: center;
                    border: 1px solid var(--border);
                }
                .task-times {
                    display: flex;
                    gap: 0.5rem;
                }
                .time-input label {
                    font-size: 0.7rem;
                    color: var(--text-muted);
                    display: block;
                    margin-bottom: 2px;
                }
                .full-width { width: 100%; }
                .small { padding: 0.4rem 0.8rem; font-size: 0.8rem; }
            `;
            document.head.appendChild(style);
        }
    },

    updateTask(index, field, value) {
        if (field === 'name') this.tasks[index].name = value;
        else this.tasks[index][field] = parseFloat(value) || 0;

        this.calculate();
    },

    calculate() {
        const tjm = parseFloat(document.getElementById('scoper-tjm').value) || 0;
        const buffer = parseFloat(document.getElementById('scoper-buffer').value) || 0;

        let totalMin = 0;
        let totalMax = 0;

        this.tasks.forEach(t => {
            totalMin += t.min;
            totalMax += t.max;
        });

        // PERT-like estimate or just Safe Estimate (Max + Buffer)
        // Let's do a "Safe Estimate" = Max + (Max - Min)*0.2 (Uncertainty)
        // Or simple: Average of inputs + buffer

        const avg = (totalMin + totalMax) / 2;
        const uncertainty = totalMax - totalMin;

        // Logic: We aim for the upper bound to be safe, plus a buffer percentage
        const safeHours = totalMax * (1 + buffer / 100);

        const price = (safeHours / 7) * tjm; // Assuming 7h days

        document.getElementById('scoper-total-time').textContent = `${Math.ceil(safeHours)}h`;
        document.getElementById('scoper-range').textContent = `Min: ${totalMin}h - Max: ${totalMax}h`;
        document.getElementById('scoper-total-price').textContent = App.formatCurrency(price);

        const btn = document.getElementById('btn-create-quote');
        if (btn) btn.disabled = this.tasks.length === 0;
    },

    createQuote() {
        const tjm = parseFloat(document.getElementById('scoper-tjm').value) || 0;
        const buffer = parseFloat(document.getElementById('scoper-buffer').value) || 0;

        // Prepare quote items
        const quoteItems = [];

        this.tasks.forEach(task => {
            if (!task.name) return;
            // Estimate for this task (taking the max + pro-rated buffer)
            const hours = task.max * (1 + buffer / 100);
            const days = hours / 7;
            const price = days * tjm; // This would be the total price for this task

            // We can add it as days or flat fee. Let's do flat fee based on estimate
            quoteItems.push({
                description: `${task.name} (Est. ${task.max}h)`,
                quantity: 1, // Flat fee
                unitPrice: price
            });
        });

        if (quoteItems.length > 0) {
            // Store as draft items
            // Since `qp_draft_quote_item` expects a single object in our previous logic,
            // we might want to update quotes.js to handle an array OR modify scoper to merge.
            // Let's try to update quotes.js to handle arrays first, OR just check if I can pass array.
            // Checking quotes.js... it does `this.currentItems = [draftItem]`. It supports one item.
            // Let's improve the storage key to be `qp_draft_quote_items` (plural) to support multiple.

            Storage.set('qp_draft_quote_items', quoteItems);
            App.navigateTo('quotes');
            if (typeof Quotes !== 'undefined') {
                Quotes.showAddForm();
            }
        }
    }
};

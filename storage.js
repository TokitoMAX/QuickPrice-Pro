// QuickPrice Pro - Storage Manager
// Gestion centralisée des données avec localStorage

const Storage = {
    // Clés de stockage
    KEYS: {
        USER: 'qp_user',
        CLIENTS: 'qp_clients',
        QUOTES: 'qp_quotes',
        INVOICES: 'qp_invoices',
        SERVICES: 'qp_services', // New Key
        REVENUES: 'qp_revenues',
        EXPENSES: 'qp_expenses',
        SETTINGS: 'qp_settings'
    },

    // Initialisation
    init() {
        if (!this.get(this.KEYS.USER)) {
            this.set(this.KEYS.USER, {
                isPro: false,
                licenseKey: null,
                activatedAt: null,
                company: {
                    name: '',
                    email: '',
                    phone: '',
                    address: '',
                    siret: '',
                    logo: null
                }
            });
        }

        if (!this.get(this.KEYS.SETTINGS)) {
            this.set(this.KEYS.SETTINGS, {
                currency: '€',
                taxRate: 20,
                invoicePrefix: 'FACT-',
                quotePrefix: 'DEV-',
                theme: 'dark'
            });
        }

        // Initialiser les collections vides si nécessaire
        ['CLIENTS', 'QUOTES', 'INVOICES', 'SERVICES', 'REVENUES', 'EXPENSES'].forEach(key => {
            if (!this.get(this.KEYS[key])) {
                this.set(this.KEYS[key], []);
            }
        });
    },

    // Méthodes génériques
    get(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Error reading from storage:', e);
            return null;
        }
    },

    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (e) {
            console.error('Error writing to storage:', e);
            return false;
        }
    },

    // Méthodes utilisateur
    getUser() {
        return this.get(this.KEYS.USER);
    },

    updateUser(userData) {
        const current = this.getUser();
        this.set(this.KEYS.USER, { ...current, ...userData });
    },

    isPro() {
        return true; // TEMPORARY: Force Pro mode for demo
        /*
        const user = this.getUser();
        return user && user.isPro === true;
        */
    },

    activatePro(licenseKey) {
        this.updateUser({
            isPro: true,
            licenseKey: licenseKey,
            activatedAt: new Date().toISOString()
        });
    },

    // Méthodes clients
    getClients() {
        return this.get(this.KEYS.CLIENTS) || [];
    },

    getClient(id) {
        return this.getClients().find(c => c.id === id);
    },

    addClient(client) {
        const clients = this.getClients();
        const newClient = {
            id: this.generateId(),
            ...client,
            createdAt: new Date().toISOString()
        };
        clients.push(newClient);
        this.set(this.KEYS.CLIENTS, clients);
        return newClient;
    },

    updateClient(id, updates) {
        const clients = this.getClients();
        const index = clients.findIndex(c => c.id === id);
        if (index !== -1) {
            clients[index] = { ...clients[index], ...updates };
            this.set(this.KEYS.CLIENTS, clients);
            return clients[index];
        }
        return null;
    },

    deleteClient(id) {
        const clients = this.getClients().filter(c => c.id !== id);
        this.set(this.KEYS.CLIENTS, clients);
    },

    // Méthodes devis
    getQuotes() {
        return this.get(this.KEYS.QUOTES) || [];
    },

    getQuote(id) {
        return this.getQuotes().find(q => q.id === id);
    },

    addQuote(quote) {
        const quotes = this.getQuotes();
        const settings = this.get(this.KEYS.SETTINGS);
        const number = quotes.length + 1;

        const newQuote = {
            id: this.generateId(),
            number: `${settings.quotePrefix}${String(number).padStart(4, '0')}`,
            ...quote,
            createdAt: new Date().toISOString(),
            status: quote.status || 'draft'
        };
        quotes.push(newQuote);
        this.set(this.KEYS.QUOTES, quotes);
        return newQuote;
    },

    updateQuote(id, updates) {
        const quotes = this.getQuotes();
        const index = quotes.findIndex(q => q.id === id);
        if (index !== -1) {
            quotes[index] = { ...quotes[index], ...updates };
            this.set(this.KEYS.QUOTES, quotes);
            return quotes[index];
        }
        return null;
    },

    deleteQuote(id) {
        const quotes = this.getQuotes().filter(q => q.id !== id);
        this.set(this.KEYS.QUOTES, quotes);
    },

    // Méthodes factures
    getInvoices() {
        return this.get(this.KEYS.INVOICES) || [];
    },

    getInvoice(id) {
        return this.getInvoices().find(i => i.id === id);
    },

    addInvoice(invoice) {
        const invoices = this.getInvoices();
        const settings = this.get(this.KEYS.SETTINGS);
        const number = invoices.length + 1;

        const newInvoice = {
            id: this.generateId(),
            number: `${settings.invoicePrefix}${String(number).padStart(4, '0')}`,
            ...invoice,
            createdAt: new Date().toISOString(),
            status: invoice.status || 'draft'
        };
        invoices.push(newInvoice);
        this.set(this.KEYS.INVOICES, invoices);
        return newInvoice;
    },

    updateInvoice(id, updates) {
        const invoices = this.getInvoices();
        const index = invoices.findIndex(i => i.id === id);
        if (index !== -1) {
            invoices[index] = { ...invoices[index], ...updates };
            this.set(this.KEYS.INVOICES, invoices);
            return invoices[index];
        }
        return null;
    },

    deleteInvoice(id) {
        const invoices = this.getInvoices().filter(i => i.id !== id);
        this.set(this.KEYS.INVOICES, invoices);
    },

    // Méthodes Service Catalog
    getServices() {
        return this.get(this.KEYS.SERVICES) || [];
    },

    addService(service) {
        const services = this.getServices();
        const newService = {
            id: this.generateId(),
            ...service,
            createdAt: new Date().toISOString()
        };
        services.push(newService);
        this.set(this.KEYS.SERVICES, services);
        return newService;
    },

    deleteService(id) {
        const services = this.getServices().filter(s => s.id !== id);
        this.set(this.KEYS.SERVICES, services);
    },

    // Statistiques
    getStats() {
        const invoices = this.getInvoices();
        const quotes = this.getQuotes();
        const clients = this.getClients();

        // CA du mois en cours
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthlyRevenue = invoices
            .filter(i => {
                const date = new Date(i.createdAt);
                return i.status === 'paid' &&
                    date.getMonth() === currentMonth &&
                    date.getFullYear() === currentYear;
            })
            .reduce((sum, i) => sum + (i.total || 0), 0);

        // Factures impayées
        const unpaidInvoices = invoices.filter(i =>
            i.status === 'sent' || i.status === 'overdue'
        );
        const unpaidAmount = unpaidInvoices.reduce((sum, i) => sum + (i.total || 0), 0);

        return {
            totalClients: clients.length,
            totalQuotes: quotes.length,
            totalInvoices: invoices.length,
            monthlyRevenue,
            unpaidAmount,
            unpaidCount: unpaidInvoices.length
        };
    },

    // Utilitaires
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    // Export/Import
    exportAll() {
        const data = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            user: this.get(this.KEYS.USER),
            settings: this.get(this.KEYS.SETTINGS),
            clients: this.get(this.KEYS.CLIENTS),
            quotes: this.get(this.KEYS.QUOTES),
            invoices: this.get(this.KEYS.INVOICES),
            revenues: this.get(this.KEYS.REVENUES),
            expenses: this.get(this.KEYS.EXPENSES)
        };
        return JSON.stringify(data, null, 2);
    },

    importAll(jsonData) {
        try {
            const data = JSON.parse(jsonData);

            // Validation basique
            if (!data.version) throw new Error('Invalid data format');

            // Import
            Object.keys(this.KEYS).forEach(key => {
                const dataKey = key.toLowerCase();
                if (data[dataKey]) {
                    this.set(this.KEYS[key], data[dataKey]);
                }
            });

            return true;
        } catch (e) {
            console.error('Import error:', e);
            return false;
        }
    },

    // Reset complet (pour debug)
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        this.init();
    }
};

// Auto-initialisation
Storage.init();

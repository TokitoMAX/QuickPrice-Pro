const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050; // Changé de 5000 à 5050

// Supabase Initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Erreur: SUPABASE_URL et SUPABASE_ANON_KEY doivent être définis dans le fichier .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);
app.set('supabase', supabase);

// Middleware de Logging pour débugger les requêtes
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

app.use(cors());
app.use(express.json());

// 1. API Routes (FIRST)
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

const authRoutes = require('./backend/routes/auth');
app.use('/api/auth', authRoutes);

// RE-DEFINITION DIRECTE POUR FIABILITÉ MAXIMALE
app.post('/api/auth/register', async (req, res) => {
    console.log(`📡 [SERVER] RECU POST /api/auth/register`);
    const { email, password, company } = req.body;
    try {
        const { data, error } = await supabase.auth.signUp({
            email, password,
            options: { data: { company_name: company?.name || '', is_pro: false } }
        });
        if (error) throw error;
        if (!data.user) return res.status(200).json({ message: "Vérifiez vos emails.", requiresConfirmation: true });
        res.status(201).json({ user: data.user, session: data.session });
    } catch (error) {
        console.error('❌ Erreur Inscription:', error.message);
        res.status(400).json({ message: error.message });
    }
});

// Test route directe
app.post('/api/test-direct', (req, res) => {
    console.log("🚀 POST /api/test-direct REACHED!");
    res.json({ message: "Le serveur accepte bien les POST sur /api/" });
});

// 2. Static Files
app.use(express.static(process.cwd()));

// 3. SPA Fallback (LAST)
app.use((req, res, next) => {
    if (req.path.startsWith('/api/')) {
        // Si on arrive ici pour un /api/, c'est que la route n'existe pas
        console.warn(`[404] API route not found: ${req.method} ${req.path}`);
        return res.status(404).json({ message: `API route ${req.method} ${req.path} non trouvée.` });
    }
    res.sendFile(path.join(process.cwd(), 'index.html'));
});

// Global Error Handler to prevent empty responses
app.use((err, req, res, next) => {
    console.error('💥 Server Error:', err);
    res.status(500).json({
        message: 'Une erreur interne est survenue sur le serveur.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`\n🚀  QuickPrice Pro est prêt sur http://localhost:${PORT}`);
        console.log(`Mode: Professional Backend (Supabase Auth)\n`);
    });
}

// Export for Vercel
module.exports = app;

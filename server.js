require('dotenv').config();
const express = require('express');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Initialize Supabase Client for the backend
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Rendre supabase disponible pour les routes
app.set('supabase', supabase);

// Auth Routes
const authRoutes = require('./backend/routes/auth.js');
app.use('/api/auth', authRoutes);

// Point d'entrée principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`\n🚀  QuickPrice Pro est prêt sur http://localhost:${PORT}`);
    console.log(`Mode: API Integrated Backend (Pro)\n`);
});

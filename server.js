require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const authRoutes = require('./backend/routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey || supabaseKey.includes('your_supabase_anon_key')) {
    console.warn('⚠️ SUPABASE_URL or SUPABASE_ANON_KEY missing in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Make supabase accessible in routes
app.set('supabase', supabase);

// Routes
app.use('/api/auth', authRoutes);

// Serve index.html for any unknown route (SPA fallback)
app.get('*all', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});

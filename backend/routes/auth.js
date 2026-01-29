const express = require('express');
const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user via Supabase
// @access  Public
router.post('/register', async (req, res) => {
    const { email, password, company } = req.body;
    const supabase = req.app.get('supabase');

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    company_name: company?.name || '',
                    is_pro: false
                }
            }
        });

        if (error) throw error;

        res.status(201).json({
            id: data.user.id,
            email: data.user.email,
            company: { name: data.user.user_metadata.company_name },
            isPro: data.user.user_metadata.is_pro,
            token: data.session?.access_token
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// @route   POST /api/auth/login
// @desc    Auth user & get token via Supabase
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const supabase = req.app.get('supabase');

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) throw error;

        res.json({
            id: data.user.id,
            email: data.user.email,
            company: { name: data.user.user_metadata.company_name },
            isPro: data.user.user_metadata.is_pro,
            token: data.session.access_token
        });
    } catch (error) {
        res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
});

// @route   GET /api/auth/me
// @desc    Get user profile (simplified for Supabase)
// @access  Private (Needs token check)
router.get('/me', async (req, res) => {
    const supabase = req.app.get('supabase');
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Non autorisé' });
    }

    try {
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error) throw error;

        res.json({
            id: user.id,
            email: user.email,
            company: { name: user.user_metadata.company_name },
            isPro: user.user_metadata.is_pro
        });
    } catch (error) {
        res.status(401).json({ message: 'Session invalide' });
    }
});

module.exports = router;

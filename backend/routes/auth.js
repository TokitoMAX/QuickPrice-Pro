const express = require('express');
const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
    console.log(`[Auth Router] ${req.method} ${req.path}`);
    next();
});

// @route   POST /api/auth/register
// @desc    Register a new user via Supabase
// @access  Public
router.post('/register', async (req, res) => {
    const { email, password, company } = req.body;
    const supabase = req.app.get('supabase');

    try {
        console.log(`📝 Inscription demandée pour: ${email}`);

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

        if (error) {
            console.error('❌ Supabase Auth Error:', error.message);
            throw error;
        }

        // Si la confirmation d'email est activée, data.user peut exister mais data.session sera null.
        // Ou data.user peut être null si le compte n'est pas créé immédiatement.
        console.log('✅ Supabase data:', JSON.stringify(data));

        if (!data.user) {
            return res.status(200).json({
                message: "Inscription réussie ! Veuillez vérifier vos emails pour confirmer votre compte.",
                requiresConfirmation: true
            });
        }

        res.status(201).json({
            user: {
                id: data.user.id,
                email: data.user.email,
                user_metadata: data.user.user_metadata
            },
            session: data.session ? {
                access_token: data.session.access_token
            } : null,
            message: !data.session ? "Veuillez confirmer votre email." : undefined
        });
    } catch (error) {
        console.error('💥 Catch Error /register:', error);
        res.status(400).json({ message: error.message || 'Erreur inconnue lors de l\'inscription' });
    }
});

// @route   POST /api/auth/login
// @desc    Auth user & get token via Supabase
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const supabase = req.app.get('supabase');

    try {
        console.log(`🔑 Tentative de connexion pour: ${email}`);
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error('❌ Login error:', error.message);
            throw error;
        }

        res.json({
            user: {
                id: data.user.id,
                email: data.user.email,
                user_metadata: data.user.user_metadata
            },
            session: {
                access_token: data.session.access_token
            }
        });
    } catch (error) {
        console.error('💥 Catch Error /login:', error);
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
            user: {
                id: user.id,
                email: user.email,
                user_metadata: {
                    company_name: user.user_metadata.company_name,
                    is_pro: user.user_metadata.is_pro
                }
            }
        });
    } catch (error) {
        res.status(401).json({ message: 'Session invalide' });
    }
});

module.exports = router;

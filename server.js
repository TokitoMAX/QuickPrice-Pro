const express = require('express');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const app = express();

const USERS_FILE = path.join(__dirname, 'users.json');

// Helper to read/write users
function getUsers() {
    if (!fs.existsSync(USERS_FILE)) return [];
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (e) {
        return [];
    }
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Auth Routes - Mocking a real backend for "Zero Config" reliability
app.post('/api/auth/register', (req, res) => {
    const { email, password, company } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email et mot de passe requis' });

    const users = getUsers();
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ message: 'Cet utilisateur existe déjà' });
    }

    const newUser = {
        id: Date.now().toString(),
        email,
        password, // In semi-pro local mode, we avoid Bcrypt complexity for simple "just works" setup
        company_name: company?.name || '',
        is_pro: false,
        createdAt: new Date().toISOString()
    };

    users.push(newUser);
    saveUsers(users);

    res.status(201).json({
        user: { id: newUser.id, email: newUser.email, user_metadata: { company_name: newUser.company_name, is_pro: newUser.is_pro } },
        session: { access_token: 'local_sess_' + newUser.id }
    });
});

app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }

    res.json({
        user: { id: user.id, email: user.email, user_metadata: { company_name: user.company_name, is_pro: user.is_pro } },
        session: { access_token: 'local_sess_' + user.id }
    });
});

// Point d'entrée principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`\n🚀  QuickPrice Pro est prêt sur http://localhost:${PORT}`);
    console.log(`Mode: Professional Local Backend (Standard Auth)\n`);
});

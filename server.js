const express = require('express');
const path = require('path');
const app = express();

// Sert tout le répertoire courant comme fichiers statiques
app.use(express.static(__dirname));

// Point d'entrée principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`\n🚀  QuickPrice Pro est prêt sur http://localhost:${PORT}`);
    console.log(`Mode: Direct Supabase Integration (Stable)\n`);
});

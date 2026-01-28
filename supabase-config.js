// Supabase Configuration Loader
const CONFIG_KEY = 'qp_supabase_config';
let savedConfig = JSON.parse(localStorage.getItem(CONFIG_KEY) || '{}');

console.log("Loading Supabase Config...");

// 1. Check if hardcoded values are valid (not placeholders)
let url = 'https://kisldntelhrnilrihelr.supabase.co';
let key = 'sb_publishable_Fy9VImo4K_Xlqbx4d-L8jw_B3VwLm_8'; // User provided key

// 2. Override with saved config if available
if (savedConfig.url) url = savedConfig.url;
if (savedConfig.key && savedConfig.key !== 'YOUR_SUPABASE_ANON_KEY_HERE') key = savedConfig.key;

// 3. Prompt user if still missing
// Only prompt if we are in a browser environment
if (typeof window !== 'undefined') {
    if (url === 'YOUR_SUPABASE_URL_HERE' || !url.startsWith('http')) {
        url = prompt("Configuration manquante: Veuillez entrer votre URL Supabase (ex: https://xyz.supabase.co) :");
        if (url) {
            // Remove trailing slash if present
            url = url.replace(/\/$/, "");
            savedConfig.url = url;
            localStorage.setItem(CONFIG_KEY, JSON.stringify(savedConfig));
        }
    }

    if (key === 'YOUR_SUPABASE_ANON_KEY_HERE') {
        key = prompt("Configuration manquante: Veuillez entrer votre Clé API Supabase (Anon/Public) :");
        if (key) {
            savedConfig.key = key;
            localStorage.setItem(CONFIG_KEY, JSON.stringify(savedConfig));
        }
    }
}

// 4. Validate final config
if (!url || url === 'YOUR_SUPABASE_URL_HERE' || !key || key === 'YOUR_SUPABASE_ANON_KEY_HERE') {
    const errorMsg = "🛑 Erreur Critique : Impossible de démarrer sans URL et Clé Supabase. Rechargez la page pour réessayer.";
    console.error(errorMsg);
    alert(errorMsg);
    throw new Error("Supabase config missing");
}

// Initialize
window.supabase = window.supabase.createClient(url, key);
console.log("✅ Supabase initialized with:", url);

// Export for global usage if needed (though window.supabase is used internally by createClient)
window.supabaseClient = window.supabase;

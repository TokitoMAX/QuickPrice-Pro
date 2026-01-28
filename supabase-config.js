// Supabase Configuration
// Force clear old config if present to avoid conflicts
localStorage.removeItem('qp_supabase_config');

const SUPABASE_URL = 'https://kisldntelhrnilrihelr.supabase.co';
const SUPABASE_KEY = 'sb_publishable_Fy9VImo4K_Xlqbx4d-L8jw_B3VwLm_8';

console.log("Initializing Supabase with URL:", SUPABASE_URL);

// Initialize
if (!window.supabase) {
    console.error("Supabase SDK not loaded!");
    alert("Erreur: Le SDK Supabase n'est pas chargé. Vérifiez votre connexion internet.");
} else {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("✅ Supabase initialized successfully");
}

// Global alias for compatibility
window.supabase = window.supabaseClient;

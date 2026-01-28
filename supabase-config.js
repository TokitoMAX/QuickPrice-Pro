const SUPABASE_URL = 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_KEY = 'sb_publishable_Fy9VImo4K_Xlqbx4d-L8jw_B3VwLm_8';

// Initialize Supabase client
// Initialize Supabase client
if (SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE') {
    const errorMsg = "CRITICAL ERROR: Supabase URL is missing. Please edit supabase-config.js and add your project URL (e.g. https://xyz.supabase.co).";
    console.error(errorMsg);
    alert(errorMsg);
}

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("Supabase initialized");

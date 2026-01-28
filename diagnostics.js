(function () {
    console.log("--- DIAGNOSTICS START ---");
    let report = "Diagnostic Report:\n";

    // 1. Check Supabase SDK
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        report += "✅ SDK Loaded (window.supabase is SDK logic)\n";
    } else if (window.supabase && window.supabase.auth) {
        report += "⚠️ window.supabase is ALREADY an instance (Config ran?)\n";
    } else {
        report += "❌ Supabase SDK NOT found on window.supabase\n";
    }

    // 2. Check Configured Client
    if (window.supabaseClient) {
        report += "✅ window.supabaseClient is defined\n";
        if (window.supabaseClient.auth) {
            report += "  ✅ Client has .auth method\n";
        } else {
            report += "  ❌ Client missing .auth method\n";
        }
    } else {
        report += "❌ window.supabaseClient is UNDEFINED (Config failed)\n";
    }

    // 3. Check Auth Object
    if (window.Auth) {
        report += "✅ window.Auth is defined\n";
    } else {
        report += "❌ window.Auth is UNDEFINED (Script failed)\n";
    }

    // 4. Check Modals
    const loginModal = document.getElementById('login-modal');
    if (loginModal) {
        report += "✅ Login Modal found in DOM\n";
    } else {
        report += "❌ Login Modal NOT found in DOM\n";
    }

    console.log(report);
    alert(report);
})();

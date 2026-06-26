// // CONFIGURAZIONE SUPABASE
const SUPABASE_URL = "https://ythbvncnrklztxkgaiqo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."; // La tua chiave intera

// CAMBIA IL NOME QUI: da 'supabase' a 'supabaseClient'
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Switch tra form di Login e Registrazione
function toggleForm() {
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('register-form').classList.toggle('hidden');
}

// 1. LOGIN
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (!email || !password) return alert("Inserisci email e password!");

    // AGGIORNA ANCHE QUI: usa supabaseClient
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) return alert("Errore di accesso: " + error.message);
    window.location.href = "dashboard.html";
}

// 2. REGISTRAZIONE
async function registrati() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    if (!email || !password) return alert("Compila tutti i campi!");

    // AGGIORNA ANCHE QUI: usa supabaseClient
    const { data, error } = await supabaseClient.auth.signUp({ email, password });

    if (error) return alert("Errore di registrazione: " + error.message);
    alert("Registrazione avvenuta con successo! Controlla la tua email.");
}

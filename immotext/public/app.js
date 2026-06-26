// CONFIGURAZIONE SUPABASE
const SUPABASE_URL = "https://ythbvncnrklztxkgaiqo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0aGJ2bmNucmtsenR4a2dhaXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTk1NzYsImV4cCI6MjA5Nzk5NTU3Nn0.e_0NMm-jrXctHlrfJTkz-HxI-yh8asCp7aftmSYz6ow";

// Usiamo 'supabaseClient' così non va in conflitto con il pacchetto ufficiale alla riga 7!
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

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    
    if (error) return alert("Errore di accesso: " + error.message);
    window.location.href = "dashboard.html";
}

// 2. REGISTRAZIONE
async function registrati() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    
    if (!email || !password) return alert("Compila tutti i campi!");

    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    
    if (error) return alert("Errore di registrazione: " + error.message);
    alert("Registrazione completata! Ora puoi accedere.");
    toggleForm();
}

// VERIFICA SE UTENTE LOGGATO
async function verificaAutenticazione() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (!session && !window.location.pathname.includes('index.html')) {
        window.location.href = "index.html";
    }
}

// Avvia il controllo appena il file viene caricato
verificaAutenticazione();

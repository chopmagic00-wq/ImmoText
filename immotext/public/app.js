// CONFIGURAZIONE SUPABASE (Sostituisci con le tue chiavi reali)
const SUPABASE_URL = "https://ythbvncnrklztxkgaiqo.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0aGJ2bmNucmtsenR4a2dhaXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI0MTk1NzYsImV4cCI6MjA5Nzk5NTU3Nn0.e_0NMm-jrXctHlrfJTkz-HxI-yh8asCp7aftmSYz6ow";
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

function toggleForm() {
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('register-form').classList.toggle('hidden');
}

// 1. LOGIN
async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) return alert("Errore di accesso: " + error.message);
    window.location.href = "dashboard.html";
}

// 2. REGISTRAZIONE
async function registrati() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const { data, error } = await supabase.auth.signUp({ email, password });
    
    if (error) return alert("Errore di registrazione: " + error.message);
    alert("Registrazione completata! Ora puoi accedere.");
    toggleForm();
}

// 3. LOGOUT
async function logout() {
    await supabase.auth.signOut();
    window.location.href = "index.html";
}

// VERIFICA SE UTENTE LOGGATO
async function verificaAutenticazione() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session && !window.location.pathname.includes('index.html')) {
        window.location.href = "index.html";
    }
}

// 4. CARICA LISTA PROGETTI NELLA TABELLA
async function caricaProgetti() {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: progetti, error } = await supabase.from('progetti').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    
    const tabella = document.getElementById('tabella-progetti');
    if (!tabella) return;
    tabella.innerHTML = "";

    if (!progetti || progetti.length === 0) {
        tabella.innerHTML = `<tr><td colspan="3" class="p-4 text-center text-gray-400">Nessun immobile salvato. Creane uno ora!</td></tr>`;
        return;
    }

    progetti.forEach(p => {
        tabella.innerHTML += `
            <tr class="hover:bg-gray-50 transition border-b border-gray-100 text-gray-700">
                <td class="p-4 font-semibold text-blue-600 cursor-pointer hover:underline" onclick="apriProgetto('${p.id}')">${p.titolo}</td>
                <td class="p-4 text-sm text-gray-500">${new Date(p.created_at).toLocaleDateString()}</td>
                <td class="p-4 text-right">
                    <button onclick="eliminaProgetto('${p.id}')" class="text-red-500 hover:text-red-700 font-medium text-sm">Elimina</button>
                </td>
            </tr>
        `;
    });
}

// 5. CREA NUOVO PROGETTO (Limite 15 progetti per piano 9.99€)
async function creaNuovoProgetto() {
    const titolo = prompt("Inserisci un nome identificativo per l'immobile (es. Attico Centro):");
    if (!titolo) return;

    const { data: { user } } = await supabase.auth.getUser();

    // Controllo limite piano base
    const { count } = await supabase.from('progetti').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    if (count >= 15) {
        return alert("Hai raggiunto il limite di 15 immobili del tuo Piano Base (9,99€).");
    }

    const { data, error } = await supabase.from('progetti').insert([{ titolo, user_id: user.id }]).select();
    if (error) return alert("Errore durante la creazione del progetto.");
    
    apriProgetto(data[0].id);
}

function apriProgetto(id) {
    window.location.href = `progetto.html?id=${id}`;
}

// 6. ELIMINA PROGETTO
async function eliminaProgetto(id) {
    if (!confirm("Sei sicuro di voler eliminare questo immobile?")) return;
    await supabase.from('progetti').delete().eq('id', id);
    caricaProgetti();
}

// 7. CARICA DETTAGLI SINGOLO PROGETTO
async function caricaDatiSingoloProgetto() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    const { data: proyecto, error } = await supabase.from('progetti').select('*').eq('id', id).single();
    if (error) return window.location.href = "dashboard.html";

    document.getElementById('nome-progetto').innerText = proyecto.titolo;
    document.getElementById('mq').value = proyecto.metri_quadri || "";
    document.getElementById('stanze').value = proyecto.stanze || "";
    document.getElementById('zona').value = proyecto.zona || "";
    document.getElementById('note').value = proyecto.note_extra || "";
    if (proyecto.descrizione_ai) {
        document.getElementById('output-ai').innerText = proyecto.descrizione_ai;
        document.getElementById('output-ai').classList.remove('italic');
    }
}

// 8. SALVA E GENERA TESTO AI
async function salvaEGeneraTesto() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');

    const mq = document.getElementById('mq').value;
    const stanze = document.getElementById('stanze').value;
    const zona = document.getElementById('zona').value;
    const note = document.getElementById('note').value;

    document.getElementById('btn-genera').innerText = "⚡ Generazione in corso...";
    
    // Aggiorna dati su Supabase
    await supabase.from('progetti').update({ metri_quadri: mq, stanze, zona, note_extra: note }).eq('id', id);

    // Chiama il backend Express per simulare l'AI
    try {
        const response = await fetch('/api/genera', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ mq, stanze, zona, note })
        });
        const data = await response.json();
        
        // Salva testo finale su Supabase
        await supabase.from('progetti').update({ descrizione_ai: data.text }).eq('id', id);
        
        document.getElementById('output-ai').innerText = data.text;
        document.getElementById('output-ai').classList.remove('italic');
    } catch (e) {
        alert("Errore nella generazione del testo.");
    } finally {
        document.getElementById('btn-genera').innerText = "✨ Genera Descrizione con AI";
    }
}

function copiaTesto() {
    const testo = document.getElementById('output-ai').innerText;
    navigator.clipboard.writeText(testo);
    alert("Testo copiato negli appunti!");
}

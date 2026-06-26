// ==========================================
// 1. CONFIGURAZIONE SUPABASE
// ==========================================
const SUPABASE_URL = "https://ythbvncnrklztxkgaiqo.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0aGJ2bmNucmtsemV4a2dhaXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAxNTE0NTUsImV4cCI6MjA5NTcyNzQ1NX0.S6pcXGgIwkMxunG7ULLUQau56LNJg3pBrfXuD21xAws"; 
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

let progetti = [];

// Rileva automaticamente la pagina corrente dal nome del file nell'URL
const paginaCorrente = window.location.pathname.split("/").pop() || "index.html";

document.addEventListener("DOMContentLoaded", () => {
    controllaSessioneEInizializza();
});

// ==========================================
// 2. CONTROLLO ACCESSO AUTOMATICO
// ==========================================
async function controllaSessioneEInizializza() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        // Se siamo sulla pagina di login ma l'utente è già loggato, vai in dashboard
        if (session && (paginaCorrente === "index.html" || paginaCorrente === "login.html")) {
            window.location.href = "dashboard.html";
            return;
        }
        
        // Se l'utente NON è loggato e prova a forzare le pagine interne, rispediscilo al login
        if (!session && paginaCorrente !== "index.html" && paginaCorrente !== "login.html") {
            window.location.href = "index.html";
            return;
        }

        // Inizializza la logica specifica in base alla pagina in cui ci troviamo
        if (paginaCorrente === "dashboard.html") {
            caricaProgetti();
        } else if (paginaCorrente === "progetto.html") {
            inizializzaDettaglioProgetto();
        }
    } catch (err) {
        console.error("Errore verifica sessione:", err);
    }
}

// ==========================================
// 3. LOGICA PAGINA: LOGIN / REGISTRAZIONE
// ==========================================
function toggleForm() {
    document.getElementById('login-form').classList.toggle('hidden');
    document.getElementById('register-form').classList.toggle('hidden');
}

async function login() {
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    if (!email || !password) return alert("Inserisci email e password!");

    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) return alert("Errore di accesso: " + error.message);
    
    // Login OK -> Sposta l'agente sulla dashboard
    window.location.href = "dashboard.html";
}

async function registrati() {
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    if (!email || !password) return alert("Compila tutti i campi!");

    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) return alert("Errore: " + error.message);
    alert("Registrazione completata! Controlla la mail di conferma.");
}

async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = "index.html";
}

// ==========================================
// 4. LOGICA PAGINA: DASHBOARD (TABELLA)
// ==========================================
async function caricaProgetti() {
    const { data, error } = await supabaseClient.from('progetti').select('*').order('created_at', { ascending: false });
    if (error) return console.error("Errore caricamento:", error);
    
    progetti = data || [];
    renderTabellaProgetti();
}

function renderTabellaProgetti() {
    const tbody = document.getElementById("progetti-body");
    if (!tbody) return;
    tbody.innerHTML = "";

    if (progetti.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 24px; color: #64748b;">Nessun immobile salvato. Clicca su "Nuovo Progetto" per iniziare.</td></tr>`;
        return;
    }

    progetti.forEach(p => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td style="padding: 12px; font-weight: 600;">${p.titolo || 'Senza Titolo'}</td>
            <td style="padding: 12px;">${p.zona || '-'}</td>
            <td style="padding: 12px;">${p.metri_quadri ? p.metri_quadri + ' mq' : '-'}</td>
            <td style="padding: 12px;">${p.stanze || '-'}</td>
            <td style="padding: 12px; text-align: center;">
                <span style="padding: 4px 8px; border-radius: 12px; font-size: 0.85em; font-weight: bold; ${p.descrizione_ai ? 'background:#dcfce7; color:#15803d;' : 'background:#f1f5f9; color:#64748b;'}">
                    ${p.descrizione_ai ? 'Pronta' : 'Da scrivere'}
                </span>
            </td>
            <td style="padding: 12px; text-align: right;">
                <button onclick="vaiAlProgetto('${p.id}')" style="background: #2563eb; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 6px;">Apri Scrittura IA</button>
                <button onclick="eliminaProgetto('${p.id}')" style="background: #ef4444; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">Elimina</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

async function aggiungiProgetto() {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) return;

    const nuovoProgetto = {
        user_id: user.id,
        titolo: "Nuovo Appartamento da descrivere",
        metri_quadri: 90,
        stanze: "Quadrilocale",
        zona: "Centro",
        note_extra: "Inserisci qui dettagli speciali...",
        descrizione_ai: ""
    };

    const { data, error } = await supabaseClient.from('progetti').insert([nuovoProgetto]).select();
    if (error) return alert("Errore: " + error.message);

    if (data && data.length > 0) {
        // Vai subito alla pagina di lavoro passando l'ID nell'URL
        vaiAlProgetto(data[0].id);
    }
}

function vaiAlProgetto(id) {
    // Passiamo l'ID del progetto tramite i parametri dell'URL (?id=...)
    window.location.href = `progetto.html?id=${id}`;
}

async function eliminaProgetto(id) {
    if (!confirm("Eliminare questo annuncio?")) return;
    const { error } = await supabaseClient.from('progetti').delete().eq('id', id);
    if (error) return alert("Errore cancellazione");
    
    progetti = progetti.filter(p => p.id !== id);
    renderTabellaProgetti();
}

// ==========================================
// 5. LOGICA PAGINA: DETTAGLIO PROGETTO (LAVORO IA)
// ==========================================
async function inizializzaDettaglioProgetto() {
    // Recupera l'ID del progetto dall'URL della pagina
    const urlParams = new URLSearchParams(window.location.search);
    const idProgetto = urlParams.get('id');

    if (!idProgetto) {
        window.location.href = "dashboard.html";
        return;
    }

    // Scarica i dati aggiornati di questo specifico immobile
    const { data, error } = await supabaseClient.from('progetti').select('*').eq('id', idProgetto).single();
    if (error || !data) {
        alert("Immobile non trovato");
        window.location.href = "dashboard.html";
        return;
    }

    // Riempi i campi del form nella pagina progetto.html
    document.getElementById("p-id").value = data.id; // Campo nascosto per sicurezza
    document.getElementById("p-titolo").value = data.titolo || "";
    document.getElementById("p-zona").value = data.zona || "";
    document.getElementById("p-mq").value = data.metri_quadri || "";
    document.getElementById("p-stanze").value = data.stanze || "";
    document.getElementById("p-note").value = data.note_extra || "";
    document.getElementById("p-output-ai").value = data.descrizione_ai || "";
}

async function salvaDatiImmobile() {
    const idProgetto = document.getElementById("p-id").value;

    const datiAggiornati = {
        titolo: document.getElementById("p-titolo").value,
        zona: document.getElementById("p-zona").value,
        metri_quadri: parseInt(document.getElementById("p-mq").value) || null,
        stanze: document.getElementById("p-stanze").value,
        note_extra: document.getElementById("p-note").value,
        descrizione_ai: document.getElementById("p-output-ai").value
    };

    const { error } = await supabaseClient.from('progetti').update(datiAggiornati).eq('id', idProgetto);
    if (error) alert("Errore di salvataggio: " + error.message);
    else alert("Dati salvati correttamente!");
}

async function generaDescrizioneConIA() {
    const idProgetto = document.getElementById("p-id").value;
    const bottone = document.getElementById("btn-genera-ia");
    const outputField = document.getElementById("p-output-ai");
    
    const titolo = document.getElementById("p-titolo").value;
    const zona = document.getElementById("p-zona").value;
    const mq = document.getElementById("p-mq").value;
    const stanze = document.getElementById("p-stanze").value;
    const note = document.getElementById("p-note").value;

    bottone.innerText = "🤖 L'IA sta scrivendo l'annuncio...";
    bottone.disabled = true;

    try {
        const response = await fetch(`${SUPABASE_URL}/functions/v1/genera-descrizione-immobiliare`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ titolo, zona, mq, stanze, note })
        });

        const risultato = await response.json();
        if (!risultato.successo) throw new Error(risultato.error);

        outputField.value = risultato.testo_generato;
        
        // Salva l'output generato direttamente su Supabase
        await supabaseClient.from('progetti').update({ descrizione_ai: risultato.testo_generato }).eq('id', idProgetto);

    } catch (err) {
        alert("Errore IA: " + err.message);
    } finally {
        bottone.innerText = "✨ Genera Descrizione Efficace";
        bottone.disabled = false;
    }
}

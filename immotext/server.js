const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API simulata per l'AI
app.post('/api/genera', (req, res) => {
    const { mq, stanze, zona, note } = req.body;
    const testoFintoAI = `Splendida opportunità a ${zona || 'zona centrale'}. Immobile di ${mq || '---'} mq con ${stanze || 'vani ampi'}. Note: ${note || 'Nessuna'}`;
    res.json({ text: testoFintoAI });
});

// Serve la pagina index.html per qualsiasi altra rotta
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Avvio del server con controllo errori immediato
app.listen(PORT, (err) => {
    if (err) {
        console.error("❌ Errore durante l'avvio del server:", err);
        return;
    }
    console.log(`🚀 ImmoText attivo in locale su: http://localhost:${PORT}`);
});

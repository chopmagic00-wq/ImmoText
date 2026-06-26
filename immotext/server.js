require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

// Questo messaggio DEVE comparire appena lanci il comando
console.log("Tentativo di avvio del server ImmoText in corso...");

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.post('/api/genera', (req, res) => {
    const { mq, stanze, zona, note } = req.body;
    const testoFintoAI = `Splendida opportunità a ${zona || '[Zona N.D.]'}. Sup: ${mq || '---'} mq, locali: ${stanze || 'ampi'}. Note: ${note || 'Ottimo stato.'}`;
    res.json({ text: testoFintoAI });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 ImmoText attivo in locale su: http://localhost:${PORT}`);
});

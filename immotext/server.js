require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API per generare la descrizione immobiliare
app.post('/api/genera', (req, res) => {
    const { mq, stanze, zona, note } = req.body;

    const testoFintoAI = `Splendida opportunità immobiliare situata nella ricercata zona di ${zona || '[Zona non specificata]'}. 
    
L'immobile si sviluppa su una superficie ben distribuita di ${mq || '---'} mq ed è composto da ${stanze || 'vani ampi e luminosi'}.

Dettagli aggiuntivi: ${note || 'Finiture standard, ottima esposizione.'}

Ideale per famiglie o come investimento ad alta redditività. Contattaci per organizzare una visita immediata!`;

    res.json({ text: testoFintoAI });
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 ImmoText attivo in locale su: http://localhost:${PORT}`);
});

const express = require('express');
const cors = require('cors');
require('dotenv').config();

// 1. PRIMA CREi LA VARIABILE APP
const app = express();

app.use(express.json());
app.use(cors());
app.use(express.static(__dirname));

// Importa il pacchetto ufficiale Google Gen AI
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

// 2. POI PUOI USARE APP SENZA PROBLEMI
app.post('/api/generate', async (req, res) => {
    try {
        const { propertyType, price, sqm, writingMode, targetAudience, features } = req.body;

        const prompt = `Sei un copywriter immobiliare senior d'élite. Genera un annuncio immobiliare professionale seguendo rigorosamente queste direttive:
        - Modalità di scrittura/Stile: ${writingMode}
        - Target a cui è rivolto: ${targetAudience}
        
        Dati tecnici dell'immobile:
        - Tipologia: ${propertyType}
        - Prezzo: € ${price}
        - Superficie: ${sqm} mq
        - Punti di forza/Dettagli forniti: ${features}

        Regole di formattazione:
        1. Crea un titolo accattivante all'inizio.
        2. Sviluppa una descrizione ricca, dettagliata e coerente con la modalità "${writingMode}" scelta.
        3. Includi una sezione finale con una Call to Action (invito a contattare l'agenzia).
        4. Evita testi troppo corti o banali: approfondisci gli spazi e i vantaggi per il target "${targetAudience}".`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        res.json({ success: true, text: response.text });
    } catch (error) {
        console.error("Errore durante la generazione con Gemini:", error);
        res.status(500).json({ success: false, error: "Errore nella generazione del testo." });
    }
});

const PORT = 8000; // Oppure process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server avviato sulla porta ${PORT}`);
});
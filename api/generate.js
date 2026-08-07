const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

module.exports = async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }

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

        Regole di formattazione tassative:
        1. NON UTILIZZARE MAI IL GRASSETTO (evita qualsiasi asterisco o formattazione in grassetto nel testo).
        2. Crea un titolo accattivante all'inizio.
        3. Sviluppa una descrizione ricca, dettagliata e coerente con la modalità "${writingMode}" scelta.
        4. Includi una sezione finale con una Call to Action (invito a contattare l'agenzia).
        5. Evita testi troppo corti o banali: approfondisci gli spazi e i vantaggi per il target "${targetAudience}".`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        return res.status(200).json({ success: true, text: response.text });
    } catch (error) {
        console.error("Errore durante la generazione con Gemini:", error);
        return res.status(500).json({ success: false, error: "Errore nella generazione del testo." });
    }
};
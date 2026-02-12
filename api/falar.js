export default async function handler(req, res) {
    const { text } = req.body;
    const token = process.env.HF_TOKEN; 

    try {
        // Usando o Space oficial do S1-mini que está na sua lista
        const response = await fetch("https://fishaudio-openaudio-s1-mini.hf.space/gradio_api/call/predict", {
            method: "POST",
            headers: { 
                "Authorization": `Bearer ${token}`, 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                // Configuração padrão para o S1-mini em Português
                data: [text, "default", null, "", 1024, 0, 0.9, 1.1, 0.9, 0, "on"] 
            })
        });

        const data = await response.json();
        const eventId = data.event_id;
        
        // Loop simples para esperar o áudio ficar pronto
        let audioUrl = null;
        while (!audioUrl) {
            const result = await fetch(`https://fishaudio-openaudio-s1-mini.hf.space/gradio_api/call/predict/${eventId}`);
            const textResult = await result.text();
            const match = textResult.match(/https?:\/\/[^"']+\.(wav|mp3)/);
            if (match) audioUrl = match[0];
            else await new Promise(resolve => setTimeout(resolve, 1000)); // Espera 1s
        }

        res.status(200).json({ url: audioUrl });
    } catch (e) {
        res.status(500).json({ error: "Erro ao gerar voz S1" });
    }
}

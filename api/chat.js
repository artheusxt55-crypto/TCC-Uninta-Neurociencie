export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const { text } = req.body;
    const token = process.env.HF_TOKEN; 

    if (!token) {
        return res.status(500).json({ error: "Token não configurado na Vercel" });
    }

    try {
        const response = await fetch("https://fishaudio-openaudio-s1-mini.hf.space/gradio_api/call/predict", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                data: [
                    text,       // Texto para falar
                    "default",  // Estilo
                    null,       // Referência de áudio
                    "",         // Referência de texto
                    1024,       // Iteração
                    0,          // Seed
                    0.7,        // Top_P
                    1.1,        // Temperature
                    0.7,        // Repetition Penalty
                    0,          // Speaker ID
                    "on"        // Refine text
                ]
            })
        });

        const data = await response.json();

        if (data.event_id) {
            return res.status(200).json({ eventId: data.event_id });
        } else {
            console.error("Erro HF:", data);
            return res.status(500).json({ error: "Erro ao gerar ID da voz" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Falha na conexão com a IA" });
    }
}

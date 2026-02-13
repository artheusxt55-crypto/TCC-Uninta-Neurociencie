export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const { text } = req.body;
    const token = process.env.HF_TOKEN; // Sua chave hf_rdoh... que está na Vercel

    try {
        const response = await fetch("https://fishaudio-openaudio-s1-mini.hf.space/gradio_api/call/predict", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                data: [text, "default", null, "", 1024, 0, 0.9, 1.1, 0.9, 0, "on"]
            })
        });

        const data = await response.json();
        
        // Retorna o event_id para o seu HTML buscar o áudio depois
        if (data.event_id) {
            return res.status(200).json({ eventId: data.event_id });
        } else {
            return res.status(500).json({ error: "Erro ao gerar ID da voz" });
        }
    } catch (error) {
        return res.status(500).json({ error: "Falha na conexão com a IA" });
    }
}

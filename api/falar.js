export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const { text } = req.body;
    const token = process.env.HF_TOKEN;

    try {
        // Chamada direta simplificada
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
        const eventId = data.event_id;

        // Retornamos o ID para o navegador fazer o loop, assim a Vercel não corta a conexão por demora
        return res.status(200).json({ eventId: eventId });

    } catch (error) {
        console.error("Erro na API de Voz:", error);
        return res.status(500).json({ error: "Falha ao processar voz" });
    }
}

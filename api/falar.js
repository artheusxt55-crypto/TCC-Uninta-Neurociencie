export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const { text } = req.body;
    // Aqui o sistema vai ler a chave que você salvou na Vercel (HF_TOKEN)
    const token = process.env.HF_TOKEN;

    if (!token) return res.status(500).json({ error: "Token não configurado na Vercel" });

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
        return res.status(200).json({ eventId: data.event_id });

    } catch (error) {
        return res.status(500).json({ error: "Falha no servidor de voz" });
    }
}

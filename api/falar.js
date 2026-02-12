export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const { text } = req.body;
    const token = process.env.HF_TOKEN;

    if (!token) {
        return res.status(500).json({ error: "HF_TOKEN não configurado na Vercel" });
    }

    try {
        // Chamada para o motor S1-Mini da Fish Audio via Hugging Face
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

        // Se a resposta não for OK, pegamos o texto para debugar
        if (!response.ok) {
            const errorText = await response.text();
            console.error("Erro na Hugging Face:", errorText);
            return res.status(500).json({ error: "Erro na Hugging Face" });
        }

        const data = await response.json();
        return res.status(200).json({ eventId: data.event_id });

    } catch (error) {
        console.error("Erro na API de Voz:", error);
        return res.status(500).json({ error: error.message });
    }
}

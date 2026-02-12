// api/analisar.js
export default async function handler(req, res) {
    // 1. Segurança: Só aceita requisições do tipo POST (que seu site envia)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { prompt } = req.body;

    try {
        // 2. O Servidor faz a chamada para a Groq usando a chave oculta
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`, // CHAVE SEGURA AQUI
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system", 
                        content: "Você é o UnintaBot, ferramenta técnica de Neurociência. Use termos baseados na USP/UFRGS e foque em psicopatologia e neuroimagem."
                    },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();

        // 3. Devolve a resposta da IA para o seu site 3D
        return res.status(200).json(data);

    } catch (error) {
        console.error("Erro no Back-end:", error);
        return res.status(500).json({ error: "Erro interno no servidor neural" });
    }
}

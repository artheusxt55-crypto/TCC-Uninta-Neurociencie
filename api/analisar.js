// api/analisar.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    // Recebe exatamente o que o seu HTML envia
    const { prompt, systemContext } = req.body;

    try {
        const response = await fetch("https://api.api.api.api/openai/v1/chat/completions", { // URL da Groq
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system", 
                        // Aqui é onde a mágica acontece: ele lê as regras que você mandou do front
                        content: systemContext || "Você é o Untbot da UNINTA Tianguá."
                    },
                    { role: "user", content: prompt }
                ]
            })
        });

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error) {
        console.error("Erro no Back-end:", error);
        return res.status(500).json({ error: "Erro interno no servidor neural" });
    }
}

// api/analisar.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    const { prompt, systemContext } = req.body;

    try {
        // AJUSTE DE OURO: Forçamos a regra de imagem aqui no backend também
        const systemFinal = (systemContext || "Você é o Untbot da UNINTA Tianguá.") + 
        "\n\nIMPORTANTE: Se o usuário pedir mapa, imagem ou gráfico, termine obrigatoriamente com 'IMAGE_PROMPT: [descrição detalhada em inglês]'.";

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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
                        content: systemFinal // Usando o contexto turbinado
                    },
                    { role: "user", content: prompt }
                ],
                temperature: 0.5 // Baixamos a temperatura para ele ser mais objetivo
            })
        });

        const data = await response.json();

        // LOG DE DEBUG: Verifique o console da Vercel/Node para ver o que a Groq está cuspindo
        console.log("Resposta da Groq:", data.choices[0].message.content);

        return res.status(200).json(data);

    } catch (error) {
        console.error("Erro no Back-end:", error);
        return res.status(500).json({ error: "Erro interno no servidor neural" });
    }
}

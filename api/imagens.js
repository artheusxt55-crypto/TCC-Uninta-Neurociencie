export default async function handler(req, res) {
    const { prompt } = req.body;
    
    // Puxa a chave que você criou na foto 1 lá do Vercel
    const api_key = process.env.POLLINATIONS_API_KEY; 

    // O modelo Flux precisa de autorização se você usa Secret Key
    const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`;

    try {
        // Retornamos a URL para o frontend
        res.status(200).json({ url: imageUrl });
    } catch (error) {
        res.status(500).json({ error: "Erro ao gerar link da imagem" });
    }
}

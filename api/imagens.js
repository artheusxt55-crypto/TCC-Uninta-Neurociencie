export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

    const { prompt } = req.body;
    // O Vercel vai ler a sua Key das Environment Variables
    const API_KEY = process.env.POLLINATIONS_API_KEY; 

    try {
        // Usamos o endpoint de imagem do Pollinations com o modelo Flux
        const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?model=flux&width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 100000)}`;

        // Retornamos o link direto para o seu frontend "pescar"
        res.status(200).json({ url: imageUrl });
    } catch (error) {
        res.status(500).json({ error: 'Falha ao gerar imagem neural' });
    }
}

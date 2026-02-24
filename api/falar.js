export default async function handler(req, res) {
    // 1. Bloqueia acessos que não sejam POST (segurança)
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido. Use POST.' });
    }

    const { texto } = req.body;

    // 2. Validação básica de entrada
    if (!texto) {
        return res.status(400).json({ error: 'Nenhum texto fornecido.' });
    }

    // 3. Puxa a chave das variáveis de ambiente da Vercel
    const apiKey = process.env.ELEVENLABS_API_KEY; 
    
    // ID da voz (Daniel - Firme e Educado). 
    // Você pode trocar por outros IDs da ElevenLabs depois.
    const voiceId = "EXp679D4fX7U9vUTX6NW"; 

    try {
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'xi-api-key': apiKey
            },
            body: JSON.stringify({
                text: texto,
                model_id: "eleven_multilingual_v2",
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.8
                }
            })
        });

        // 4. Se a ElevenLabs der erro (ex: cota acabou), avisa o front-end
        if (!response.ok) {
            const errorData = await response.json();
            console.error('Erro ElevenLabs:', errorData);
            return res.status(response.status).json({ error: 'Erro na ElevenLabs', details: errorData });
        }

        // 5. Transforma o áudio em um buffer e envia
        const audioBuffer = await response.arrayBuffer();
        
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate'); // Cache leve para economizar
        
        return res.send(Buffer.from(audioBuffer));

    } catch (error) {
        console.error('Erro interno na API de fala:', error);
        return res.status(500).json({ error: 'Erro interno no servidor do Lab.' });
    }
}

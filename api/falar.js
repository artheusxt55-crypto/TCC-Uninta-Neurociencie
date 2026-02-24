export default async function handler(req, res) {
    // 1. Só aceita requisições do tipo POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    const { texto } = req.body;

    if (!texto) {
        return res.status(400).json({ error: 'Nenhum texto fornecido.' });
    }

    // 2. Puxa a chave que você salvou no painel da Vercel
    const apiKey = process.env.ELEVENLABS_API_KEY; 
    
    // ID da voz que a gente escolheu
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

        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ error: 'Erro na ElevenLabs', details: errorData });
        }

        const audioBuffer = await response.arrayBuffer();
        
        // 3. Devolve o áudio pronto para o seu HTML tocar
        res.setHeader('Content-Type', 'audio/mpeg');
        return res.send(Buffer.from(audioBuffer));

    } catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor.' });
    }
}

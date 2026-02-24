// api/falar.js
// Usando HTTPS nativo do Node para evitar erro de 'fetch is not defined'
const https = require('https');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    const { texto } = req.body;
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = "EXp679D4fX7U9vUTX6NW"; 

    if (!texto) {
        return res.status(400).json({ error: 'Texto faltando.' });
    }

    const data = JSON.stringify({
        text: texto,
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.8 }
    });

    const options = {
        hostname: 'api.elevenlabs.io',
        path: `/v1/text-to-speech/${voiceId}`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'xi-api-key': apiKey,
            'Content-Length': data.length
        }
    };

    // Criando a requisição manual para garantir compatibilidade total
    const request = https.request(options, (response) => {
        let chunks = [];

        response.on('data', (chunk) => chunks.push(chunk));

        response.on('end', () => {
            const buffer = Buffer.concat(chunks);
            if (response.statusCode === 200) {
                res.setHeader('Content-Type', 'audio/mpeg');
                res.status(200).send(buffer);
            } else {
                const err = buffer.toString();
                console.error("Erro ElevenLabs:", err);
                res.status(response.statusCode).json({ error: 'Erro na ElevenLabs', details: err });
            }
        });
    });

    request.on('error', (e) => {
        console.error("Erro de conexão:", e);
        res.status(500).json({ error: 'Falha na conexão' });
    });

    request.write(data);
    request.end();
};

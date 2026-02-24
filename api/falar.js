const https = require('https');

module.exports = async (req, res) => {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { texto } = req.body;
    // Remove qualquer caractere que não seja letra, número ou pontuação básica
    const textoLimpo = texto.replace(/[^\w\sÀ-ÿ,.?!]/gi, '').substring(0, 250);

    const data = JSON.stringify({
        text: textoLimpo,
        model_id: "eleven_multilingual_v1", // Versão v1 é mais estável para contas free
        voice_settings: { stability: 0.5, similarity_boost: 0.5 }
    });

    const options = {
        hostname: 'api.elevenlabs.io',
        path: `/v1/text-to-speech/EXp679D4fX7U9vUTX6NW`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'xi-api-key': process.env.ELEVENLABS_API_KEY
        }
    };

    const request = https.request(options, (response) => {
        if (response.statusCode !== 200) {
            res.status(response.statusCode).send('Erro na ElevenLabs');
            return;
        }
        res.setHeader('Content-Type', 'audio/mpeg');
        response.pipe(res); // Envia o áudio direto para o navegador
    });

    request.on('error', () => res.status(500).send('Erro de Conexão'));
    request.write(data);
    request.end();
};

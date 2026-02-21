import fetch from 'node-fetch';

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (!UPSTASH_URL || !UPSTASH_TOKEN) {
      return res.status(500).json({ error: "Variáveis de ambiente não configuradas" });
    }

    const { userId, texto, autor, acao } = req.body;

    if (!userId || !acao) {
      return res.status(400).json({ error: "userId e acao são obrigatórios" });
    }

    let finalUrl = `${UPSTASH_URL}/${acao}/${userId}`;
    let method = 'POST'; // default
    if (acao === 'lrange') method = 'GET';

    if (acao === 'rpush') {
      if (!texto || !autor) return res.status(400).json({ error: "texto e autor são obrigatórios para rpush" });
      const mensagem = encodeURIComponent(`${autor}: ${texto}`);
      finalUrl += `/${mensagem}`;
    } else if (acao === 'lrange') {
      finalUrl += `/0/-1`; // todo histórico
    } else if (acao === 'ltrim') {
      finalUrl += `/-10/-1`; // mantém últimas 10 mensagens
    }

    const resp = await fetch(finalUrl, {
      method,
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
    });

    const data = await resp.json();
    return res.status(200).json(data);

  } catch (e) {
    console.error("Erro na API de memória:", e);
    return res.status(500).json({ error: "Falha no backend", detail: e.message });
  }
}

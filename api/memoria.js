import fetch from 'node-fetch';

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

export default async function handler(req, res) {
  // 1. Habilitar CORS para o seu frontend não ser bloqueado
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { userId, texto, autor, acao, range } = req.body;

    if (!userId || !acao) {
      return res.status(400).json({ error: "userId e acao são obrigatórios" });
    }

    // 2. Ajuste na montagem da URL para REST API do Upstash
    // O formato correto é: URL/comando/chave/valor
    let finalUrl = `${UPSTASH_URL}/${acao}/${userId}`;
    let options = {
      method: 'POST', // O Upstash aceita quase tudo via POST na REST API
      headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` }
    };

    if (acao === 'rpush') {
      const mensagem = encodeURIComponent(`${autor}: ${texto}`);
      finalUrl += `/${mensagem}`;
    } else if (acao === 'lrange') {
      finalUrl += `/0/-1`; // Pega todo o histórico
    } else if (acao === 'ltrim') {
      finalUrl += `/-10/-1`; // Mantém as últimas 10
    }

    const resp = await fetch(finalUrl, options);
    const data = await resp.json();

    return res.status(200).json(data);

  } catch (e) {
    console.error("Erro na API de memória:", e);
    return res.status(500).json({ error: "Falha no backend" });
  }
}

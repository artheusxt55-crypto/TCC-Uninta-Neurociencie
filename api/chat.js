// ============================================================
// /api/chat
// Endpoint da AURA (assistente pedagógica do EducaCube).
// Modelo: Google Gemini.
// ============================================================

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_PROMPT_LENGTH = 6000;
const MAX_CONTEXT_ITEMS = 8;
const MAX_CONTEXT_ITEM_LENGTH = 2000;

// ============================================================
// RATE LIMIT (Upstash Redis — janela fixa por IP)
// ============================================================

const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_WINDOW_SECONDS = 300; // 5 minutos

function pegarIP(req) {
  const forwarded = req.headers["x-forwarded-for"];

  if (forwarded) {
    const ip = forwarded.split(",")[0].trim();
    if (ip) return ip;
  }

  return req.headers["x-real-ip"] || req.socket?.remoteAddress || "desconhecido";
}

/**
 * Retorna { limitado: boolean }. Em caso de falha ou de as
 * variáveis do Upstash não estarem configuradas, NÃO bloqueia
 * a requisição (falha aberta) — só registra no log do servidor.
 */
async function checkRateLimit(ip) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      "Rate limit desativado: UPSTASH_REDIS_REST_URL/TOKEN não configuradas."
    );
    return { limitado: false };
  }

  try {
    const key = `ratelimit:chat:${ip}`;

    const incrResponse = await fetch(`${url}/incr/${key}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const incrData = await incrResponse.json();
    const contagem = incrData?.result;

    if (typeof contagem !== "number") {
      // Resposta inesperada do Upstash: não bloqueia o usuário por isso.
      console.error("Resposta inesperada do rate limit:", incrData);
      return { limitado: false };
    }

    if (contagem === 1) {
      // Primeira requisição da janela: define o TTL.
      await fetch(`${url}/expire/${key}/${RATE_LIMIT_WINDOW_SECONDS}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }

    return { limitado: contagem > RATE_LIMIT_MAX_REQUESTS };
  } catch (error) {
    console.error("Erro ao checar rate limit:", error);
    return { limitado: false };
  }
}

const AURA_SYSTEM_PROMPT = `Você é a AURA, a assistente pedagógica do EducaCube.
Você ajuda professores e educadores a planejar aulas, criar exercícios e avaliações,
explicar conceitos pedagógicos e alinhar conteúdos à BNCC.
Responda sempre em português do Brasil, de forma clara, prática e profissional.
Use Markdown (títulos em negrito, listas numeradas ou com marcadores) quando isso
ajudar na leitura, sem exagerar na formatação.
Se a pergunta não tiver relação com educação, ensino ou o EducaCube, responda
normalmente, mas mantenha o tom de uma assistente educacional séria e confiável.`;

// ============================================================
// HELPERS
// ============================================================

function sanitizeContexto(contexto) {
  if (!Array.isArray(contexto)) {
    return [];
  }

  return contexto
    .filter((item) => typeof item === "string" && item.trim().length > 0)
    .slice(-MAX_CONTEXT_ITEMS)
    .map((item) => item.slice(0, MAX_CONTEXT_ITEM_LENGTH));
}

function buildContents(prompt, contextoSeguro) {
  const contents = [];

  if (contextoSeguro.length > 0) {
    contents.push({
      role: "user",
      parts: [
        {
          text: `Resumo da conversa até agora (apenas para contexto, não responda a isso diretamente):\n${contextoSeguro.join(
            "\n"
          )}`,
        },
      ],
    });

    contents.push({
      role: "model",
      parts: [{ text: "Entendido, vou levar esse contexto em conta." }],
    });
  }

  contents.push({
    role: "user",
    parts: [{ text: prompt }],
  });

  return contents;
}

// ============================================================
// HANDLER
// ============================================================

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Método não permitido." });
  }

  if (!process.env.GEMINI_API_KEY) {
    console.error("GEMINI_API_KEY não configurada no ambiente.");
    return res
      .status(500)
      .json({ error: "A AURA não está configurada no servidor." });
  }

  const ip = pegarIP(req);
  const { limitado } = await checkRateLimit(ip);

  if (limitado) {
    return res.status(429).json({
      error:
        "Muitas mensagens em pouco tempo. Aguarde alguns minutos e tente novamente.",
    });
  }

  const { prompt, contexto } = req.body ?? {};

  if (typeof prompt !== "string" || !prompt.trim()) {
    return res.status(400).json({ error: "Envie uma pergunta válida." });
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({
      error: `Sua pergunta é muito longa (limite de ${MAX_PROMPT_LENGTH} caracteres).`,
    });
  }

  const contextoSeguro = sanitizeContexto(contexto);

  try {
    const geminiResponse = await fetch(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: buildContents(prompt, contextoSeguro),
          systemInstruction: {
            parts: [{ text: AURA_SYSTEM_PROMPT }],
          },
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    const data = await geminiResponse.json();

    if (!geminiResponse.ok) {
      console.error("Erro da API Gemini:", data);
      return res.status(502).json({
        error:
          "A AURA não conseguiu gerar uma resposta agora. Tente novamente em instantes.",
      });
    }

    const candidate = data?.candidates?.[0];

    const respostaIA = candidate?.content?.parts
      ?.map((part) => part.text ?? "")
      .join("")
      .trim();

    if (!respostaIA) {
      const bloqueada = candidate?.finishReason === "SAFETY";

      return res.status(502).json({
        error: bloqueada
          ? "Não posso responder a essa pergunta."
          : "A AURA não conseguiu gerar uma resposta agora. Tente novamente.",
      });
    }

    return res.status(200).json({ resposta: respostaIA });
  } catch (error) {
    console.error("Erro na API /api/chat:", error);
    return res.status(500).json({ error: "Erro ao processar sua mensagem." });
  }
}

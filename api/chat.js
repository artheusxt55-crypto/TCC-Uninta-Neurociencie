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

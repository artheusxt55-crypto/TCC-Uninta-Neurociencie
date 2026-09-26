
const GEMINI_MODEL =
  process.env.GEMINI_MODEL || "gemini-3.8-flash";

const GEMINI_URL =
  `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const MAX_PROMPT_LENGTH = 6000;
const MAX_CONTEXT_ITEMS = 8;
const MAX_CONTEXT_ITEM_LENGTH = 2000;


const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_WINDOW_SECONDS = 300; // 5 minutos

function pegarIP(req) {
  const forwarded = req.headers["x-forwarded-for"];

  if (forwarded) {
    const ip = forwarded.split(",")[0].trim();

    if (ip) {
      return ip;
    }
  }

  return (
    req.headers["x-real-ip"] ||
    req.socket?.remoteAddress ||
    "desconhecido"
  );
}

/**
 * Retorna:
 * {
 *   limitado: boolean
 * }
 *
 * Em caso de falha do Upstash ou ausência das variáveis,
 * o sistema continua funcionando.
 */
async function checkRateLimit(ip) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn(
      "Rate limit desativado: UPSTASH_REDIS_REST_URL/TOKEN não configuradas."
    );

    return {
      limitado: false,
    };
  }

  try {
    const key = `ratelimit:chat:${ip}`;

    // ----------------------------------------------------------
    // Incrementa contador
    // ----------------------------------------------------------

    const incrResponse = await fetch(`${url}/incr/${key}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const incrData = await incrResponse.json();

    const contagem = incrData?.result;

    if (typeof contagem !== "number") {
      console.error(
        "Resposta inesperada do rate limit:",
        incrData
      );

      return {
        limitado: false,
      };
    }

    // ----------------------------------------------------------
    // Primeira requisição da janela
    // ----------------------------------------------------------

    if (contagem === 1) {
      await fetch(
        `${url}/expire/${key}/${RATE_LIMIT_WINDOW_SECONDS}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    }

    return {
      limitado: contagem > RATE_LIMIT_MAX_REQUESTS,
    };
  } catch (error) {
    console.error(
      "Erro ao checar rate limit:",
      error
    );

    // Falha aberta:
    // se o rate limit cair, a AURA continua funcionando.
    return {
      limitado: false,
    };
  }
}

// ============================================================
// SYSTEM PROMPT DA AURA
// ============================================================

const AURA_SYSTEM_PROMPT = `
Você é a AURA, a assistente pedagógica do EducaCube.

Sua função é ajudar professores e educadores a:
- planejar aulas;
- criar exercícios;
- criar avaliações;
- elaborar atividades;
- explicar conceitos pedagógicos;
- organizar planejamentos;
- trabalhar conteúdos educacionais;
- alinhar conteúdos à BNCC quando solicitado.

Responda sempre em português do Brasil.

Seu estilo deve ser:
- claro;
- natural;
- profissional;
- pedagógico;
- objetivo;
- útil;
- humanizado.

Evite respostas excessivamente genéricas.

Quando necessário, explique o raciocínio de forma organizada.

Use Markdown quando isso melhorar a leitura:
- títulos;
- listas;
- tabelas;
- passos numerados.

Não exagere na formatação.

Se a pergunta não tiver relação direta com educação, ensino ou EducaCube,
você pode responder normalmente, mas mantenha o tom de uma assistente
educacional séria e confiável.
`.trim();

// ============================================================
// HELPERS
// ============================================================

function sanitizeContexto(contexto) {
  if (!Array.isArray(contexto)) {
    return [];
  }

  return contexto
    .filter(
      (item) =>
        typeof item === "string" &&
        item.trim().length > 0
    )
    .slice(-MAX_CONTEXT_ITEMS)
    .map((item) =>
      item.slice(0, MAX_CONTEXT_ITEM_LENGTH)
    );
}

// ============================================================
// CONSTRUTOR DO CONTEXTO
// ============================================================

function buildContents(prompt, contextoSeguro) {
  const contents = [];

  // ----------------------------------------------------------
  // Contexto anterior da conversa
  // ----------------------------------------------------------

  if (contextoSeguro.length > 0) {
    contents.push({
      role: "user",
      parts: [
        {
          text:
            "Resumo da conversa até agora " +
            "(apenas para contexto, não responda a isso diretamente):\n" +
            contextoSeguro.join("\n"),
        },
      ],
    });

    contents.push({
      role: "model",
      parts: [
        {
          text:
            "Entendido. Vou levar esse contexto em consideração.",
        },
      ],
    });
  }

  // ----------------------------------------------------------
  // Nova pergunta
  // ----------------------------------------------------------

  contents.push({
    role: "user",
    parts: [
      {
        text: prompt,
      },
    ],
  });

  return contents;
}

// ============================================================
// HANDLER
// ============================================================

export default async function handler(req, res) {
  // ==========================================================
  // MÉTODO
  // ==========================================================

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      error: "Método não permitido.",
    });
  }

  // ==========================================================
  // API KEY
  // ==========================================================

  if (!process.env.GEMINI_API_KEY) {
    console.error(
      "GEMINI_API_KEY não configurada no ambiente."
    );

    return res.status(500).json({
      error:
        "A AURA não está configurada no servidor.",
    });
  }

  // ==========================================================
  // RATE LIMIT
  // ==========================================================

  const ip = pegarIP(req);

  const { limitado } =
    await checkRateLimit(ip);

  if (limitado) {
    return res.status(429).json({
      error:
        "Muitas mensagens em pouco tempo. Aguarde alguns minutos e tente novamente.",
    });
  }

  // ==========================================================
  // BODY
  // ==========================================================

  const { prompt, contexto } = req.body ?? {};

  // ==========================================================
  // VALIDAÇÃO DO PROMPT
  // ==========================================================

  if (
    typeof prompt !== "string" ||
    !prompt.trim()
  ) {
    return res.status(400).json({
      error: "Envie uma pergunta válida.",
    });
  }

  // ==========================================================
  // LIMITE DO PROMPT
  // ==========================================================

  if (prompt.length > MAX_PROMPT_LENGTH) {
    return res.status(400).json({
      error:
        `Sua pergunta é muito longa ` +
        `(limite de ${MAX_PROMPT_LENGTH} caracteres).`,
    });
  }

  // ==========================================================
  // SANITIZAÇÃO DO CONTEXTO
  // ==========================================================

  const contextoSeguro =
    sanitizeContexto(contexto);

  // ==========================================================
  // CHAMADA AO GEMINI
  // ==========================================================

  try {
    console.log(
      `[AURA] Enviando requisição para Gemini. Modelo: ${GEMINI_MODEL}`
    );

    const geminiResponse = await fetch(
      `${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          // --------------------------------------------------
          // Conteúdo
          // --------------------------------------------------

          contents:
            buildContents(
              prompt,
              contextoSeguro
            ),

          // --------------------------------------------------
          // Instruções da AURA
          // --------------------------------------------------

          systemInstruction: {
            parts: [
              {
                text: AURA_SYSTEM_PROMPT,
              },
            ],
          },

          // --------------------------------------------------
          // Configuração da geração
          // --------------------------------------------------

          generationConfig: {
            maxOutputTokens: 2048,
          },
        }),
      }
    );

    // ========================================================
    // LÊ RESPOSTA DO GEMINI
    // ========================================================

    const data = await geminiResponse.json();

    // ========================================================
    // ERRO DO GEMINI
    // ========================================================

    if (!geminiResponse.ok) {
      console.error(
        "=================================================="
      );

      console.error(
        "[AURA] ERRO REAL RETORNADO PELO GEMINI"
      );

      console.error(
        "Status:",
        geminiResponse.status
      );

      console.error(
        "Status Text:",
        geminiResponse.statusText
      );

      console.error(
        "Modelo:",
        GEMINI_MODEL
      );

      console.error(
        "Resposta:",
        JSON.stringify(
          data,
          null,
          2
        )
      );

      console.error(
        "=================================================="
      );

      // ------------------------------------------------------
      // IMPORTANTE:
      // Durante o diagnóstico, retornamos o status real.
      // ------------------------------------------------------

      return res
        .status(geminiResponse.status)
        .json({
          error:
            "Erro retornado pela API do Gemini.",

          geminiStatus:
            geminiResponse.status,

          geminiStatusText:
            geminiResponse.statusText,

          geminiDetails:
            data,
        });
    }

    // ========================================================
    // CANDIDATO
    // ========================================================

    const candidate =
      data?.candidates?.[0];

    // ========================================================
    // TEXTO DA RESPOSTA
    // ========================================================

    const respostaIA =
      candidate?.content?.parts
        ?.map(
          (part) =>
            part.text ?? ""
        )
        .join("")
        .trim();

    // ========================================================
    // RESPOSTA VAZIA
    // ========================================================

    if (!respostaIA) {
      const bloqueada =
        candidate?.finishReason ===
        "SAFETY";

      console.warn(
        "[AURA] Gemini retornou resposta sem texto.",
        {
          finishReason:
            candidate?.finishReason,

          candidate,
        }
      );

      return res.status(502).json({
        error: bloqueada
          ? "Não posso responder a essa pergunta."
          : "A AURA não conseguiu gerar uma resposta agora. Tente novamente.",
      });
    }

    // ========================================================
    // SUCESSO
    // ========================================================

    console.log(
      `[AURA] Resposta gerada com sucesso pelo modelo ${GEMINI_MODEL}.`
    );

    return res.status(200).json({
      resposta: respostaIA,
    });
  } catch (error) {
    // ========================================================
    // ERRO DE REDE / SERVIDOR
    // ========================================================

    console.error(
      "=================================================="
    );

    console.error(
      "[AURA] ERRO AO CONECTAR COM O GEMINI"
    );

    console.error(error);

    console.error(
      "=================================================="
    );

    return res.status(500).json({
      error:
        "Erro ao processar sua mensagem.",
    });
  }
}

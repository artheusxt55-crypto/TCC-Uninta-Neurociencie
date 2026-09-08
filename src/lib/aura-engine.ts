const API_URL = "/api/chat";

export interface AuraResponse {
  resposta: string;
  fontesLab?: Array<{
    titulo?: string;
    url?: string;
    fonte?: string;
  }>;
}

export async function analisarComGroq(
  prompt: string,
  contexto: string[] = []
): Promise<AuraResponse> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt,
      contexto,
    }),
  });

  if (!response.ok) {
    let mensagem = "Erro ao comunicar com a AURA.";

    try {
      const data = await response.json();

      if (data?.error) {
        mensagem = data.error;
      }

      if (data?.message) {
        mensagem = data.message;
      }
    } catch {
      // Mantém a mensagem padrão
    }

    throw new Error(mensagem);
  }

  return response.json();
}

/**
 * Salva o histórico localmente.
 *
 * Dados sensíveis e chaves de API NÃO devem ser armazenados aqui.
 * O histórico persistente no servidor poderá ser conectado depois.
 */
export function salvarNoRedis(
  userId: string,
  conversa: unknown
): void {
  try {
    localStorage.setItem(
      `aura_history_${userId}`,
      JSON.stringify(conversa)
    );
  } catch (error) {
    console.error("Erro ao salvar histórico:", error);
  }
}

export function buscarDoRedis<T = unknown>(
  userId: string
): T | null {
  try {
    const dados = localStorage.getItem(`aura_history_${userId}`);

    if (!dados) {
      return null;
    }

    return JSON.parse(dados) as T;
  } catch (error) {
    console.error("Erro ao recuperar histórico:", error);
    return null;
  }
}

/**
 * Conversão de texto para voz usando a API nativa do navegador.
 */
export function falarTexto(texto: string): void {
  if (typeof window === "undefined") {
    return;
  }

  if (!("speechSynthesis" in window)) {
    console.warn("Speech Synthesis não disponível neste navegador.");
    return;
  }

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(texto);

  utterance.lang = "pt-BR";
  utterance.rate = 1;
  utterance.pitch = 1;
  utterance.volume = 1;

  window.speechSynthesis.speak(utterance);
}

export function pararFala(): void {
  if (typeof window === "undefined") {
    return;
  }

  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

import { useMemo, type CSSProperties } from "react";

/**
 * Estados possíveis da AURA. Este tipo é a fonte da verdade para
 * qualquer componente que precise refletir o estado da inteligência
 * (composer, orb, indicadores de conexão etc.).
 */
export type AuraState =
  | "idle"
  | "listening"
  | "sending"
  | "thinking"
  | "generating"
  | "complete"
  | "speaking"
  | "error"
  | "offline";

const STATE_LABEL: Record<AuraState, string> = {
  idle: "Em espera",
  listening: "Ouvindo",
  sending: "Enviando mensagem",
  thinking: "Processando",
  generating: "Gerando resposta",
  complete: "Resposta concluída",
  speaking: "Falando",
  error: "Ocorreu um erro",
  offline: "Sem conexão",
};

interface NeuralOrbProps {
  state: AuraState;
  size?: number;
  /**
   * Nível de amplitude de áudio (0–1). Ponto de integração:
   * alimentar com o valor retornado por `useAudioAnalyzer` quando o
   * microfone ou a síntese de voz estiverem ativos. Sem o hook
   * conectado, o valor fica em 0 e o núcleo usa apenas sua animação
   * idle/estado.
   */
  audioLevel?: number;
}

/**
 * Núcleo visual da AURA — "knowledge core".
 * Geometria estratificada (não é um cérebro, robô ou esfera neon):
 * dois hexágonos concêntricos + eixos internos, representando
 * conhecimento estruturado em camadas. A animação é conduzida
 * inteiramente por CSS (transform/opacity) e reage ao estado atual.
 */
export default function NeuralOrb({ state, size = 84, audioLevel = 0 }: NeuralOrbProps) {
  const scale = useMemo(() => {
    if (state === "listening" || state === "speaking") {
      return 1 + Math.min(Math.max(audioLevel, 0), 1) * 0.1;
    }
    return 1;
  }, [state, audioLevel]);

  return (
    <div
      className={`aura-orb aura-orb-${state}`}
      style={{ width: size, height: size, "--orb-scale": scale } as CSSProperties}
      role="img"
      aria-label={`Núcleo da AURA — ${STATE_LABEL[state]}`}
    >
      <svg viewBox="0 0 120 120" className="aura-orb-svg" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="aura-orb-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="var(--purple-light)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="var(--purple-light)" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx="60" cy="60" r="48" fill="url(#aura-orb-glow)" className="aura-orb-glow" />

        <g className="aura-orb-core">
          <polygon
            points="60,18 97,40 97,80 60,102 23,80 23,40"
            className="aura-orb-shell aura-orb-shell-outer"
          />
          <polygon
            points="60,35 81,48 81,72 60,85 39,72 39,48"
            className="aura-orb-shell aura-orb-shell-inner"
          />
          <line x1="60" y1="18" x2="60" y2="102" className="aura-orb-line" />
          <line x1="23" y1="40" x2="97" y2="80" className="aura-orb-line" />
          <line x1="97" y1="40" x2="23" y2="80" className="aura-orb-line" />
          <circle cx="60" cy="60" r="4" className="aura-orb-core-dot" />
        </g>
      </svg>
    </div>
  );
}

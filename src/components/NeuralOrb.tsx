export type AuraState =
  | "idle"
  | "listening"
  | "thinking"
  | "generating"
  | "complete"
  | "speaking"
  | "error"
  | "offline";

interface NeuralOrbProps {
  state: AuraState;
  size?: number;
  audioLevel?: number;
}

const STATE_LABELS: Record<AuraState, string> = {
  idle: "AURA pronta",
  listening: "AURA ouvindo",
  thinking: "AURA processando",
  generating: "AURA gerando resposta",
  complete: "AURA concluiu a resposta",
  speaking: "AURA falando",
  error: "Erro na AURA",
  offline: "AURA offline",
};

export default function NeuralOrb({
  state,
  size = 40,
  audioLevel,
}: NeuralOrbProps) {
  const scale =
    typeof audioLevel === "number" &&
    (state === "listening" || state === "speaking")
      ? 1 + Math.min(Math.max(audioLevel, 0), 1) * 0.16
      : 1;

  return (
    <svg
      className="aura-orb"
      data-state={state}
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label={STATE_LABELS[state]}
    >
      <g
        className="aura-orb-ring"
        style={{ transformOrigin: "20px 20px" }}
      >
        <path
          d="M20 3 A17 17 0 0 1 34.7 11"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.55"
        />

        <path
          d="M37 20 A17 17 0 0 1 30 34.5"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.35"
        />

        <path
          d="M11 35 A17 17 0 0 1 3.3 21.5"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
          opacity="0.25"
        />
      </g>

      <g
        className="aura-orb-core"
        style={{
          transformOrigin: "20px 20px",
          transform: `scale(${scale})`,
        }}
      >
        <path
          d="M20 9.5 L28.5 15 L28.5 25 L20 30.5 L11.5 25 L11.5 15 Z"
          stroke="currentColor"
          strokeWidth="1.1"
          opacity="0.8"
        />

        <path
          d="M20 9.5 L20 30.5"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity="0.35"
        />

        <path
          d="M11.5 15 L28.5 25"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity="0.3"
        />

        <path
          d="M28.5 15 L11.5 25"
          stroke="currentColor"
          strokeWidth="0.75"
          opacity="0.3"
        />
      </g>

      <circle
        className="aura-orb-node"
        cx="20"
        cy="9.5"
        r="1.4"
        fill="currentColor"
      />

      <circle
        className="aura-orb-node"
        cx="28.5"
        cy="15"
        r="1.2"
        fill="currentColor"
        opacity="0.85"
      />

      <circle
        className="aura-orb-node"
        cx="28.5"
        cy="25"
        r="1.2"
        fill="currentColor"
        opacity="0.85"
      />

      <circle
        className="aura-orb-node"
        cx="20"
        cy="30.5"
        r="1.4"
        fill="currentColor"
      />

      <circle
        className="aura-orb-node"
        cx="11.5"
        cy="25"
        r="1.2"
        fill="currentColor"
        opacity="0.85"
      />

      <circle
        className="aura-orb-node"
        cx="11.5"
        cy="15"
        r="1.2"
        fill="currentColor"
        opacity="0.85"
      />

      <circle
        cx="20"
        cy="20"
        r="2"
        fill="currentColor"
      />
    </svg>
  );
}

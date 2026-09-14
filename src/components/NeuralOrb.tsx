import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import {
  useRive,
  useViewModelInstanceBoolean,
  useViewModelInstanceTrigger,
  Layout,
  Fit,
  Alignment,
} from "@rive-app/react-canvas";

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

interface NeuralOrbProps {
  state: AuraState;
  size?: number;
}

export default function NeuralOrb({ state, size = 48 }: NeuralOrbProps) {
  const reducedMotion = useReducedMotion();

  const { rive, RiveComponent } = useRive({
    src: "/ai-orb-mascot.riv",
    artboard: "Main",
    stateMachines: "State Machine 1",
    autoplay: !reducedMotion,
    autoBind: true, // liga automaticamente a instância padrão do ViewModel
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  const vmInstance = rive?.viewModelInstance;

  // booleans: controlam estados contínuos (carregando / digitando)
  const { setValue: setLoading } = useViewModelInstanceBoolean(
    "loadingBoolean",
    vmInstance
  );
  const { setValue: setTyping } = useViewModelInstanceBoolean(
    "typingBoolean",
    vmInstance
  );

  // triggers: disparam animações pontuais (acerto / erro / reação)
  const { trigger: fireCorrect } = useViewModelInstanceTrigger(
    "correct",
    vmInstance
  );
  const { trigger: fireWrong } = useViewModelInstanceTrigger(
    "wrong",
    vmInstance
  );
  const { trigger: fireJump } = useViewModelInstanceTrigger(
    "jump",
    vmInstance
  );

  const previousStateRef = useRef<AuraState>(state);

  /* liga loading/typing conforme o estado da AURA */
  useEffect(() => {
    if (!setLoading || !setTyping) return;

    switch (state) {
      case "sending":
      case "thinking":
      case "generating":
        setLoading(true);
        setTyping(false);
        break;
      case "speaking":
        setLoading(false);
        setTyping(true);
        break;
      default:
        setLoading(false);
        setTyping(false);
        break;
    }
  }, [state, setLoading, setTyping]);

  /* dispara os triggers pontuais nas transições relevantes */
  useEffect(() => {
    const prev = previousStateRef.current;

    if (prev !== "complete" && state === "complete") fireCorrect?.();
    if (prev !== "error" && state === "error") fireWrong?.();
    if (prev !== "listening" && state === "listening") fireJump?.();

    previousStateRef.current = state;
  }, [state, fireCorrect, fireWrong, fireJump]);

  /* pausa completamente se o usuário preferir menos movimento */
  useEffect(() => {
    if (!rive) return;
    if (reducedMotion) {
      rive.pause();
    } else {
      rive.play();
    }
  }, [reducedMotion, rive]);

  return (
    <div
      className={`aura-orb aura-orb-${state}`}
      style={{ width: size, height: size }}
    >
      <RiveComponent />
    </div>
  );
}

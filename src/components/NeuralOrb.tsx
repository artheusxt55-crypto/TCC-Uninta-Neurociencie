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
  audioLevel?: number;
}

export default function NeuralOrb({
  state,
  size = 48,
  audioLevel = 0,
}: NeuralOrbProps) {
  const reducedMotion = useReducedMotion();

  const { rive, RiveComponent } = useRive({
    src: "/ai-orb-mascot.riv",
    artboard: "Main",
    stateMachines: "State Machine 1",
    autoplay: !reducedMotion,
    autoBind: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  const vmInstance = rive?.viewModelInstance;

  const { setValue: setLoading } = useViewModelInstanceBoolean(
    "loadingBoolean",
    vmInstance
  );

  const { setValue: setTyping } = useViewModelInstanceBoolean(
    "typingBoolean",
    vmInstance
  );

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

  useEffect(() => {
    // Mantém compatibilidade com o AuraAI.tsx.
    // O Rive atual não utiliza audioLevel diretamente.
    void audioLevel;
  }, [audioLevel]);

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

  useEffect(() => {
    const previousState = previousStateRef.current;

    if (
      previousState !== "complete" &&
      state === "complete"
    ) {
      fireCorrect?.();
    }

    if (
      previousState !== "error" &&
      state === "error"
    ) {
      fireWrong?.();
    }

    if (
      previousState !== "listening" &&
      state === "listening"
    ) {
      fireJump?.();
    }

    previousStateRef.current = state;
  }, [state, fireCorrect, fireWrong, fireJump]);

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
      style={{
        width: size,
        height: size,
      }}
      aria-hidden="true"
    >
      <RiveComponent />
    </div>
  );
}

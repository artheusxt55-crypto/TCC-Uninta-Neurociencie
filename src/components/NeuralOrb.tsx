import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";
import {
  useRive,
  useStateMachineInput,
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

/*
 * A coruja dorme (awake=false) nos estados ociosos/offline
 * e acorda (awake=true) em qualquer estado de atividade.
 */
function isAwakeForState(state: AuraState): boolean {
  return state !== "idle" && state !== "offline";
}

export default function NeuralOrb({
  state,
  size = 48,
  audioLevel = 0,
}: NeuralOrbProps) {
  const reducedMotion = useReducedMotion();

  const { rive, RiveComponent } = useRive({
    src: "/aura-owl.riv",
    artboard: "Main",
    stateMachines: "State Machine 1",
    autoplay: !reducedMotion,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  });

  const awakeInput = useStateMachineInput(
    rive,
    "State Machine 1",
    "awake"
  );

  const moveInput = useStateMachineInput(
    rive,
    "State Machine 1",
    "move"
  );

  const clickInput = useStateMachineInput(
    rive,
    "State Machine 1",
    "Click in"
  );

  const previousStateRef = useRef<AuraState>(state);

  /* liga/desliga o "awake" conforme o estado da AURA */
  useEffect(() => {
    if (!awakeInput) return;
    awakeInput.value = isAwakeForState(state);
  }, [state, awakeInput]);

  /* dispara uma reação (piscar/animação de clique) ao concluir uma resposta */
  useEffect(() => {
    if (
      clickInput &&
      previousStateRef.current !== "complete" &&
      state === "complete"
    ) {
      clickInput.fire();
    }

    previousStateRef.current = state;
  }, [state, clickInput]);

  /* usa o nível de áudio (microfone) para dar vida ao "move" durante a escuta */
  useEffect(() => {
    if (!moveInput) return;

    if (state === "listening") {
      moveInput.value = (audioLevel - 0.5) * 2;
    } else {
      moveInput.value = 0;
    }
  }, [state, audioLevel, moveInput]);

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
      className={`aura-orb aura-owl aura-orb-${state}`}
      style={{ width: size, height: size }}
    >
      <RiveComponent />
    </div>
  );
}

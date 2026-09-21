import { useEffect, useState } from "react";

export type PerformanceMode = "full" | "reduced" | "minimal";

type NavigatorWithExtras = Navigator & {
  connection?: {
    saveData?: boolean;
  };
  deviceMemory?: number;
};

export function usePerformanceMode(): PerformanceMode {
  const [mode, setMode] = useState<PerformanceMode>("full");

  useEffect(() => {
    const updateMode = () => {
      const nav = navigator as NavigatorWithExtras;

      const mobile = window.matchMedia(
        "(max-width: 768px)"
      ).matches;

      const cores = nav.hardwareConcurrency || 8;
      const memory = nav.deviceMemory;
      const saveData = nav.connection?.saveData === true;

      /*
       * ECONOMIA DE DADOS
       *
       * Se o usuário ativou economia de dados,
       * reduzimos efeitos pesados para economizar
       * processamento e tráfego.
       */
      if (saveData) {
        setMode("minimal");
        return;
      }

      /*
       * DISPOSITIVO MUITO FRACO
       *
       * Poucos núcleos ou pouca memória indicam
       * que devemos priorizar fluidez.
       */
      if (
        cores <= 2 ||
        (memory !== undefined && memory <= 2)
      ) {
        setMode("minimal");
        return;
      }

      /*
       * DISPOSITIVO INTERMEDIÁRIO
       */
      if (
        cores <= 4 ||
        (memory !== undefined && memory <= 4)
      ) {
        setMode("reduced");
        return;
      }

      /*
       * CELULAR POTENTE
       *
       * Não reduzimos automaticamente só porque
       * é mobile. Se o aparelho tiver recursos
       * suficientes, mantém qualidade alta.
       */
      if (mobile) {
        setMode("full");
        return;
      }

      /*
       * DESKTOP / NOTEBOOK POTENTE
       */
      setMode("full");
    };

    updateMode();

    window.addEventListener("resize", updateMode);

    return () => {
      window.removeEventListener("resize", updateMode);
    };
  }, []);

  return mode;
}

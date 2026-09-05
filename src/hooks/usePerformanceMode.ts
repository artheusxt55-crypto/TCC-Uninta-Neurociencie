import { useEffect, useState } from "react";

export type PerformanceMode = "full" | "reduced" | "minimal";

export function usePerformanceMode(): PerformanceMode {
  const [mode, setMode] = useState<PerformanceMode>("full");

  useEffect(() => {
    const updateMode = () => {
      const mobile = window.matchMedia(
        "(max-width: 768px)"
      ).matches;

      const cores = navigator.hardwareConcurrency || 8;

      const connection = (
        navigator as Navigator & {
          connection?: {
            saveData?: boolean;
          };
        }
      ).connection;

      const saveData = connection?.saveData === true;

      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      // Dispositivo muito fraco ou economia de dados
      if (saveData || cores <= 2) {
        setMode("minimal");
        return;
      }

      // Celular ou computador mais limitado
      if (mobile || cores <= 4 || reducedMotion) {
        setMode("reduced");
        return;
      }

      // Desktop com capacidade normal
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

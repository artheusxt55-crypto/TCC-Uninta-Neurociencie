// src/hooks/useStackPanels.ts
//
// Mede a altura de cada painel `[data-stack-panel]` dentro do container
// e grava em `--stack-h` (px). O CSS usa esse valor para calcular o
// `top` do sticky:
//
//   top: min(0px, calc(100svh - var(--stack-h)))
//
// Painel menor/igual à tela  → top: 0 (gruda no topo e é coberto).
// Painel maior que a tela    → top negativo (rola até o fim do painel
//                              e só então é coberto pelo próximo).
//
// Isso é o que faz o efeito funcionar no mobile, onde o hero e a lista
// de ferramentas são bem mais altos que a tela.

import { useLayoutEffect, type RefObject } from "react";

export function useStackPanels(
    containerRef: RefObject<HTMLElement | null>,
    // Reexecuta quando painéis são adicionados/removidos
    // (ex.: o painel de partículas só existe no modo "full").
    deps: ReadonlyArray<unknown> = []
) {
    useLayoutEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        const panels = Array.from(
            container.querySelectorAll<HTMLElement>(
                "[data-stack-panel]"
            )
        );

        if (!panels.length) {
            return;
        }

        const write = (panel: HTMLElement) => {
            panel.style.setProperty(
                "--stack-h",
                `${panel.offsetHeight}px`
            );
        };

        panels.forEach(write);

        // Reage a mudanças de tamanho: rotação do celular, fontes
        // carregando, conteúdo lazy (Suspense) aparecendo, etc.
        const observer = new ResizeObserver((entries) => {
            entries.forEach((entry) => {
                write(entry.target as HTMLElement);
            });
        });

        panels.forEach((panel) => {
            observer.observe(panel, { box: "border-box" });
        });

        return () => {
            observer.disconnect();

            panels.forEach((panel) => {
                panel.style.removeProperty("--stack-h");
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}

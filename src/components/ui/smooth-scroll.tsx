// src/components/ui/smooth-scroll.tsx
//
// Adaptação do componente "smooth-scroll" para o EducaCube.
// Mantém a ideia original (Lenis no <html> + seções sticky que se
// empilham), mas sem Tailwind: o visual dos painéis vive em
// neuro-edu.css (camada `stack`) e a marcação fica no App.tsx.

import "lenis/dist/lenis.css";
import { ReactLenis } from "lenis/react";
import type { LenisOptions } from "lenis";
import type { ReactNode } from "react";

/**
 * Opções do Lenis.
 *
 * - smoothWheel: suaviza mouse/trackpad (desktop).
 * - syncTouch: false → no celular o toque usa o scroll NATIVO do
 *   navegador (inércia do iOS/Android). É o que faz o efeito de
 *   painéis empilhados funcionar bem no mobile: quem empilha é o
 *   `position: sticky`, e o Lenis não interfere no dedo.
 * - anchors: links como #ferramentas rolam suavemente até o alvo.
 *
 * Quem tem prefers-reduced-motion ativado é respeitado pelo próprio
 * Lenis (o scroll deixa de ser suavizado) e o CSS desliga o sticky.
 */
const SMOOTH_SCROLL_OPTIONS: LenisOptions = {
    lerp: 0.1,
    smoothWheel: true,
    syncTouch: false,
    anchors: true,
};

type SmoothScrollProps = {
    children: ReactNode;
};

export function SmoothScroll({ children }: SmoothScrollProps) {
    return (
        <ReactLenis
            root
            options={SMOOTH_SCROLL_OPTIONS}
        >
            {children}
        </ReactLenis>
    );
}

export default SmoothScroll;

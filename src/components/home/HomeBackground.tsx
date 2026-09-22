import { lazy, Suspense } from "react";

const RibbonGlow = lazy(() => import("../RibbonGlow"));

/**
 * Camadas fixas de fundo da Home: fita WebGL + véus, grade e grão.
 * Mantido exatamente como era em App.tsx.
 */
export default function HomeBackground() {
    return (
        <>
            <div
                className="ribbon-glow-background"
                aria-hidden="true"
            >
                <Suspense fallback={null}>
                    <RibbonGlow
                        background="#0B0A10"
                        color1="#000000"
                        color2="#7B61FF"
                        style={{
                            minWidth: 0,
                            minHeight: 0,
                        }}
                    />
                </Suspense>
            </div>

            <div className="video-overlay" />
            <div className="video-purple-glow" />
            <div className="architectural-grid" />
            <div className="side-line" />
            <div className="grain" />
        </>
    );
}

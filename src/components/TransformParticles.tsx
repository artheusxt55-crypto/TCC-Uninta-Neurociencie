import { useEffect, useRef } from "react";
import * as THREE from "three";

type TransformParticlesProps = {
    words: string[];
    color?: string;
    particleCount?: number;
};

type ParticleState = {
    cube: THREE.Vector3;
    word: THREE.Vector3;
};

function TransformParticles({
    words,
    color = "#c4a265",
    particleCount = 900,
}: TransformParticlesProps) {
    const containerRef =
        useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) return;

        /* =====================================================
         * CENA
         * ===================================================== */

        const scene = new THREE.Scene();

        const width =
            container.clientWidth || 800;

        const height =
            container.clientHeight || 500;

        const camera =
            new THREE.PerspectiveCamera(
                45,
                width / height,
                0.1,
                100
            );

        camera.position.set(0, 0, 7);

        const renderer =
            new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
            });

        renderer.setPixelRatio(
            Math.min(window.devicePixelRatio, 2)
        );

        renderer.setSize(width, height);

        renderer.outputColorSpace =
            THREE.SRGBColorSpace;

        container.appendChild(
            renderer.domElement
        );

        /* =====================================================
         * PARTICULAS
         * ===================================================== */

        const geometry =
            new THREE.BufferGeometry();

        const positions =
            new Float32Array(
                particleCount * 3
            );

        const particleStates: ParticleState[] =
            [];

        /*
         * Distribuição inicial em cubo.
         */

        for (
            let i = 0;
            i < particleCount;
            i++
        ) {
            const cube =
                new THREE.Vector3(
                    (Math.random() - 0.5) * 3.4,
                    (Math.random() - 0.5) * 3.4,
                    (Math.random() - 0.5) * 3.4
                );

            const word =
                new THREE.Vector3();

            particleStates.push({
                cube,
                word,
            });

            positions[i * 3] =
                cube.x;

            positions[i * 3 + 1] =
                cube.y;

            positions[i * 3 + 2] =
                cube.z;
        }

        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );

        /* =====================================================
         * MATERIAL
         * ===================================================== */

        const material =
            new THREE.PointsMaterial({
                color,
                size: 0.035,
                transparent: true,
                opacity: 0.9,
                depthWrite: false,
                blending:
                    THREE.AdditiveBlending,
            });

        const points =
            new THREE.Points(
                geometry,
                material
            );

        scene.add(points);

        /* =====================================================
         * TEXTO → PONTOS
         * ===================================================== */

        const canvas =
            document.createElement(
                "canvas"
            );

        const ctx =
            canvas.getContext("2d");

        if (!ctx) {
            return () => {
                geometry.dispose();
                material.dispose();
                renderer.dispose();

                if (
                    renderer.domElement
                        .parentNode ===
                    container
                ) {
                    container.removeChild(
                        renderer.domElement
                    );
                }
            };
        }

        canvas.width = 1200;
        canvas.height = 500;

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        ctx.fillStyle = "#ffffff";

        ctx.font =
            "bold 115px Arial";

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        /*
         * Junta as palavras em uma composição
         * visual única.
         */

        const texto =
            words.join(" · ");

        ctx.fillText(
            texto,
            canvas.width / 2,
            canvas.height / 2
        );

        const imageData =
            ctx.getImageData(
                0,
                0,
                canvas.width,
                canvas.height
            );

        const pixels =
            imageData.data;

        const textPoints: THREE.Vector3[] =
            [];

        /*
         * Amostragem dos pixels do texto.
         */

        for (
            let y = 0;
            y < canvas.height;
            y += 5
        ) {
            for (
                let x = 0;
                x < canvas.width;
                x += 5
            ) {
                const index =
                    (y *
                        canvas.width +
                        x) *
                    4;

                const alpha =
                    pixels[index + 3];

                if (alpha > 100) {
                    const px =
                        (x /
                            canvas.width -
                            0.5) *
                        6.5;

                    const py =
                        (0.5 -
                            y /
                                canvas.height) *
                        2.7;

                    const pz =
                        (Math.random() -
                            0.5) *
                        0.12;

                    textPoints.push(
                        new THREE.Vector3(
                            px,
                            py,
                            pz
                        )
                    );
                }
            }
        }

        /*
         * Distribui os pontos do texto
         * entre as partículas disponíveis.
         */

        for (
            let i = 0;
            i < particleCount;
            i++
        ) {
            const target =
                textPoints[
                    i %
                        Math.max(
                            textPoints.length,
                            1
                        )
                ];

            if (target) {
                particleStates[i].word.copy(
                    target
                );
            } else {
                particleStates[i].word.set(
                    0,
                    0,
                    0
                );
            }
        }

        /* =====================================================
         * ESTADO DA ANIMAÇÃO
         * ===================================================== */

        let phase = 0;

        /*
         * 0 = cubo
         * 1 = transição para palavras
         * 2 = palavras
         * 3 = retorno ao cubo
         */

        let phaseStart =
            performance.now();

        const cubeDuration = 2200;
        const wordDuration = 4200;
        const returnDuration = 2200;

        let animationFrame = 0;

        /* =====================================================
         * EASING
         * ===================================================== */

        const easeInOut = (
            value: number
        ) => {
            return (
                value < 0.5
                    ? 2 *
                      value *
                      value
                    : 1 -
                      Math.pow(
                          -2 * value +
                              2,
                          2
                      ) /
                          2
            );
        };

        /* =====================================================
         * ANIMAÇÃO
         * ===================================================== */

        const animate = (
            now: number
        ) => {
            animationFrame =
                requestAnimationFrame(
                    animate
                );

            const elapsed =
                now - phaseStart;

            const position =
                geometry.attributes
                    .position
                    .array as Float32Array;

            if (phase === 0) {
                /*
                 * CUBO
                 */

                for (
                    let i = 0;
                    i < particleCount;
                    i++
                ) {
                    const state =
                        particleStates[i];

                    position[i * 3] =
                        state.cube.x;

                    position[i * 3 + 1] =
                        state.cube.y;

                    position[i * 3 + 2] =
                        state.cube.z;
                }

                if (
                    elapsed >
                    cubeDuration
                ) {
                    phase = 1;
                    phaseStart = now;
                }
            }

            if (phase === 1) {
                /*
                 * CUBO → PALAVRAS
                 */

                const progress =
                    Math.min(
                        elapsed /
                            cubeDuration,
                        1
                    );

                const eased =
                    easeInOut(
                        progress
                    );

                for (
                    let i = 0;
                    i < particleCount;
                    i++
                ) {
                    const state =
                        particleStates[i];

                    const x =
                        THREE.MathUtils.lerp(
                            state.cube.x,
                            state.word.x,
                            eased
                        );

                    const y =
                        THREE.MathUtils.lerp(
                            state.cube.y,
                            state.word.y,
                            eased
                        );

                    const z =
                        THREE.MathUtils.lerp(
                            state.cube.z,
                            state.word.z,
                            eased
                        );

                    position[i * 3] =
                        x;

                    position[i * 3 + 1] =
                        y;

                    position[i * 3 + 2] =
                        z;
                }

                if (
                    progress >= 1
                ) {
                    phase = 2;
                    phaseStart = now;
                }
            }

            if (phase === 2) {
                /*
                 * PALAVRAS
                 */

                for (
                    let i = 0;
                    i < particleCount;
                    i++
                ) {
                    const state =
                        particleStates[i];

                    const floating =
                        Math.sin(
                            now *
                                0.0015 +
                                i *
                                    0.015
                        ) *
                        0.025;

                    position[i * 3] =
                        state.word.x;

                    position[i * 3 + 1] =
                        state.word.y +
                        floating;

                    position[i * 3 + 2] =
                        state.word.z;
                }

                if (
                    elapsed >
                    wordDuration
                ) {
                    phase = 3;
                    phaseStart = now;
                }
            }

            if (phase === 3) {
                /*
                 * PALAVRAS → CUBO
                 */

                const progress =
                    Math.min(
                        elapsed /
                            returnDuration,
                        1
                    );

                const eased =
                    easeInOut(
                        progress
                    );

                for (
                    let i = 0;
                    i < particleCount;
                    i++
                ) {
                    const state =
                        particleStates[i];

                    const x =
                        THREE.MathUtils.lerp(
                            state.word.x,
                            state.cube.x,
                            eased
                        );

                    const y =
                        THREE.MathUtils.lerp(
                            state.word.y,
                            state.cube.y,
                            eased
                        );

                    const z =
                        THREE.MathUtils.lerp(
                            state.word.z,
                            state.cube.z,
                            eased
                        );

                    position[i * 3] =
                        x;

                    position[i * 3 + 1] =
                        y;

                    position[i * 3 + 2] =
                        z;
                }

                if (
                    progress >= 1
                ) {
                    phase = 0;
                    phaseStart = now;
                }
            }

            geometry.attributes.position.needsUpdate =
                true;

            /*
             * Rotação muito sutil para não
             * competir com a coruja.
             */

            points.rotation.y =
                Math.sin(
                    now * 0.00025
                ) *
                0.08;

            renderer.render(
                scene,
                camera
            );
        };

        animationFrame =
            requestAnimationFrame(
                animate
            );

        /* =====================================================
         * RESPONSIVIDADE
         * ===================================================== */

        const handleResize = () => {
            const newWidth =
                container.clientWidth;

            const newHeight =
                container.clientHeight;

            if (
                newWidth <= 0 ||
                newHeight <= 0
            ) {
                return;
            }

            camera.aspect =
                newWidth /
                newHeight;

            camera.updateProjectionMatrix();

            renderer.setSize(
                newWidth,
                newHeight
            );
        };

        window.addEventListener(
            "resize",
            handleResize
        );

        /* =====================================================
         * CLEANUP
         * ===================================================== */

        return () => {
            cancelAnimationFrame(
                animationFrame
            );

            window.removeEventListener(
                "resize",
                handleResize
            );

            geometry.dispose();
            material.dispose();
            renderer.dispose();

            if (
                renderer.domElement
                    .parentNode ===
                container
            ) {
                container.removeChild(
                    renderer.domElement
                );
            }
        };
    }, [words, color, particleCount]);

    return (
        <div
            ref={containerRef}
            className="transform-particles"
            style={{
                width: "100%",
                height: "520px",
                position: "relative",
                overflow: "hidden",
            }}
        />
    );
}

export default TransformParticles;

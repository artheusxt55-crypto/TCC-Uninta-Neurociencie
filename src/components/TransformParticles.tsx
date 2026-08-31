import { useEffect, useRef } from "react";
import * as THREE from "three";

type TransformParticlesProps = {
    words: string[];
    color?: string;
    particleCount?: number;

    // Controles inspirados no Text Fall original
    cursorStrength?: number;
    cursorReach?: number;
    cursorDamping?: number;
};

type Point3D = {
    x: number;
    y: number;
    z: number;
};

const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

const lerp = (a: number, b: number, t: number) =>
    a + (b - a) * t;

const easeInOut = (t: number) => {
    t = clamp(t, 0, 1);

    return t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;
};

/* ============================================================
 * CUBO
 * ============================================================ */

function createCubePoints(
    count: number,
    size: number
): Point3D[] {
    const points: Point3D[] = [];

    const half = size / 2;

    for (let i = 0; i < count; i++) {
        const face = Math.floor(Math.random() * 6);

        const a = Math.random() * size - half;
        const b = Math.random() * size - half;

        let x = 0;
        let y = 0;
        let z = 0;

        switch (face) {
            case 0:
                x = -half;
                y = a;
                z = b;
                break;

            case 1:
                x = half;
                y = a;
                z = b;
                break;

            case 2:
                x = a;
                y = -half;
                z = b;
                break;

            case 3:
                x = a;
                y = half;
                z = b;
                break;

            case 4:
                x = a;
                y = b;
                z = -half;
                break;

            case 5:
                x = a;
                y = b;
                z = half;
                break;
        }

        points.push({
            x,
            y,
            z,
        });
    }

    return points;
}

/* ============================================================
 * TEXTO
 * ============================================================ */

function createTextPoints(
    text: string,
    count: number
): Point3D[] {
    const canvas = document.createElement("canvas");

    const ctx = canvas.getContext("2d");

    if (!ctx) {
        return [];
    }

    canvas.width = 1600;
    canvas.height = 500;

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle = "#ffffff";

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let fontSize = 220;

    do {
        ctx.font = `800 ${fontSize}px Arial`;

        const width = ctx.measureText(text).width;

        if (width <= 1450) {
            break;
        }

        fontSize -= 8;
    } while (fontSize > 60);

    ctx.font = `800 ${fontSize}px Arial`;

    ctx.fillText(
        text,
        canvas.width / 2,
        canvas.height / 2
    );

    const image = ctx.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const candidates: Point3D[] = [];

    const step = Math.max(
        2,
        Math.floor(
            Math.sqrt(
                (canvas.width * canvas.height) /
                    (count * 8)
            )
        )
    );

    for (
        let y = 0;
        y < canvas.height;
        y += step
    ) {
        for (
            let x = 0;
            x < canvas.width;
            x += step
        ) {
            const index =
                (y * canvas.width + x) * 4;

            const alpha =
                image.data[index + 3];

            if (alpha > 100) {
                const normalizedX =
                    (x / canvas.width - 0.5) * 10;

                const normalizedY =
                    -(y / canvas.height - 0.5) * 3.1;

                candidates.push({
                    x: normalizedX,
                    y: normalizedY,
                    z:
                        (Math.random() - 0.5) *
                        0.12,
                });
            }
        }
    }

    if (candidates.length === 0) {
        return [];
    }

    const result: Point3D[] = [];

    for (let i = 0; i < count; i++) {
        const source =
            candidates[
                Math.floor(
                    Math.random() *
                        candidates.length
                )
            ];

        result.push({
            x: source.x,
            y: source.y,
            z: source.z,
        });
    }

    return result;
}

/* ============================================================
 * COMPONENTE
 * ============================================================ */

export default function TransformParticles({
    words,
    color = "#c4a265",
    particleCount = 900,

    cursorStrength = 150,
    cursorReach = 30,
    cursorDamping = 16,
}: TransformParticlesProps) {
    const containerRef =
        useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) {
            return;
        }

        let destroyed = false;

        /* ====================================================
         * THREE
         * ==================================================== */

        const scene = new THREE.Scene();

        const camera =
            new THREE.PerspectiveCamera(
                45,
                1,
                0.1,
                100
            );

        camera.position.set(
            0,
            0,
            11
        );

        const renderer =
            new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
            });

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio || 1,
                2
            )
        );

        renderer.setClearColor(
            0x000000,
            0
        );

        container.innerHTML = "";

        container.appendChild(
            renderer.domElement
        );

        /* ====================================================
         * GEOMETRIA
         * ==================================================== */

        const geometry =
            new THREE.BufferGeometry();

        const positions =
            new Float32Array(
                particleCount * 3
            );

        const initialPositions =
            new Float32Array(
                particleCount * 3
            );

        const textPositions =
            new Float32Array(
                particleCount * 3
            );

        /* ====================================================
         * VELOCIDADE / OFFSET DO MOUSE
         *
         * Cada partícula recebe um deslocamento independente.
         * Isso é o que cria o efeito de "empurrar" as partículas.
         * ==================================================== */

        const mouseOffsets =
            new Float32Array(
                particleCount * 3
            );

        const mouseVelocities =
            new Float32Array(
                particleCount * 3
            );

        /* ====================================================
         * CUBO
         * ==================================================== */

        const cubePoints =
            createCubePoints(
                particleCount,
                5.2
            );

        cubePoints.forEach(
            (point, index) => {
                const i = index * 3;

                positions[i] =
                    point.x;

                positions[i + 1] =
                    point.y;

                positions[i + 2] =
                    point.z;

                initialPositions[i] =
                    point.x;

                initialPositions[i + 1] =
                    point.y;

                initialPositions[i + 2] =
                    point.z;
            }
        );

        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );

        /* ====================================================
         * MATERIAL
         * ==================================================== */

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

        const particleSystem =
            new THREE.Points(
                geometry,
                material
            );

        scene.add(
            particleSystem
        );

        /* ====================================================
         * PALAVRAS
         * ==================================================== */

        const textTargets: Float32Array[] =
            [];

        words.forEach((word) => {
            const points =
                createTextPoints(
                    word,
                    particleCount
                );

            if (!points.length) {
                return;
            }

            const target =
                new Float32Array(
                    particleCount * 3
                );

            for (
                let i = 0;
                i < particleCount;
                i++
            ) {
                const point =
                    points[
                        i % points.length
                    ];

                const index = i * 3;

                target[index] =
                    point.x;

                target[index + 1] =
                    point.y;

                target[index + 2] =
                    point.z;
            }

            textTargets.push(target);
        });

        /* ====================================================
         * SEQUÊNCIA
         *
         * CUBO
         *   ↓
         * PALAVRA 1
         *   ↓
         * PALAVRA 2
         *   ↓
         * PALAVRA 3
         *   ↓
         * CUBO
         *   ↓
         * REPETE
         * ==================================================== */

        const targets = [
            new Float32Array(
                initialPositions
            ),

            ...textTargets,

            new Float32Array(
                initialPositions
            ),
        ];

        let currentTarget = 0;

        let nextTarget =
            targets.length > 1
                ? 1
                : 0;

        let transitionStart =
            performance.now();

        const transitionDuration =
            1800;

        const holdDuration =
            2200;

        let holding = true;

        let holdStart =
            performance.now();

        /* ====================================================
         * MOUSE
         * ==================================================== */

        let mouseX = 0;
        let mouseY = 0;

        let targetMouseX = 0;
        let targetMouseY = 0;

        let mouseActive = false;

        const handleMouseMove = (
            event: MouseEvent
        ) => {
            targetMouseX =
                event.clientX /
                    window.innerWidth -
                0.5;

            targetMouseY =
                event.clientY /
                    window.innerHeight -
                0.5;

            mouseActive = true;
        };

        const handleMouseLeave =
            () => {
                mouseActive = false;
            };

        window.addEventListener(
            "mousemove",
            handleMouseMove
        );

        window.addEventListener(
            "mouseout",
            handleMouseLeave
        );

        /* ====================================================
         * RESIZE
         * ==================================================== */

        const resize = () => {
            const width =
                container.clientWidth ||
                800;

            const height =
                container.clientHeight ||
                500;

            camera.aspect =
                width / height;

            camera.updateProjectionMatrix();

            renderer.setSize(
                width,
                height,
                false
            );
        };

        resize();

        window.addEventListener(
            "resize",
            resize
        );

        /* ====================================================
         * REPULSÃO DO MOUSE
         *
         * O mouse é convertido para o espaço local do sistema
         * de partículas.
         *
         * A força aumenta quando o cursor chega perto.
         * ==================================================== */

        const applyMouseForce = (
            index: number,
            baseX: number,
            baseY: number,
            baseZ: number,
            delta: number
        ) => {
            const i = index * 3;

            if (!mouseActive) {
                return;
            }

            /*
             * Coordenada do cursor no espaço visual.
             *
             * O range é propositalmente maior que a área do texto,
             * permitindo que o efeito alcance as extremidades.
             */

            const cursorX =
                targetMouseX * 7.5;

            const cursorY =
                -targetMouseY * 4.2;

            const particleX =
                baseX +
                mouseOffsets[i];

            const particleY =
                baseY +
                mouseOffsets[i + 1];

            const dx =
                particleX -
                cursorX;

            const dy =
                particleY -
                cursorY;

            const distance =
                Math.sqrt(
                    dx * dx +
                        dy * dy
                );

            /*
             * reach original:
             *
             * 30 = 30% do tamanho útil.
             */

            const radius =
                Math.max(
                    0.5,
                    (cursorReach / 100) *
                        7.5
                );

            if (
                distance >= radius ||
                distance === 0
            ) {
                return;
            }

            /*
             * 1 = mouse encostando
             * 0 = limite do raio
             */

            const influence =
                1 -
                distance / radius;

            /*
             * Curva quadrática.
             * Quanto mais perto do mouse,
             * mais forte a repulsão.
             */

            const force =
                influence *
                influence *
                (cursorStrength / 100) *
                0.035;

            const nx =
                dx / distance;

            const ny =
                dy / distance;

            /*
             * Aplica velocidade em vez de simplesmente
             * alterar a posição.
             *
             * Isso deixa o movimento mais orgânico.
             */

            mouseVelocities[i] +=
                nx *
                force *
                delta *
                60;

            mouseVelocities[i + 1] +=
                ny *
                force *
                delta *
                60;

            /*
             * Pequeno deslocamento em Z.
             * Cria sensação de profundidade quando
             * o cursor atravessa as partículas.
             */

            mouseVelocities[i + 2] +=
                influence *
                (Math.random() - 0.5) *
                force *
                0.2;
        };

        /* ====================================================
         * ANIMAÇÃO
         * ==================================================== */

        let animationFrame = 0;

        let lastTime =
            performance.now();

        const animate = (
            now: number
        ) => {
            if (destroyed) {
                return;
            }

            animationFrame =
                requestAnimationFrame(
                    animate
                );

            const delta =
                Math.min(
                    0.05,
                    (now - lastTime) /
                        1000
                );

            lastTime = now;

            /* =================================================
             * SUAVIZAÇÃO DO MOUSE
             * ================================================= */

            mouseX = lerp(
                mouseX,
                targetMouseX,
                0.035
            );

            mouseY = lerp(
                mouseY,
                targetMouseY,
                0.035
            );

            /* =================================================
             * TRANSFORMAÇÃO
             * ================================================= */

            const elapsed =
                now -
                transitionStart;

            if (holding) {
                if (
                    now -
                        holdStart >=
                    holdDuration
                ) {
                    holding = false;

                    transitionStart =
                        now;
                }
            } else {
                const progress =
                    clamp(
                        elapsed /
                            transitionDuration,
                        0,
                        1
                    );

                const eased =
                    easeInOut(
                        progress
                    );

                const from =
                    targets[
                        currentTarget
                    ];

                const to =
                    targets[
                        nextTarget
                    ];

                for (
                    let i = 0;
                    i < particleCount;
                    i++
                ) {
                    const index =
                        i * 3;

                    const baseX =
                        lerp(
                            from[index],
                            to[index],
                            eased
                        );

                    const baseY =
                        lerp(
                            from[index + 1],
                            to[index + 1],
                            eased
                        );

                    const baseZ =
                        lerp(
                            from[index + 2],
                            to[index + 2],
                            eased
                        );

                    /*
                     * Guarda a posição da transformação.
                     * O mouse será aplicado por cima dela.
                     */

                    textPositions[index] =
                        baseX;

                    textPositions[
                        index + 1
                    ] = baseY;

                    textPositions[
                        index + 2
                    ] = baseZ;

                    applyMouseForce(
                        i,
                        baseX,
                        baseY,
                        baseZ,
                        delta
                    );

                    /* =========================================
                     * DAMPING
                     *
                     * Equivalente ao retorno suave do original.
                     * ========================================= */

                    const damping =
                        1 -
                        Math.pow(
                            1 -
                                cursorDamping /
                                    100,
                            delta * 60
                        );

                    mouseVelocities[
                        index
                    ] *=
                        1 -
                        damping;

                    mouseVelocities[
                        index + 1
                    ] *=
                        1 -
                        damping;

                    mouseVelocities[
                        index + 2
                    ] *=
                        1 -
                        damping;

                    /*
                     * Movimento do offset.
                     */

                    mouseOffsets[
                        index
                    ] +=
                        mouseVelocities[
                            index
                        ];

                    mouseOffsets[
                        index + 1
                    ] +=
                        mouseVelocities[
                            index + 1
                        ];

                    mouseOffsets[
                        index + 2
                    ] +=
                        mouseVelocities[
                            index + 2
                        ];

                    /*
                     * Retorno para a formação original.
                     *
                     * Isso impede que as partículas fiquem
                     * permanentemente afastadas.
                     */

                    mouseOffsets[
                        index
                    ] *= 0.91;

                    mouseOffsets[
                        index + 1
                    ] *= 0.91;

                    mouseOffsets[
                        index + 2
                    ] *= 0.91;

                    positions[index] =
                        baseX +
                        mouseOffsets[
                            index
                        ];

                    positions[
                        index + 1
                    ] =
                        baseY +
                        mouseOffsets[
                            index + 1
                        ];

                    positions[
                        index + 2
                    ] =
                        baseZ +
                        mouseOffsets[
                            index + 2
                        ];
                }

                geometry.attributes.position.needsUpdate =
                    true;

                if (
                    progress >= 1
                ) {
                    currentTarget =
                        nextTarget;

                    nextTarget++;

                    if (
                        nextTarget >=
                        targets.length
                    ) {
                        nextTarget = 0;
                    }

                    transitionStart =
                        now;

                    holdStart =
                        now;

                    holding = true;
                }
            }

            /* =================================================
             * QUANDO ESTÁ PARADO
             *
             * Mesmo durante o hold, continuamos aplicando
             * a física do mouse.
             * ================================================= */

            if (holding) {
                const current =
                    targets[
                        currentTarget
                    ];

                for (
                    let i = 0;
                    i < particleCount;
                    i++
                ) {
                    const index =
                        i * 3;

                    const baseX =
                        current[index];

                    const baseY =
                        current[index + 1];

                    const baseZ =
                        current[index + 2];

                    applyMouseForce(
                        i,
                        baseX,
                        baseY,
                        baseZ,
                        delta
                    );

                    const damping =
                        1 -
                        Math.pow(
                            1 -
                                cursorDamping /
                                    100,
                            delta * 60
                        );

                    mouseVelocities[
                        index
                    ] *=
                        1 -
                        damping;

                    mouseVelocities[
                        index + 1
                    ] *=
                        1 -
                        damping;

                    mouseVelocities[
                        index + 2
                    ] *=
                        1 -
                        damping;

                    mouseOffsets[
                        index
                    ] +=
                        mouseVelocities[
                            index
                        ];

                    mouseOffsets[
                        index + 1
                    ] +=
                        mouseVelocities[
                            index + 1
                        ];

                    mouseOffsets[
                        index + 2
                    ] +=
                        mouseVelocities[
                            index + 2
                        ];

                    mouseOffsets[
                        index
                    ] *= 0.91;

                    mouseOffsets[
                        index + 1
                    ] *= 0.91;

                    mouseOffsets[
                        index + 2
                    ] *= 0.91;

                    positions[index] =
                        baseX +
                        mouseOffsets[
                            index
                        ];

                    positions[
                        index + 1
                    ] =
                        baseY +
                        mouseOffsets[
                            index + 1
                        ];

                    positions[
                        index + 2
                    ] =
                        baseZ +
                        mouseOffsets[
                            index + 2
                        ];
                }

                geometry.attributes.position.needsUpdate =
                    true;
            }

            /* =================================================
             * ROTAÇÃO PELO MOUSE
             *
             * Mantém a funcionalidade que já existia no seu
             * TransformParticles.
             * ================================================= */

            particleSystem.rotation.y =
                lerp(
                    particleSystem.rotation.y,
                    mouseX * 0.35,
                    0.025
                );

            particleSystem.rotation.x =
                lerp(
                    particleSystem.rotation.x,
                    -mouseY * 0.18,
                    0.025
                );

            particleSystem.rotation.z =
                Math.sin(
                    now * 0.00035
                ) * 0.025;

            /* =================================================
             * FLUTUAÇÃO
             * ================================================= */

            particleSystem.position.y =
                Math.sin(
                    now * 0.0008
                ) * 0.08;

            particleSystem.position.x =
                Math.sin(
                    now * 0.0005
                ) * 0.04;

            /* =================================================
             * RENDER
             * ================================================= */

            renderer.render(
                scene,
                camera
            );
        };

        animationFrame =
            requestAnimationFrame(
                animate
            );

        /* ====================================================
         * CLEANUP
         * ==================================================== */

        return () => {
            destroyed = true;

            cancelAnimationFrame(
                animationFrame
            );

            window.removeEventListener(
                "mousemove",
                handleMouseMove
            );

            window.removeEventListener(
                "mouseout",
                handleMouseLeave
            );

            window.removeEventListener(
                "resize",
                resize
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
    }, [
        words,
        color,
        particleCount,
        cursorStrength,
        cursorReach,
        cursorDamping,
    ]);

    return (
        <div
            ref={containerRef}
            className="transform-particles"
            aria-label="Visualização animada do conhecimento"
        />
    );
}

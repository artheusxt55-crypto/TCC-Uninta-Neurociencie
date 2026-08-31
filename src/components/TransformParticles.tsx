import { useEffect, useRef } from "react";
import * as THREE from "three";

type TransformParticlesProps = {
    words: string[];
    color?: string;
    particleCount?: number;
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

function createCubePoints(count: number, size: number): Point3D[] {
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

        points.push({ x, y, z });
    }

    return points;
}

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

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    let fontSize = 220;

    do {
        ctx.font = `700 ${fontSize}px Arial`;

        const width = ctx.measureText(text).width;

        if (width <= 1450) break;

        fontSize -= 8;
    } while (fontSize > 60);

    ctx.font = `700 ${fontSize}px Arial`;

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

            const alpha = image.data[index + 3];

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

export default function TransformParticles({
    words,
    color = "#c4a265",
    particleCount = 900,
}: TransformParticlesProps) {
    const containerRef =
        useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) return;

        let destroyed = false;

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
                window.devicePixelRatio,
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

        const targetPositions =
            new Float32Array(
                particleCount * 3
            );

        const cubePoints =
            createCubePoints(
                particleCount,
                5.2
            );

        cubePoints.forEach(
            (point, index) => {
                positions[index * 3] =
                    point.x;

                positions[index * 3 + 1] =
                    point.y;

                positions[index * 3 + 2] =
                    point.z;

                initialPositions[index * 3] =
                    point.x;

                initialPositions[
                    index * 3 + 1
                ] = point.y;

                initialPositions[
                    index * 3 + 2
                ] = point.z;

                targetPositions[
                    index * 3
                ] = point.x;

                targetPositions[
                    index * 3 + 1
                ] = point.y;

                targetPositions[
                    index * 3 + 2
                ] = point.z;
            }
        );

        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );

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

        /* =====================================================
         * PALAVRAS
         * ===================================================== */

        const textTargets: Float32Array[] =
            [];

        words.forEach((word) => {
            const points =
                createTextPoints(
                    word,
                    particleCount
                );

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

                target[i * 3] =
                    point.x;

                target[i * 3 + 1] =
                    point.y;

                target[i * 3 + 2] =
                    point.z;
            }

            textTargets.push(target);
        });

        /* =====================================================
         * ESTADO DA ANIMAÇÃO
         *
         * 0 = cubo
         * 1 = palavra
         * 2 = próxima palavra
         * ...
         * último = cubo novamente
         * ===================================================== */

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
        let nextTarget = 1;

        let transitionStart =
            performance.now();

        const transitionDuration = 1800;

        const holdDuration = 2200;

        let holding = true;
        let holdStart =
            performance.now();

        /* =====================================================
         * MOUSE
         * ===================================================== */

        let mouseX = 0;
        let mouseY = 0;

        let targetMouseX = 0;
        let targetMouseY = 0;

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
        };

        window.addEventListener(
            "mousemove",
            handleMouseMove
        );

        /* =====================================================
         * RESIZE
         * ===================================================== */

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

        /* =====================================================
         * ANIMAÇÃO
         * ===================================================== */

        let animationFrame = 0;

        const animate = (
            now: number
        ) => {
            if (destroyed) return;

            animationFrame =
                requestAnimationFrame(
                    animate
                );

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

            const elapsed =
                now - transitionStart;

            if (holding) {
                if (
                    now - holdStart >=
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

                    positions[index] =
                        lerp(
                            from[index],
                            to[index],
                            eased
                        );

                    positions[
                        index + 1
                    ] = lerp(
                        from[index + 1],
                        to[index + 1],
                        eased
                    );

                    positions[
                        index + 2
                    ] = lerp(
                        from[index + 2],
                        to[index + 2],
                        eased
                    );
                }

                geometry.attributes.position.needsUpdate =
                    true;

                if (progress >= 1) {
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
             * MOVIMENTO 3D
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
         * CLEANUP
         * ===================================================== */

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
    ]);

    return (
        <div
            ref={containerRef}
            className="transform-particles"
            aria-label="Visualização animada do conhecimento"
        />
    );
}

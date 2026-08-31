```tsx
import "./../styles/transform-particles.css";
import { useEffect, useRef } from "react";

import * as THREE from "three";

type TransformParticlesProps = {
    words?: string[];
    color?: string;
    particleCount?: number;
};

type Particle = {
    mesh: THREE.Sprite;
    cubeTarget: THREE.Vector3;
    textTarget: THREE.Vector3;
    velocity: THREE.Vector3;
    phase: number;
};

const DEFAULT_WORDS = [
    "PEDAGOGIA",
    "APRENDIZAGEM",
    "NEUROEDUCAÇÃO",
    "SABEDORIA",
];

const CHARACTERS = "01ABCDEFGHIJKLMNOPQRSTUVWXYZ#@&";

function randomCharacter() {
    return CHARACTERS[
        Math.floor(Math.random() * CHARACTERS.length)
    ];
}

function createCharacterTexture(
    character: string,
    color: string
): THREE.CanvasTexture {
    const canvas = document.createElement("canvas");

    canvas.width = 128;
    canvas.height = 128;

    const context = canvas.getContext("2d");

    if (!context) {
        throw new Error("Não foi possível criar o contexto do Canvas.");
    }

    context.clearRect(0, 0, 128, 128);

    context.fillStyle = color;
    context.font = "bold 72px monospace";
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillText(character, 64, 64);

    return new THREE.CanvasTexture(canvas);
}

function createParticleMaterial(
    character: string,
    color: string
): THREE.SpriteMaterial {
    const texture = createCharacterTexture(character, color);

    return new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
    });
}

function createCubeTargets(count: number): THREE.Vector3[] {
    const targets: THREE.Vector3[] = [];

    const size = 2.6;
    const half = size / 2;

    const pointsPerEdge = Math.max(
        2,
        Math.ceil(count / 12)
    );

    const edges: [THREE.Vector3, THREE.Vector3][] = [
        [
            new THREE.Vector3(-half, -half, -half),
            new THREE.Vector3(half, -half, -half),
        ],
        [
            new THREE.Vector3(half, -half, -half),
            new THREE.Vector3(half, half, -half),
        ],
        [
            new THREE.Vector3(half, half, -half),
            new THREE.Vector3(-half, half, -half),
        ],
        [
            new THREE.Vector3(-half, half, -half),
            new THREE.Vector3(-half, -half, -half),
        ],

        [
            new THREE.Vector3(-half, -half, half),
            new THREE.Vector3(half, -half, half),
        ],
        [
            new THREE.Vector3(half, -half, half),
            new THREE.Vector3(half, half, half),
        ],
        [
            new THREE.Vector3(half, half, half),
            new THREE.Vector3(-half, half, half),
        ],
        [
            new THREE.Vector3(-half, half, half),
            new THREE.Vector3(-half, -half, half),
        ],

        [
            new THREE.Vector3(-half, -half, -half),
            new THREE.Vector3(-half, -half, half),
        ],
        [
            new THREE.Vector3(half, -half, -half),
            new THREE.Vector3(half, -half, half),
        ],
        [
            new THREE.Vector3(half, half, -half),
            new THREE.Vector3(half, half, half),
        ],
        [
            new THREE.Vector3(-half, half, -half),
            new THREE.Vector3(-half, half, half),
        ],
    ];

    for (const [start, end] of edges) {
        for (let i = 0; i < pointsPerEdge; i++) {
            const t =
                i / Math.max(1, pointsPerEdge - 1);

            targets.push(
                new THREE.Vector3(
                    THREE.MathUtils.lerp(
                        start.x,
                        end.x,
                        t
                    ),
                    THREE.MathUtils.lerp(
                        start.y,
                        end.y,
                        t
                    ),
                    THREE.MathUtils.lerp(
                        start.z,
                        end.z,
                        t
                    )
                )
            );

            if (targets.length >= count) {
                return targets;
            }
        }
    }

    while (targets.length < count) {
        targets.push(
            new THREE.Vector3(
                (Math.random() - 0.5) * size,
                (Math.random() - 0.5) * size,
                (Math.random() - 0.5) * size
            )
        );
    }

    return targets;
}

function createTextTargets(
    text: string,
    count: number
): THREE.Vector3[] {
    const canvas = document.createElement("canvas");

    canvas.width = 1200;
    canvas.height = 400;

    const context = canvas.getContext("2d");

    if (!context) {
        return [];
    }

    context.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    context.fillStyle = "#ffffff";
    context.font = "bold 170px Arial";
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.fillText(
        text,
        canvas.width / 2,
        canvas.height / 2
    );

    const image = context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height
    );

    const rawPoints: THREE.Vector3[] = [];

    const step = 8;

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
                    (x / canvas.width - 0.5) * 7;

                const normalizedY =
                    -(y / canvas.height - 0.5) * 2.4;

                rawPoints.push(
                    new THREE.Vector3(
                        normalizedX,
                        normalizedY,
                        0
                    )
                );
            }
        }
    }

    if (rawPoints.length === 0) {
        return [];
    }

    const targets: THREE.Vector3[] = [];

    for (let i = 0; i < count; i++) {
        const point =
            rawPoints[
                Math.floor(
                    Math.random() *
                        rawPoints.length
                )
            ];

        targets.push(
            point.clone().add(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 0.025,
                    (Math.random() - 0.5) * 0.025,
                    (Math.random() - 0.5) * 0.025
                )
            )
        );
    }

    return targets;
}

export default function TransformParticles({
    words = DEFAULT_WORDS,
    color = "#c4a265",
    particleCount = 900,
}: TransformParticlesProps) {
    const containerRef =
        useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const container = containerRef.current;

        if (!container) return;

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
            10
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

        container.appendChild(
            renderer.domElement
        );

        const cubeGroup =
            new THREE.Group();

        scene.add(cubeGroup);

        const particles: Particle[] = [];

        const cubeTargets =
            createCubeTargets(
                particleCount
            );

        let currentWordIndex = 0;

        let textTargets =
            createTextTargets(
                words[0],
                particleCount
            );

        while (
            textTargets.length <
            particleCount
        ) {
            textTargets.push(
                new THREE.Vector3(
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 3,
                    (Math.random() - 0.5) * 2
                )
            );
        }

        for (
            let i = 0;
            i < particleCount;
            i++
        ) {
            const character =
                randomCharacter();

            const material =
                createParticleMaterial(
                    character,
                    color
                );

            const sprite =
                new THREE.Sprite(material);

            sprite.scale.set(
                0.18,
                0.18,
                0.18
            );

            sprite.position.set(
                (Math.random() - 0.5) * 12,
                Math.random() * 8 - 4,
                (Math.random() - 0.5) * 6
            );

            cubeGroup.add(sprite);

            particles.push({
                mesh: sprite,
                cubeTarget:
                    cubeTargets[i].clone(),
                textTarget:
                    textTargets[i].clone(),
                velocity:
                    new THREE.Vector3(
                        (Math.random() - 0.5) * 0.02,
                        Math.random() * 0.04,
                        (Math.random() - 0.5) * 0.02
                    ),
                phase:
                    Math.random() * Math.PI * 2,
            });
        }

        type AnimationState =
            | "fall"
            | "cube"
            | "cubeBreak"
            | "text"
            | "textBreak";

        let state: AnimationState =
            "fall";

        let stateStart =
            performance.now();

        let previousTime =
            performance.now();

        const FALL_TIME = 2200;
        const CUBE_TIME = 3500;
        const CUBE_BREAK_TIME = 1800;
        const TEXT_TIME = 3500;
        const TEXT_BREAK_TIME = 1800;

        const ease = (
            value: number
        ) => {
            const t =
                THREE.MathUtils.clamp(
                    value,
                    0,
                    1
                );

            return (
                1 -
                Math.pow(1 - t, 4)
            );
        };

        const changeState = (
            next: AnimationState
        ) => {
            state = next;
            stateStart =
                performance.now();

            particles.forEach(
                (particle) => {
                    particle.velocity.set(
                        (Math.random() -
                            0.5) *
                            0.025,
                        Math.random() *
                            0.035,
                        (Math.random() -
                            0.5) *
                            0.025
                    );
                }
            );
        };

        const prepareNextWord = () => {
            currentWordIndex =
                (currentWordIndex + 1) %
                words.length;

            textTargets =
                createTextTargets(
                    words[
                        currentWordIndex
                    ],
                    particleCount
                );

            while (
                textTargets.length <
                particleCount
            ) {
                textTargets.push(
                    new THREE.Vector3(
                        (Math.random() -
                            0.5) *
                            6,
                        (Math.random() -
                            0.5) *
                            3,
                        (Math.random() -
                            0.5) *
                            2
                    )
                );
            }

            particles.forEach(
                (particle, index) => {
                    particle.textTarget =
                        textTargets[
                            index
                        ].clone();
                }
            );
        };

        const animate = (
            now: number
        ) => {
            const delta =
                Math.min(
                    (now -
                        previousTime) /
                        1000,
                    0.05
                );

            previousTime = now;

            const elapsed =
                now - stateStart;

            const progress =
                elapsed /
                ({
                    fall: FALL_TIME,
                    cube: CUBE_TIME,
                    cubeBreak:
                        CUBE_BREAK_TIME,
                    text: TEXT_TIME,
                    textBreak:
                        TEXT_BREAK_TIME,
                }[state]);

            const t = ease(
                progress
            );

            if (state === "fall") {
                particles.forEach(
                    (particle) => {
                        particle.mesh.position.y +=
                            particle.velocity.y *
                            60 *
                            delta;

                        particle.velocity.y -=
                            0.0018;

                        particle.mesh.rotation.z +=
                            0.01;

                        particle.mesh.material.opacity =
                            0.9;
                    }
                );

                if (progress >= 1) {
                    changeState(
                        "cube"
                    );
                }
            }

            if (state === "cube") {
                particles.forEach(
                    (particle) => {
                        particle.mesh.position.lerp(
                            particle.cubeTarget,
                            0.08
                        );

                        particle.mesh.material.opacity =
                            0.9;
                    }
                );

                cubeGroup.rotation.y +=
                    0.0035;

                cubeGroup.rotation.x =
                    Math.sin(
                        now * 0.0005
                    ) * 0.08;

                if (progress >= 1) {
                    changeState(
                        "cubeBreak"
                    );
                }
            }

            if (
                state ===
                "cubeBreak"
            ) {
                particles.forEach(
                    (particle) => {
                        const direction =
                            particle.cubeTarget
                                .clone()
                                .normalize();

                        const target =
                            particle.cubeTarget
                                .clone()
                                .add(
                                    direction.multiplyScalar(
                                        5
                                    )
                                );

                        particle.mesh.position.lerp(
                            target,
                            0.035
                        );

                        particle.mesh.material.opacity =
                            1 - t;
                    }
                );

                cubeGroup.rotation.y +=
                    0.008;

                if (progress >= 1) {
                    prepareNextWord();

                    particles.forEach(
                        (particle) => {
                            particle.mesh.position.set(
                                (Math.random() -
                                    0.5) *
                                    10,
                                (Math.random() -
                                    0.5) *
                                    6,
                                (Math.random() -
                                    0.5) *
                                    5
                            );

                            particle.mesh.material.opacity =
                                0.9;
                        }
                    );

                    changeState(
                        "text"
                    );
                }
            }

            if (state === "text") {
                particles.forEach(
                    (particle) => {
                        particle.mesh.position.lerp(
                            particle.textTarget,
                            0.075
                        );

                        particle.mesh.material.opacity =
                            0.9;
                    }
                );

                if (progress >= 1) {
                    changeState(
                        "textBreak"
                    );
                }
            }

            if (
                state ===
                "textBreak"
            ) {
                particles.forEach(
                    (particle) => {
                        const direction =
                            particle.textTarget
                                .clone()
                                .normalize();

                        const target =
                            particle.textTarget
                                .clone()
                                .add(
                                    direction.multiplyScalar(
                                        5
                                    )
                                );

                        particle.mesh.position.lerp(
                            target,
                            0.035
                        );

                        particle.mesh.material.opacity =
                            1 - t;
                    }
                );

                if (progress >= 1) {
                    particles.forEach(
                        (particle) => {
                            particle.mesh.position.set(
                                (Math.random() -
                                    0.5) *
                                    10,
                                Math.random() *
                                    7 -
                                    3,
                                (Math.random() -
                                    0.5) *
                                    5
                            );

                            particle.mesh.material.opacity =
                                0.9;
                        }
                    );

                    changeState(
                        "fall"
                    );
                }
            }

            cubeGroup.position.y =
                Math.sin(
                    now * 0.0008
                ) * 0.08;

            renderer.render(
                scene,
                camera
            );

            animationFrame =
                requestAnimationFrame(
                    animate
                );
        };

        let animationFrame =
            requestAnimationFrame(
                animate
            );

        const resize = () => {
            const width =
                container.clientWidth ||
                500;

            const height =
                container.clientHeight ||
                400;

            camera.aspect =
                width / height;

            camera.updateProjectionMatrix();

            renderer.setSize(
                width,
                height
            );
        };

        resize();

        window.addEventListener(
            "resize",
            resize
        );

        return () => {
            cancelAnimationFrame(
                animationFrame
            );

            window.removeEventListener(
                "resize",
                resize
            );

            particles.forEach(
                (particle) => {
                    particle.mesh.material.map?.dispose();
                    particle.mesh.material.dispose();
                }
            );

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

            scene.clear();
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
            aria-label="Animação de partículas formando palavras e um cubo"
        />
    );
}
```

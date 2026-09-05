import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const MODEL_URL =
    "https://kczzuvkuubeqdokjihrm.supabase.co/storage/v1/object/public/modelos%203d/Corujafinal.glb";

export default function OwlShowcase() {
    const containerRef =
        useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const container =
            containerRef.current;

        if (!container) return;

        /* =================================================
         * CENA
         * ================================================= */

        const scene = new THREE.Scene();

        scene.fog = new THREE.FogExp2(
            0x0c0b10,
            0.045
        );

        /* =================================================
         * TAMANHO DO CONTAINER
         * ================================================= */

        const width =
            container.clientWidth || 500;

        const height =
            container.clientHeight || 500;

        const aspect =
            width / height;

        /* =================================================
         * CÂMERA
         * ================================================= */

        const camera =
            new THREE.PerspectiveCamera(
                35,
                aspect,
                0.1,
                1000
            );

        camera.position.set(
            0,
            0,
            8
        );

        camera.lookAt(
            0,
            0,
            0
        );

        /* =================================================
         * RENDERER
         * ================================================= */

        const renderer =
            new THREE.WebGLRenderer({
                antialias: true,
                alpha: true,
            });

        renderer.setSize(
            width,
            height
        );

        renderer.setPixelRatio(
            Math.min(
                window.devicePixelRatio,
                2
            )
        );

        renderer.outputColorSpace =
            THREE.SRGBColorSpace;

        renderer.setClearColor(
            0x000000,
            0
        );

        container.appendChild(
            renderer.domElement
        );

        /* =================================================
         * ILUMINAÇÃO
         * ================================================= */

        const ambientLight =
            new THREE.AmbientLight(
                0xffffff,
                0.75
            );

        scene.add(
            ambientLight
        );

        const mainLight =
            new THREE.PointLight(
                0xffffff,
                1.7
            );

        mainLight.position.set(
            5,
            5,
            10
        );

        scene.add(
            mainLight
        );

        const violetLight =
            new THREE.PointLight(
                0x6e458c,
                1.3
            );

        violetLight.position.set(
            -5,
            -2,
            5
        );

        scene.add(
            violetLight
        );

        const brassLight =
            new THREE.PointLight(
                0xb8935a,
                0.35
            );

        brassLight.position.set(
            2,
            -3,
            -4
        );

        scene.add(
            brassLight
        );

        /* =================================================
         * PARTÍCULAS
         * ================================================= */

        const partGeo =
            new THREE.BufferGeometry();

        const partCount = 500;

        const positions =
            new Float32Array(
                partCount * 3
            );

        for (
            let i = 0;
            i < partCount * 3;
            i++
        ) {
            positions[i] =
                (Math.random() - 0.5) *
                15;
        }

        partGeo.setAttribute(
            "position",
            new THREE.BufferAttribute(
                positions,
                3
            )
        );

        const partMat =
            new THREE.PointsMaterial({
                size: 0.018,
                color: 0x9b81c4,
                transparent: true,
                opacity: 0.22,
            });

        const particles =
            new THREE.Points(
                partGeo,
                partMat
            );

        scene.add(
            particles
        );

        /* =================================================
         * MODELO DA CORUJA
         * ================================================= */

        let brain:
            | THREE.Object3D
            | null = null;

        let targetX = 0;
        let targetY = 0;

        let entradaInicio:
            | number
            | null = null;

        let entradaFinalizada =
            false;

        const loader =
            new GLTFLoader();

        loader.load(
            MODEL_URL,

            (gltf) => {
                brain =
                    gltf.scene;

                /* -----------------------------------------
                 * CONFIGURAÇÃO DO MODELO
                 * ----------------------------------------- */

                brain.traverse(
                    (object) => {
                        if (
                            object instanceof
                            THREE.Mesh
                        ) {
                            object.castShadow =
                                true;

                            object.receiveShadow =
                                true;
                        }
                    }
                );

                /*
                 * IMPORTANTE:
                 * Escala uniforme.
                 * Isso NÃO deforma o modelo.
                 */

                brain.scale.set(
                    0.01,
                    0.01,
                    0.01
                );

                brain.position.set(
                    0,
                    -0.8,
                    0
                );

                brain.rotation.set(
                    0,
                    -0.35,
                    0
                );

                scene.add(
                    brain
                );

                entradaInicio =
                    performance.now();

                entradaFinalizada =
                    false;
            },

            undefined,

            (error) => {
                console.error(
                    "Erro ao carregar Corujafinal.glb:",
                    error
                );
            }
        );

        /* =================================================
         * MOUSE
         * ================================================= */

        const handleMouseMove = (
            event: MouseEvent
        ) => {
            const mouseX =
                event.clientX /
                    window.innerWidth -
                0.5;

            const mouseY =
                event.clientY /
                    window.innerHeight -
                0.5;

            targetX =
                mouseX * 0.16;

            targetY =
                mouseY * 0.1;
        };

        window.addEventListener(
            "mousemove",
            handleMouseMove
        );

        /* =================================================
         * ANIMAÇÃO
         * ================================================= */

        let animationFrame = 0;

        const animate = (
            now: number
        ) => {
            animationFrame =
                requestAnimationFrame(
                    animate
                );

            /* -----------------------------------------
             * PARTÍCULAS
             * ----------------------------------------- */

            particles.rotation.y +=
                0.0007;

            particles.rotation.x +=
                0.0001;

            /* -----------------------------------------
             * ENTRADA DA CORUJA
             * ----------------------------------------- */

            if (
                brain &&
                !entradaFinalizada &&
                entradaInicio !== null
            ) {
                const duracao =
                    1700;

                const tempo =
                    now -
                    entradaInicio;

                const progresso =
                    Math.min(
                        tempo /
                            duracao,
                        1
                    );

                const ease =
                    1 -
                    Math.pow(
                        1 -
                            progresso,
                        4
                    );

                const escala =
                    1.45 *
                    ease;

                /*
                 * ESCALA UNIFORME
                 * X = Y = Z
                 */

                brain.scale.set(
                    escala,
                    escala,
                    escala
                );

                brain.position.y =
                    -0.8 +
                    0.8 *
                        ease;

                brain.rotation.y =
                    -0.35 +
                    0.35 *
                        ease;

                brain.rotation.z =
                    Math.sin(
                        progresso *
                            Math.PI
                    ) *
                    0.035;

                if (
                    progresso >=
                    1
                ) {
                    entradaFinalizada =
                        true;

                    entradaInicio =
                        null;

                    brain.position.y =
                        0;
                }
            }

            /* -----------------------------------------
             * FLUTUAÇÃO
             * ----------------------------------------- */

            if (
                brain &&
                entradaFinalizada
            ) {
                const flutuar =
                    Math.sin(
                        now *
                            0.0014
                    ) *
                    0.045;

                brain.position.y =
                    flutuar;

                brain.rotation.y +=
                    0.035 *
                    (
                        targetX -
                        brain.rotation.y
                    );

                brain.rotation.x +=
                    0.025 *
                    (
                        targetY -
                        brain.rotation.x
                    );

                brain.rotation.z =
                    Math.sin(
                        now *
                            0.0009
                    ) *
                    0.025;
            }

            /* -----------------------------------------
             * RENDER
             * ----------------------------------------- */

            renderer.render(
                scene,
                camera
            );
        };

        animationFrame =
            requestAnimationFrame(
                animate
            );

        /* =================================================
         * RESPONSIVIDADE
         * ================================================= */

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

            /*
             * Atualiza a proporção da câmera
             * de acordo com o container.
             */

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

        /* =================================================
         * LIMPEZA
         * ================================================= */

        return () => {
            cancelAnimationFrame(
                animationFrame
            );

            window.removeEventListener(
                "mousemove",
                handleMouseMove
            );

            window.removeEventListener(
                "resize",
                handleResize
            );

            if (
                renderer
                    .domElement
                    .parentNode ===
                container
            ) {
                container.removeChild(
                    renderer.domElement
                );
            }

            renderer.dispose();

            partGeo.dispose();

            partMat.dispose();

            scene.clear();
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="owl-canvas-container"
        />
    );
}

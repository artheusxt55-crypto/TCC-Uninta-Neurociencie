
import "./styles/neuro-edu.css";

import { useEffect, useRef, useState } from "react";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import TransformParticles from "./components/TransformParticles";

type VideoIndex = 0 | 1 | 2;

type ModuleName =
    | "diagnostico"
    | "bncc"
    | "planejamento"
    | "intervencao"
    | null;

type Resultados = {
    diagnostico?: string;
    bncc?: string;
    planejamento?: string;
    intervencao?: string;
};

const MODEL_URL =
    "https://kczzuvkuubeqdokjihrm.supabase.co/storage/v1/object/public/modelos%203d/Corujafinal.glb";

function App() {
    const brainViewportRef = useRef<HTMLDivElement | null>(null);
    const videosRef = useRef<(HTMLVideoElement | null)[]>([]);
    const transitioningRef = useRef(false);
    const transitionTimeoutRef = useRef<number | null>(null);

    const [currentVideo, setCurrentVideo] = useState<VideoIndex>(0);
    const [activeModule, setActiveModule] =
        useState<ModuleName>(null);

    const [idInput, setIdInput] = useState("");
    const [diagDescricao, setDiagDescricao] = useState("");
    const [buscaBNCC, setBuscaBNCC] = useState("");
    const [temaPlano, setTemaPlano] = useState("");
    const [objetivoPlano, setObjetivoPlano] = useState("");
    const [
        necessidadeIntervencao,
        setNecessidadeIntervencao,
    ] = useState("");
    const [
        contextoIntervencao,
        setContextoIntervencao,
    ] = useState("");

    const [resultado, setResultado] =
        useState<Resultados>({});

    /* =====================================================
     * MÓDULOS
     * ===================================================== */

    const openModule = (
        name: Exclude<ModuleName, null>
    ) => {
        setActiveModule(name);
    };

    const closeModule = () => {
        setActiveModule(null);
    };

    /* =====================================================
     * SISTEMA DE VÍDEOS
     * ===================================================== */

    useEffect(() => {
        const videos =
            videosRef.current.filter(
                (
                    video
                ): video is HTMLVideoElement =>
                    video !== null
            );

        if (!videos.length) return;

        videos.forEach((video, index) => {
            video.muted = true;
            video.playsInline = true;
            video.preload = "auto";
            video.loop = index === 2;
        });

        const firstVideo = videos[0];

        firstVideo.currentTime = 0;

        firstVideo.play().catch(() => {
            console.warn(
                "O navegador bloqueou o autoplay."
            );
        });

        const cleanups: Array<() => void> = [];

        videos.forEach((video, index) => {
            const handleEnded = () => {
                if (index === 2) return;
                if (index !== currentVideo) return;
                if (transitioningRef.current) return;

                const nextIndex =
                    (index + 1) as VideoIndex;

                const nextVideo =
                    videos[nextIndex];

                if (!nextVideo) return;

                transitioningRef.current = true;

                nextVideo.currentTime = 0;

                nextVideo
                    .play()
                    .then(() => {
                        nextVideo.classList.add(
                            "active"
                        );

                        transitionTimeoutRef.current =
                            window.setTimeout(() => {
                                video.classList.remove(
                                    "active"
                                );

                                video.pause();
                                video.currentTime = 0;

                                setCurrentVideo(
                                    nextIndex
                                );

                                transitioningRef.current =
                                    false;
                            }, 1400);
                    })
                    .catch(() => {
                        transitioningRef.current =
                            false;
                    });
            };

            video.addEventListener(
                "ended",
                handleEnded
            );

            cleanups.push(() =>
                video.removeEventListener(
                    "ended",
                    handleEnded
                )
            );
        });

        return () => {
            cleanups.forEach(
                (cleanup) => cleanup()
            );

            if (
                transitionTimeoutRef.current !==
                null
            ) {
                window.clearTimeout(
                    transitionTimeoutRef.current
                );
            }
        };
    }, [currentVideo]);

    /* =====================================================
     * TECLA ESC
     * ===================================================== */

    useEffect(() => {
        const handleKeyDown = (
            event: KeyboardEvent
        ) => {
            if (event.key === "Escape") {
                closeModule();
            }
        };

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () =>
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
    }, []);

    /* =====================================================
     * THREE.JS — A CORUJA DE ATENA
     * ===================================================== */

    useEffect(() => {
        const container =
            brainViewportRef.current;

        if (!container) return;

        const scene = new THREE.Scene();

        scene.fog = new THREE.FogExp2(
            0x090614,
            0.045
        );

        const width =
            container.clientWidth || 500;

        const height =
            container.clientHeight || 500;

        const camera =
            new THREE.PerspectiveCamera(
                35,
                width / height,
                0.1,
                1000
            );

        camera.position.z = 8;

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

        container.appendChild(
            renderer.domElement
        );

        /* =================================================
         * ILUMINAÇÃO
         * ================================================= */

        const ambientLight =
            new THREE.AmbientLight(
                0xffffff,
                0.8
            );

        scene.add(ambientLight);

        const mainLight =
            new THREE.PointLight(
                0xffffff,
                1.8
            );

        mainLight.position.set(
            5,
            5,
            10
        );

        scene.add(mainLight);

        const purpleLight =
            new THREE.PointLight(
                0xc4a265,
                0.9
            );

        purpleLight.position.set(
            -5,
            -2,
            5
        );

        scene.add(purpleLight);

        /* =================================================
         * PARTÍCULAS AMBIENTE DA CORUJA
         * ================================================= */

        const partGeo =
            new THREE.BufferGeometry();

        const partCount = 700;

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
                size: 0.022,
                color: 0xc4a265,
                transparent: true,
                opacity: 0.28,
            });

        const particles =
            new THREE.Points(
                partGeo,
                partMat
            );

        scene.add(particles);

        /* =================================================
         * MODELO GLB — CORUJA
         * ================================================= */

        let brain:
            | THREE.Object3D
            | null = null;

        let targetX = 0;
        let targetY = 0;

        let entradaInicio:
            | number
            | null = null;

        let entradaFinalizada = false;

        const loader =
            new GLTFLoader();

        loader.load(
            MODEL_URL,
            (gltf) => {
                brain = gltf.scene;

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

                scene.add(brain);

                entradaInicio =
                    performance.now();

                entradaFinalizada = false;
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
         * ANIMAÇÃO DA CORUJA
         * ================================================= */

        let animationFrame = 0;

        const animate = (
            now: number
        ) => {
            animationFrame =
                requestAnimationFrame(
                    animate
                );

            particles.rotation.y +=
                0.0007;

            particles.rotation.x +=
                0.0001;

            /* Entrada */

            if (
                brain &&
                !entradaFinalizada &&
                entradaInicio !== null
            ) {
                const duracao = 1700;

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
                        1 - progresso,
                        4
                    );

                const escala =
                    1.45 * ease;

                brain.scale.set(
                    escala,
                    escala,
                    escala
                );

                brain.position.y =
                    -0.8 +
                    0.8 * ease;

                brain.rotation.y =
                    -0.35 +
                    0.35 * ease;

                brain.rotation.z =
                    Math.sin(
                        progresso *
                            Math.PI
                    ) * 0.035;

                if (
                    progresso >= 1
                ) {
                    entradaFinalizada =
                        true;

                    entradaInicio =
                        null;

                    brain.position.y =
                        0;
                }
            }

            /* Flutuação */

            if (
                brain &&
                entradaFinalizada
            ) {
                const flutuar =
                    Math.sin(
                        now * 0.0014
                    ) * 0.045;

                brain.position.y =
                    flutuar;

                brain.rotation.y +=
                    0.035 *
                    (targetX -
                        brain.rotation.y);

                brain.rotation.x +=
                    0.025 *
                    (targetY -
                        brain.rotation.x);

                brain.rotation.z =
                    Math.sin(
                        now * 0.0009
                    ) * 0.025;
            }

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
         * CLEANUP
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
                renderer.domElement
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

    /* =====================================================
     * DIAGNÓSTICO
     * ===================================================== */

    const executarDiagnostico =
        () => {
            if (
                !diagDescricao.trim()
            ) {
                alert(
                    "Descreva a necessidade observada."
                );

                return;
            }

            setResultado(
                (prev) => ({
                    ...prev,
                    diagnostico:
                        "A interface está funcionando. A integração com a IA ainda precisa ser conectada ao backend.",
                })
            );
        };

    /* =====================================================
     * BNCC
     * ===================================================== */

    const consultarBNCC = () => {
        if (!buscaBNCC.trim()) {
            alert(
                "Digite algo para pesquisar."
            );

            return;
        }

        setResultado(
            (prev) => ({
                ...prev,
                bncc:
                    "A interface de consulta está funcionando. A base BNCC ainda precisa ser conectada.",
            })
        );
    };

    /* =====================================================
     * PLANEJAMENTO
     * ===================================================== */

    const gerarPlano = () => {
        if (
            !temaPlano.trim() ||
            !objetivoPlano.trim()
        ) {
            alert(
                "Informe o tema e o objetivo."
            );

            return;
        }

        setResultado(
            (prev) => ({
                ...prev,
                planejamento:
                    "O formulário está funcionando. A geração automática ainda precisa da integração com a IA.",
            })
        );
    };

    /* =====================================================
     * INTERVENÇÃO
     * ===================================================== */

    const gerarIntervencao =
        () => {
            if (
                !necessidadeIntervencao.trim()
            ) {
                alert(
                    "Informe a necessidade identificada."
                );

                return;
            }

            setResultado(
                (prev) => ({
                    ...prev,
                    intervencao:
                        "O módulo está funcionando. A geração da estratégia ainda precisa da integração com a IA.",
                })
            );
        };

    /* =====================================================
     * ACESSO
     * ===================================================== */

    const validarAcesso = () => {
        const valor =
            idInput
                .trim()
                .toUpperCase();

        if (
            valor === "MATH001" ||
            valor.startsWith("PAC")
        ) {
            window.location.href =
                "/aluno.html";

            return;
        }

        alert(
            "ID de acesso inválido."
        );
    };

    /* =====================================================
     * JSX
     * ===================================================== */

    return (
        <>
            {/* =================================================
                VÍDEOS
            ================================================= */}

            <div className="video-background">
                <video
                    ref={(element) => {
                        videosRef.current[0] =
                            element;
                    }}
                    id="video1"
                    className={`bg-video ${
                        currentVideo === 0
                            ? "active"
                            : ""
                    }`}
                    src="/athenaslivro.mp4"
                    muted
                    playsInline
                    preload="auto"
                />

                <video
                    ref={(element) => {
                        videosRef.current[1] =
                            element;
                    }}
                    id="video2"
                    className={`bg-video ${
                        currentVideo === 1
                            ? "active"
                            : ""
                    }`}
                    src="/maos%20mexendo.mp4"
                    muted
                    playsInline
                    preload="auto"
                />

                <video
                    ref={(element) => {
                        videosRef.current[2] =
                            element;
                    }}
                    id="video3"
                    className={`bg-video ${
                        currentVideo === 2
                            ? "active"
                            : ""
                    }`}
                    src="/cubo.mp4"
                    muted
                    playsInline
                    preload="auto"
                    loop
                />
            </div>

            {/* =================================================
                CAMADAS
            ================================================= */}

            <div className="video-overlay" />
            <div className="video-purple-glow" />
            <div className="architectural-grid" />
            <div className="side-line" />
            <div className="grain" />
            <div id="particles-layer" />

            {/* =================================================
                ÁREA DO ALUNO
            ================================================= */}

            <a
                href="/aluno.html"
                className="btn-aluno-fixo"
            >
                Área do Aluno
            </a>

            {/* =================================================
                CONTEÚDO PRINCIPAL
            ================================================= */}

            <main className="main-container">
                <div className="institution-marker">
                    Laboratório de Pesquisa e Práticas Pedagógicas
                </div>

                {/* =================================================
                    HERO
                ================================================= */}

                <section className="hero">
                    <div className="brand">
                        <div className="brand-icon" />

                        <span>
                            Neuro-Educa · UNINTA
                        </span>
                    </div>

                    <div className="system-status">
                        <span className="system-dot" />

                        Laboratório aberto
                    </div>

                    <h2>
                        Laboratório Pedagógico
                    </h2>

                    <p className="subtitle">
                        Um espaço de trabalho para diagnóstico,
                        planejamento, consulta curricular e
                        intervenção — construído a partir da
                        prática docente, não no lugar dela.
                    </p>

                    {/* ID */}

                    <label
                        className="field-label"
                        htmlFor="idInput"
                    >
                        Identificação
                    </label>

                    <input
                        type="text"
                        id="idInput"
                        value={idInput}
                        onChange={(event) =>
                            setIdInput(
                                event.target.value
                            )
                        }
                        placeholder="Digite seu ID de acesso"
                        autoComplete="off"
                    />

                    <button
                        className="btn-chalk"
                        onClick={
                            validarAcesso
                        }
                    >
                        Entrar no laboratório
                    </button>

                    <div className="hero-links">
                        <a
                            href="/biblioteca.html"
                            className="chalk-link"
                        >
                            Biblioteca digital
                        </a>

                        <a
                            href="/atlas.html"
                            className="chalk-link"
                        >
                            Explorar o mapa da aprendizagem
                        </a>
                    </div>
                </section>

                {/* =================================================
                    CORUJA DE ATENA
                ================================================= */}

                <section
                    id="brain-viewport"
                    ref={
                        brainViewportRef
                    }
                >
                    <div className="brain-frame">
                        <span className="brain-corner brain-corner--tl" />
                        <span className="brain-corner brain-corner--tr" />
                        <span className="brain-corner brain-corner--bl" />
                        <span className="brain-corner brain-corner--br" />

                        <svg
                            className="brain-ring"
                            viewBox="0 0 400 400"
                            aria-hidden="true"
                        >
                            <defs>
                                <path
                                    id="brainRingPath"
                                    d="M 200,200 m -170,0 a 170,170 0 1,1 340,0 a 170,170 0 1,1 -340,0"
                                />
                            </defs>

                            <text>
                                <textPath
                                    href="#brainRingPath"
                                    startOffset="0%"
                                >
                                    NEURO-EDUCA · LABORATÓRIO PEDAGÓGICO · UNINTA · SABEDORIA APLICADA ·
                                </textPath>
                            </text>
                        </svg>
                    </div>

                    <div className="brain-label">
                        Guardiã do laboratório

                        <strong>
                            A coruja de Atena
                        </strong>
                    </div>
                </section>

                {/* =================================================
                    NOVA ANIMAÇÃO
                    CUBO → PALAVRAS → DESFAZER
                ================================================= */}

                <section className="transform-section">
                    <div className="transform-header">
                        <span>
                            NEURO-EDU · VISUALIZAÇÃO
                        </span>

                        <strong>
                            Conhecimento em movimento
                        </strong>
                    </div>

                    <TransformParticles
                        words={[
                            "PEDAGOGIA",
                            "APRENDIZAGEM",
                            "NEUROEDUCAÇÃO",
                            "SABEDORIA",
                        ]}
                        color="#c4a265"
                        particleCount={900}
                    />
                </section>

                {/* =================================================
                    MÓDULOS
                ================================================= */}

                <nav
                    className="chalk-tray"
                    aria-label="Módulos do laboratório"
                >
                    <button
                        type="button"
                        className="tray-item"
                        title="Leitura do processo de aprendizagem."
                        onClick={() =>
                            openModule(
                                "diagnostico"
                            )
                        }
                    >
                        <span className="tray-index">
                            I
                        </span>

                        <span className="tray-name">
                            Diagnóstico
                        </span>
                    </button>

                    <button
                        type="button"
                        className="tray-item"
                        title="Consulta à base curricular."
                        onClick={() =>
                            openModule(
                                "bncc"
                            )
                        }
                    >
                        <span className="tray-index">
                            II
                        </span>

                        <span className="tray-name">
                            BNCC
                        </span>
                    </button>

                    <button
                        type="button"
                        className="tray-item"
                        title="Construção de planos de aula."
                        onClick={() =>
                            openModule(
                                "planejamento"
                            )
                        }
                    >
                        <span className="tray-index">
                            III
                        </span>

                        <span className="tray-name">
                            Planejamento
                        </span>
                    </button>

                    <button
                        type="button"
                        className="tray-item"
                        title="Estratégias pedagógicas dirigidas."
                        onClick={() =>
                            openModule(
                                "intervencao"
                            )
                        }
                    >
                        <span className="tray-index">
                            IV
                        </span>

                        <span className="tray-name">
                            Intervenção
                        </span>
                    </button>
                </nav>
            </main>

            {/* =================================================
                OVERLAY
            ================================================= */}

            <div
                className={`overlay ${
                    activeModule
                        ? "active"
                        : ""
                }`}
                onClick={
                    closeModule
                }
            />

            {/* =================================================
                DIAGNÓSTICO
            ================================================= */}

            <div
                className={`tool-panel ${
                    activeModule ===
                    "diagnostico"
                        ? "active"
                        : ""
                }`}
            >
                <div className="tool-header">
                    <div>
                        <span className="ai-badge">
                            Módulo I
                        </span>

                        <h3>
                            Diagnóstico da Aprendizagem
                        </h3>

                        <p>
                            Estrutura preparada para leitura
                            pedagógica assistida.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="close-tool"
                        onClick={
                            closeModule
                        }
                        aria-label="Fechar"
                    >
                        ×
                    </button>
                </div>

                <div className="tool-grid">
                    <div className="tool-card tool-card--field">
                        <label className="field-label">
                            Ano / série
                        </label>

                        <select>
                            {Array.from(
                                {
                                    length: 9,
                                },
                                (
                                    _,
                                    index
                                ) => (
                                    <option
                                        key={
                                            index
                                        }
                                    >
                                        {index +
                                            1}
                                        º Ano
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="tool-card tool-card--field">
                        <label className="field-label">
                            Componente
                        </label>

                        <select>
                            <option>
                                Língua Portuguesa
                            </option>

                            <option>
                                Matemática
                            </option>

                            <option>
                                Ciências
                            </option>

                            <option>
                                História
                            </option>

                            <option>
                                Geografia
                            </option>
                        </select>
                    </div>
                </div>

                <label className="field-label">
                    Habilidade / necessidade observada
                </label>

                <textarea
                    value={
                        diagDescricao
                    }
                    onChange={(
                        event
                    ) =>
                        setDiagDescricao(
                            event.target.value
                        )
                    }
                    placeholder="Descreva o que foi observado no processo de aprendizagem..."
                />

                <button
                    type="button"
                    className="btn-ink"
                    onClick={
                        executarDiagnostico
                    }
                >
                    Analisar
                </button>

                {resultado.diagnostico && (
                    <div className="result-box">
                        <strong>
                            Leitura pedagógica
                        </strong>

                        <p>
                            {
                                resultado.diagnostico
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* =================================================
                BNCC
            ================================================= */}

            <div
                className={`tool-panel ${
                    activeModule ===
                    "bncc"
                        ? "active"
                        : ""
                }`}
            >
                <div className="tool-header">
                    <div>
                        <span className="ai-badge">
                            Módulo II
                        </span>

                        <h3>
                            Consulta Curricular
                        </h3>

                        <p>
                            Pesquisa de habilidades e
                            organização curricular.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="close-tool"
                        onClick={
                            closeModule
                        }
                        aria-label="Fechar"
                    >
                        ×
                    </button>
                </div>

                <label className="field-label">
                    Habilidade ou palavra-chave
                </label>

                <input
                    type="text"
                    value={
                        buscaBNCC
                    }
                    onChange={(
                        event
                    ) =>
                        setBuscaBNCC(
                            event.target.value
                        )
                    }
                    placeholder="Ex.: interpretação de texto, frações..."
                />

                <div className="tool-grid">
                    <div className="tool-card">
                        <h4>
                            Habilidades
                        </h4>

                        <p>
                            Consulta estruturada de habilidades e
                            competências curriculares.
                        </p>
                    </div>

                    <div className="tool-card">
                        <h4>
                            Contexto pedagógico
                        </h4>

                        <p>
                            Use a habilidade selecionada como
                            referência para suas análises.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    className="btn-ink"
                    onClick={
                        consultarBNCC
                    }
                >
                    Consultar
                </button>

                {resultado.bncc && (
                    <div className="result-box">
                        <strong>
                            Resultado
                        </strong>

                        <p>
                            {
                                resultado.bncc
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* =================================================
                PLANEJAMENTO
            ================================================= */}

            <div
                className={`tool-panel ${
                    activeModule ===
                    "planejamento"
                        ? "active"
                        : ""
                }`}
            >
                <div className="tool-header">
                    <div>
                        <span className="ai-badge">
                            Módulo III
                        </span>

                        <h3>
                            Planejamento Pedagógico
                        </h3>

                        <p>
                            Estruture objetivos e estratégias
                            para sua prática.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="close-tool"
                        onClick={
                            closeModule
                        }
                        aria-label="Fechar"
                    >
                        ×
                    </button>
                </div>

                <label className="field-label">
                    Tema
                </label>

                <input
                    value={
                        temaPlano
                    }
                    onChange={(
                        event
                    ) =>
                        setTemaPlano(
                            event.target.value
                        )
                    }
                    placeholder="Ex.: interpretação textual"
                />

                <label className="field-label">
                    Ano / série
                </label>

                <select>
                    {Array.from(
                        {
                            length: 9,
                        },
                        (
                            _,
                            index
                        ) => (
                            <option
                                key={
                                    index
                                }
                            >
                                {index +
                                    1}
                                º Ano
                            </option>
                        )
                    )}
                </select>

                <label className="field-label">
                    Objetivo
                </label>

                <textarea
                    value={
                        objetivoPlano
                    }
                    onChange={(
                        event
                    ) =>
                        setObjetivoPlano(
                            event.target.value
                        )
                    }
                    placeholder="O que o aluno deverá desenvolver?"
                />

                <button
                    type="button"
                    className="btn-ink"
                    onClick={
                        gerarPlano
                    }
                >
                    Gerar planejamento
                </button>

                {resultado.planejamento && (
                    <div className="result-box">
                        <strong>
                            Planejamento
                        </strong>

                        <p>
                            {
                                resultado.planejamento
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* =================================================
                INTERVENÇÃO
            ================================================= */}

            <div
                className={`tool-panel ${
                    activeModule ===
                    "intervencao"
                        ? "active"
                        : ""
                }`}
            >
                <div className="tool-header">
                    <div>
                        <span className="ai-badge">
                            Módulo IV
                        </span>

                        <h3>
                            Intervenção Pedagógica
                        </h3>

                        <p>
                            Transforme evidências de aprendizagem
                            em estratégias.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="close-tool"
                        onClick={
                            closeModule
                        }
                        aria-label="Fechar"
                    >
                        ×
                    </button>
                </div>

                <label className="field-label">
                    Necessidade identificada
                </label>

                <textarea
                    value={
                        necessidadeIntervencao
                    }
                    onChange={(
                        event
                    ) =>
                        setNecessidadeIntervencao(
                            event.target.value
                        )
                    }
                    placeholder="Descreva a dificuldade ou necessidade observada..."
                />

                <label className="field-label">
                    Contexto
                </label>

                <textarea
                    value={
                        contextoIntervencao
                    }
                    onChange={(
                        event
                    ) =>
                        setContextoIntervencao(
                            event.target.value
                        )
                    }
                    placeholder="Informe o contexto da turma ou do estudante..."
                />

                <button
                    type="button"
                    className="btn-ink"
                    onClick={
                        gerarIntervencao
                    }
                >
                    Propor intervenção
                </button>

                {resultado.intervencao && (
                    <div className="result-box">
                        <strong>
                            Proposta pedagógica
                        </strong>

                        <p>
                            {
                                resultado.intervencao
                            }
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}

export default App;
```

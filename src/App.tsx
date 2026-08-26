import { useEffect, useRef, useState } from "react";

type VideoIndex = 0 | 1 | 2;

function App() {
    const brainViewportRef = useRef<HTMLDivElement | null>(null);

    const [currentVideo, setCurrentVideo] = useState<VideoIndex>(0);
    const [activeModule, setActiveModule] = useState<string | null>(null);
    const [idInput, setIdInput] = useState("");

    const [diagDescricao, setDiagDescricao] = useState("");
    const [buscaBNCC, setBuscaBNCC] = useState("");
    const [temaPlano, setTemaPlano] = useState("");
    const [objetivoPlano, setObjetivoPlano] = useState("");
    const [necessidadeIntervencao, setNecessidadeIntervencao] =
        useState("");
    const [contextoIntervencao, setContextoIntervencao] =
        useState("");

    const [resultado, setResultado] = useState<Record<string, string>>({});

    const videosRef = useRef<(HTMLVideoElement | null)[]>([]);
    const transitioningRef = useRef(false);

    const openModule = (name: string) => {
        setActiveModule(name);
    };

    const closeModule = () => {
        setActiveModule(null);
    };

    /*
     * =====================================================
     * SISTEMA DE VÍDEOS
     * =====================================================
     */

    useEffect(() => {
        const videos = videosRef.current.filter(
            Boolean
        ) as HTMLVideoElement[];

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
                "Autoplay bloqueado. O navegador exige interação do usuário."
            );
        });

        const handlers: (() => void)[] = [];

        videos.forEach((video, index) => {
            const handleEnded = () => {
                if (index === 2) {
                    video.currentTime = 0;
                    video.play().catch(() => {});
                    return;
                }

                if (
                    index === currentVideo &&
                    index < 2 &&
                    !transitioningRef.current
                ) {
                    const nextIndex = (index + 1) as VideoIndex;

                    const nextVideo = videos[nextIndex];

                    if (!nextVideo) return;

                    transitioningRef.current = true;

                    nextVideo.currentTime = 0;

                    nextVideo
                        .play()
                        .then(() => {
                            nextVideo.classList.add("active");

                            setTimeout(() => {
                                video.classList.remove("active");

                                video.pause();

                                try {
                                    video.currentTime = 0;
                                } catch {}

                                nextVideo.classList.remove(
                                    "transitioning"
                                );

                                setCurrentVideo(nextIndex);

                                transitioningRef.current = false;
                            }, 1400);
                        })
                        .catch(() => {
                            transitioningRef.current = false;
                        });
                }
            };

            video.addEventListener("ended", handleEnded);

            handlers.push(() => {
                video.removeEventListener(
                    "ended",
                    handleEnded
                );
            });
        });

        return () => {
            handlers.forEach((remove) => remove());
        };
    }, [currentVideo]);

    /*
     * =====================================================
     * ESC
     * =====================================================
     */

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                closeModule();
            }
        };

        document.addEventListener(
            "keydown",
            handleKeyDown
        );

        return () => {
            document.removeEventListener(
                "keydown",
                handleKeyDown
            );
        };
    }, []);

    /*
     * =====================================================
     * THREE.JS
     * =====================================================
     */

    useEffect(() => {
        const container = brainViewportRef.current;

        if (!container) return;

        const THREE = (window as any).THREE;

        if (!THREE) {
            console.warn(
                "Three.js ainda não está disponível."
            );

            return;
        }

        const GLTFLoader =
            THREE.GLTFLoader;

        if (!GLTFLoader) {
            console.warn(
                "GLTFLoader ainda não está disponível."
            );

            return;
        }

        const scene =
            new THREE.Scene();

        scene.fog =
            new THREE.FogExp2(
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

        container.appendChild(
            renderer.domElement
        );

        /*
         * ILUMINAÇÃO
         */

        scene.add(
            new THREE.AmbientLight(
                0xffffff,
                0.8
            )
        );

        const light =
            new THREE.PointLight(
                0xffffff,
                1.8
            );

        light.position.set(
            5,
            5,
            10
        );

        scene.add(light);

        const light2 =
            new THREE.PointLight(
                0x8b5cf6,
                0.8
            );

        light2.position.set(
            -5,
            -2,
            5
        );

        scene.add(light2);

        /*
         * PARTÍCULAS
         */

        const partGeo =
            new THREE.BufferGeometry();

        const partCount = 1300;

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
                (Math.random() - 0.5) * 15;
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
                size: 0.03,
                color: 0x9b6cff,
                transparent: true,
                opacity: 0.38,
            });

        const particles =
            new THREE.Points(
                partGeo,
                partMat
            );

        scene.add(particles);

        /*
         * CORUJA
         */

        let brain: any = null;

        let targetX = 0;
        let targetY = 0;

        let mouseX = 0;
        let mouseY = 0;

        let entradaInicio:
            number | null = null;

        let entradaFinalizada = false;

        const modelURL =
            "https://kczzuvkuubeqdokjihrm.supabase.co/storage/v1/object/public/modelos%203d/Corujafinal.glb";

        const loader =
            new GLTFLoader();

        loader.load(
            modelURL,

            (gltf: any) => {
                brain = gltf.scene;

                brain.traverse(
                    (object: any) => {
                        if (object.isMesh) {
                            object.castShadow = true;
                            object.receiveShadow = true;
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

            (error: any) => {
                console.error(
                    "Erro ao carregar Corujafinal.glb:",
                    error
                );
            }
        );

        const handleMouseMove =
            (event: MouseEvent) => {
                mouseX =
                    event.clientX /
                        window.innerWidth -
                    0.5;

                mouseY =
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

        let animationFrame =
            0;

        const animate =
            (now: number) => {
                animationFrame =
                    requestAnimationFrame(
                        animate
                    );

                particles.rotation.y +=
                    0.0007;

                particles.rotation.x +=
                    0.0001;

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
                            tempo / duracao,
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

                    if (progresso >= 1) {
                        entradaFinalizada =
                            true;

                        entradaInicio = null;

                        brain.position.y = 0;
                    }
                }

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
                renderer.domElement.parentNode ===
                container
            ) {
                container.removeChild(
                    renderer.domElement
                );
            }

            renderer.dispose();

            partGeo.dispose();

            partMat.dispose();
        };
    }, []);

    /*
     * =====================================================
     * FUNÇÕES DOS MÓDULOS
     * =====================================================
     */

    const executarDiagnostico = () => {
        if (!diagDescricao.trim()) {
            alert(
                "Descreva a necessidade observada."
            );
            return;
        }

        setResultado((prev) => ({
            ...prev,
            diagnostico:
                "A interface está preparada. A API ainda precisa ser conectada ao backend.",
        }));
    };

    const consultarBNCC = () => {
        if (!buscaBNCC.trim()) {
            alert(
                "Digite algo para pesquisar."
            );
            return;
        }

        setResultado((prev) => ({
            ...prev,
            bncc:
                "O campo de consulta está pronto para receber a base curricular.",
        }));
    };

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

        setResultado((prev) => ({
            ...prev,
            planejamento:
                "O formulário está estruturado para receber o planejamento gerado pelo backend.",
        }));
    };

    const gerarIntervencao = () => {
        if (
            !necessidadeIntervencao.trim()
        ) {
            alert(
                "Informe a necessidade identificada."
            );
            return;
        }

        setResultado((prev) => ({
            ...prev,
            intervencao:
                "O módulo está preparado para receber uma proposta de intervenção.",
        }));
    };

    /*
     * =====================================================
     * ACESSO
     * =====================================================
     */

    const validarAcesso = () => {
        const valor =
            idInput.trim().toUpperCase();

        if (
            valor === "MATH001" ||
            valor.startsWith("PAC")
        ) {
            window.location.href =
                "aluno.html";

            return;
        }

        alert(
            "ID de acesso inválido."
        );
    };

    return (
        <>
            {/* =====================================================
                VÍDEOS
            ====================================================== */}

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
                    src="/maos mexendo.mp4"
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

            {/* =====================================================
                CAMADAS
            ====================================================== */}

            <div className="video-overlay" />

            <div className="video-purple-glow" />

            <div className="architectural-grid" />

            <div className="side-line" />

            <div className="grain" />

            <div id="particles-layer" />

            {/* =====================================================
                ÁREA DO ALUNO
            ====================================================== */}

            <a
                href="aluno.html"
                className="btn-aluno-fixo"
            >
                ÁREA DO ALUNO
            </a>

            {/* =====================================================
                INTERFACE
            ====================================================== */}

            <main className="main-container">
                <div className="institution-marker">
                    <span />
                    LABORATÓRIO DE PESQUISA E PRÁTICAS PEDAGÓGICAS
                </div>

                <section className="card">
                    <div className="brand">
                        <div className="brand-icon" />

                        <span>
                            NEURO-EDUCA • UNINTA
                        </span>
                    </div>

                    <div className="system-status">
                        <span className="system-dot" />

                        SISTEMA OPERACIONAL
                    </div>

                    <div className="avatar-3d">
                        <spline-viewer
                            url="genkub_greeting_robot.spline"
                        />
                    </div>

                    <h2>
                        Laboratório Pedagógico
                    </h2>

                    <p className="subtitle">
                        Um ambiente para diagnóstico,
                        planejamento, consulta curricular
                        e intervenção pedagógica.
                    </p>

                    <input
                        type="text"
                        id="idInput"
                        value={idInput}
                        onChange={(event) =>
                            setIdInput(
                                event.target.value
                            )
                        }
                        placeholder="DIGITE SEU ID"
                        autoComplete="off"
                    />

                    <button
                        className="btn-neuro"
                        onClick={
                            validarAcesso
                        }
                    >
                        ACESSAR LABORATÓRIO
                    </button>

                    <a
                        href="biblioteca.html"
                        className="btn-library"
                    >
                        BIBLIOTECA DIGITAL
                    </a>

                    <a
                        href="atlas.html"
                        className="btn-atlas"
                    >
                        EXPLORAR MAPA DA APRENDIZAGEM 3D
                    </a>

                    {/* =================================================
                        BOTÕES DOS MÓDULOS
                    ================================================== */}

                    <div className="tool-grid">
                        <button
                            className="tool-card"
                            onClick={() =>
                                openModule(
                                    "diagnostico"
                                )
                            }
                        >
                            <h4>
                                DIAGNÓSTICO
                            </h4>

                            <p>
                                Análise da aprendizagem.
                            </p>
                        </button>

                        <button
                            className="tool-card"
                            onClick={() =>
                                openModule(
                                    "bncc"
                                )
                            }
                        >
                            <h4>
                                BNCC
                            </h4>

                            <p>
                                Consulta curricular.
                            </p>
                        </button>

                        <button
                            className="tool-card"
                            onClick={() =>
                                openModule(
                                    "planejamento"
                                )
                            }
                        >
                            <h4>
                                PLANEJAMENTO
                            </h4>

                            <p>
                                Criação de planos.
                            </p>
                        </button>

                        <button
                            className="tool-card"
                            onClick={() =>
                                openModule(
                                    "intervencao"
                                )
                            }
                        >
                            <h4>
                                INTERVENÇÃO
                            </h4>

                            <p>
                                Estratégias pedagógicas.
                            </p>
                        </button>
                    </div>
                </section>

                {/* =================================================
                    THREE.JS
                ================================================== */}

                <section
                    id="brain-viewport"
                    ref={
                        brainViewportRef
                    }
                >
                    <div className="brain-label">
                        SISTEMA

                        <strong>
                            NEURO-EDUCA
                        </strong>
                    </div>
                </section>
            </main>

            {/* =====================================================
                OVERLAY
            ====================================================== */}

            <div
                className={`overlay ${
                    activeModule
                        ? "active"
                        : ""
                }`}
                id="overlay"
                onClick={
                    closeModule
                }
            />

            {/* =====================================================
                DIAGNÓSTICO
            ====================================================== */}

            <div
                className={`tool-panel ${
                    activeModule ===
                    "diagnostico"
                        ? "active"
                        : ""
                }`}
                id="diagnostico"
            >
                <div className="tool-header">
                    <div>
                        <h3>
                            Diagnóstico da Aprendizagem
                        </h3>

                        <p>
                            Estrutura preparada para análise
                            pedagógica assistida.
                        </p>
                    </div>

                    <button
                        className="close-tool"
                        onClick={
                            closeModule
                        }
                    >
                        ×
                    </button>
                </div>

                <div className="ai-badge">
                    IA PEDAGÓGICA
                </div>

                <div className="tool-grid">
                    <div className="tool-card">
                        <label className="field-label">
                            ANO / SÉRIE
                        </label>

                        <select id="diagAno">
                            {Array.from(
                                {
                                    length: 9,
                                },
                                (_, index) => (
                                    <option
                                        key={index}
                                    >
                                        {index + 1}º Ano
                                    </option>
                                )
                            )}
                        </select>
                    </div>

                    <div className="tool-card">
                        <label className="field-label">
                            COMPONENTE
                        </label>

                        <select id="diagComponente">
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
                    HABILIDADE / NECESSIDADE OBSERVADA
                </label>

                <textarea
                    id="diagDescricao"
                    value={
                        diagDescricao
                    }
                    onChange={(event) =>
                        setDiagDescricao(
                            event.target.value
                        )
                    }
                    placeholder="Descreva o que foi observado no processo de aprendizagem..."
                />

                <button
                    className="btn-neuro"
                    onClick={
                        executarDiagnostico
                    }
                >
                    ANALISAR
                </button>

                {resultado.diagnostico && (
                    <div
                        className="result-box"
                        id="resultadoDiagnostico"
                    >
                        <strong>
                            ANÁLISE PEDAGÓGICA
                        </strong>

                        <p>
                            {
                                resultado.diagnostico
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* =====================================================
                BNCC
            ====================================================== */}

            <div
                className={`tool-panel ${
                    activeModule ===
                    "bncc"
                        ? "active"
                        : ""
                }`}
                id="bncc"
            >
                <div className="tool-header">
                    <div>
                        <h3>
                            Consulta Curricular
                        </h3>

                        <p>
                            Pesquisa de habilidades e organização
                            curricular.
                        </p>
                    </div>

                    <button
                        className="close-tool"
                        onClick={
                            closeModule
                        }
                    >
                        ×
                    </button>
                </div>

                <div className="ai-badge">
                    BASE CURRICULAR
                </div>

                <input
                    type="text"
                    id="buscaBNCC"
                    value={buscaBNCC}
                    onChange={(event) =>
                        setBuscaBNCC(
                            event.target.value
                        )
                    }
                    placeholder="Digite uma habilidade ou palavra-chave..."
                />

                <div className="tool-grid">
                    <div className="tool-card">
                        <h4>
                            HABILIDADES
                        </h4>

                        <p>
                            Consulta estruturada de habilidades
                            e competências curriculares.
                        </p>
                    </div>

                    <div className="tool-card">
                        <h4>
                            CONTEXTO PEDAGÓGICO
                        </h4>

                        <p>
                            Utilize a habilidade selecionada
                            como referência para suas análises.
                        </p>
                    </div>
                </div>

                <button
                    className="btn-neuro"
                    onClick={
                        consultarBNCC
                    }
                >
                    CONSULTAR
                </button>

                {resultado.bncc && (
                    <div className="result-box">
                        <strong>
                            RESULTADO
                        </strong>

                        <p>
                            {resultado.bncc}
                        </p>
                    </div>
                )}
            </div>

            {/* =====================================================
                PLANEJAMENTO
            ====================================================== */}

            <div
                className={`tool-panel ${
                    activeModule ===
                    "planejamento"
                        ? "active"
                        : ""
                }`}
                id="planejamento"
            >
                <div className="tool-header">
                    <div>
                        <h3>
                            Planejamento Pedagógico
                        </h3>

                        <p>
                            Estruture objetivos e estratégias
                            para sua prática pedagógica.
                        </p>
                    </div>

                    <button
                        className="close-tool"
                        onClick={
                            closeModule
                        }
                    >
                        ×
                    </button>
                </div>

                <div className="ai-badge">
                    PLANEJAMENTO ASSISTIDO
                </div>

                <label className="field-label">
                    TEMA
                </label>

                <input
                    id="temaPlano"
                    value={temaPlano}
                    onChange={(event) =>
                        setTemaPlano(
                            event.target.value
                        )
                    }
                    placeholder="Ex.: interpretação textual"
                />

                <label className="field-label">
                    ANO / SÉRIE
                </label>

                <select id="anoPlano">
                    {Array.from(
                        {
                            length: 9,
                        },
                        (_, index) => (
                            <option
                                key={index}
                            >
                                {index + 1}º Ano
                            </option>
                        )
                    )}
                </select>

                <label className="field-label">
                    OBJETIVO
                </label>

                <textarea
                    id="objetivoPlano"
                    value={
                        objetivoPlano
                    }
                    onChange={(event) =>
                        setObjetivoPlano(
                            event.target.value
                        )
                    }
                    placeholder="O que o aluno deverá desenvolver?"
                />

                <button
                    className="btn-neuro"
                    onClick={
                        gerarPlano
                    }
                >
                    GERAR PLANEJAMENTO
                </button>

                {resultado.planejamento && (
                    <div className="result-box">
                        <strong>
                            PLANEJAMENTO
                        </strong>

                        <p>
                            {
                                resultado.planejamento
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* =====================================================
                INTERVENÇÃO
            ====================================================== */}

            <div
                className={`tool-panel ${
                    activeModule ===
                    "intervencao"
                        ? "active"
                        : ""
                }`}
                id="intervencao"
            >
                <div className="tool-header">
                    <div>
                        <h3>
                            Intervenção Pedagógica
                        </h3>

                        <p>
                            Transforme evidências de aprendizagem
                            em estratégias pedagógicas.
                        </p>
                    </div>

                    <button
                        className="close-tool"
                        onClick={
                            closeModule
                        }
                    >
                        ×
                    </button>
                </div>

                <div className="ai-badge">
                    ESTRATÉGIA PEDAGÓGICA
                </div>

                <label className="field-label">
                    NECESSIDADE IDENTIFICADA
                </label>

                <textarea
                    id="necessidadeIntervencao"
                    value={
                        necessidadeIntervencao
                    }
                    onChange={(event) =>
                        setNecessidadeIntervencao(
                            event.target.value
                        )
                    }
                    placeholder="Descreva a dificuldade ou necessidade observada..."
                />

                <label className="field-label">
                    CONTEXTO
                </label>

                <textarea
                    id="contextoIntervencao"
                    value={
                        contextoIntervencao
                    }
                    onChange={(event) =>
                        setContextoIntervencao(
                            event.target.value
                        )
                    }
                    placeholder="Informe o contexto da turma ou do estudante..."
                />

                <button
                    className="btn-neuro"
                    onClick={
                        gerarIntervencao
                    }
                >
                    PROPOR INTERVENÇÃO
                </button>

                {resultado.intervencao && (
                    <div className="result-box">
                        <strong>
                            PROPOSTA PEDAGÓGICA
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

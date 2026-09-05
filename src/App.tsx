import { useEffect, useRef, useState } from "react";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import TransformParticles from "./components/TransformParticles";
import { auth, googleProvider } from "./lib/firebase";
import { signInWithPopup } from "firebase/auth";

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

/* =========================================================================
 * ÍCONES — traço fino, um por módulo. Nada de biblioteca nova: SVG inline.
 * ========================================================================= */

function IconCube({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
            <path d="M12 3 L20.5 7.5 V16.5 L12 21 L3.5 16.5 V7.5 Z" />
            <path d="M3.5 7.5 L12 12 L20.5 7.5" />
            <path d="M12 12 V21" />
        </svg>
    );
}

function IconDiagnostico() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="M15.5 15.5 L21 21" />
        </svg>
    );
}

function IconBncc() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M4 5.5 C6.5 4.2 9 4.2 12 5.5 C15 4.2 17.5 4.2 20 5.5 V18.5 C17.5 17.2 15 17.2 12 18.5 C9 17.2 6.5 17.2 4 18.5 Z" />
            <path d="M12 5.5 V18.5" />
        </svg>
    );
}

function IconPlanejamento() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="4" y="4" width="16" height="16" rx="1" />
            <path d="M8 9 H16 M8 13 H16 M8 17 H12.5" />
        </svg>
    );
}

function IconIntervencao() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="3.2" />
            <path d="M12 2.5 V5 M12 19 V21.5" />
        </svg>
    );
}

function IconMenu() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M4 7 H20 M4 12 H20 M4 17 H20" />
        </svg>
    );
}

function IconClose() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
            <path d="M5 5 L19 19 M19 5 L5 19" />
        </svg>
    );
}

function IconCookie() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="8.5" />
            <circle cx="9" cy="10" r="1" fill="currentColor" stroke="none" />
            <circle cx="14" cy="9" r="1" fill="currentColor" stroke="none" />
            <circle cx="13" cy="14.5" r="1" fill="currentColor" stroke="none" />
        </svg>
    );
}

function App() {
    const brainViewportRef =
        useRef<HTMLDivElement | null>(null);

    const videosRef =
        useRef<(HTMLVideoElement | null)[]>([]);

    const transitioningRef =
        useRef(false);

    const transitionTimeoutRef =
        useRef<number | null>(null);

    const [currentVideo, setCurrentVideo] =
        useState<VideoIndex>(0);

    const [activeModule, setActiveModule] =
        useState<ModuleName>(null);

    const [menuAberto, setMenuAberto] =
        useState(false);

    const [idInput, setIdInput] =
        useState("");

    const [diagDescricao, setDiagDescricao] =
        useState("");

    const [buscaBNCC, setBuscaBNCC] =
        useState("");

    const [temaPlano, setTemaPlano] =
        useState("");

    const [objetivoPlano, setObjetivoPlano] =
        useState("");

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
     * COOKIES / PRIVACIDADE
     * ===================================================== */

    const [showCookieBanner, setShowCookieBanner] =
        useState(false);

    useEffect(() => {
        const consentimento =
            localStorage.getItem(
                "educacube_cookie_consent"
            );

        if (!consentimento) {
            setShowCookieBanner(true);
        }
    }, []);

    const salvarConsentimento = (
        escolha: "aceito" | "recusado"
    ) => {
        /*
         * Memória persistente no navegador.
         * A escolha continua salva mesmo depois
         * de fechar e abrir o navegador.
         */
        localStorage.setItem(
            "educacube_cookie_consent",
            escolha
        );

        /*
         * Cookie persistente por 1 ano.
         */
        document.cookie =
            `educacube_cookie_consent=${escolha}; ` +
            `Max-Age=31536000; ` +
            `Path=/; ` +
            `SameSite=Lax`;

        setShowCookieBanner(false);
    };

    const abrirConfiguracoesCookies = () => {
        window.location.href =
            "/cookies.html";
    };

    /* =====================================================
     * LOGIN GOOGLE — FIREBASE
     * ===================================================== */

    const loginComGoogle = async () => {
        try {
            const result = await signInWithPopup(
                auth,
                googleProvider
            );

            const user = result.user;

            console.log(
                "Login Firebase realizado:",
                {
                    uid: user.uid,
                    nome: user.displayName,
                    email: user.email,
                }
            );

            alert(
                `Bem-vindo, ${
                    user.displayName || "usuário"
                }!`
            );

        } catch (error) {
            console.error(
                "Erro no login com Google:",
                error
            );

            alert(
                "Não foi possível entrar com Google."
            );
        }
    };

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

                if (
                    index !== currentVideo
                ) {
                    return;
                }

                if (
                    transitioningRef.current
                ) {
                    return;
                }

                const nextIndex =
                    (index + 1) as VideoIndex;

                const nextVideo =
                    videos[nextIndex];

                if (!nextVideo) return;

                transitioningRef.current =
                    true;

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
                setMenuAberto(false);
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
     * THREE.JS — CORUJA DO CUBO (EducaCube)
     * ===================================================== */

    useEffect(() => {
        const container =
            brainViewportRef.current;

        if (!container) return;

        const scene = new THREE.Scene();

        scene.fog = new THREE.FogExp2(
            0x0c0b10,
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
         * ILUMINAÇÃO — roxo de marca, discreto
         * ================================================= */

        const ambientLight =
            new THREE.AmbientLight(
                0xffffff,
                0.75
            );

        scene.add(ambientLight);

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

        scene.add(mainLight);

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

        scene.add(violetLight);

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

        scene.add(brassLight);

        /* =================================================
         * PARTÍCULAS AMBIENTE — poeira discreta
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

    const executarDiagnostico = () => {
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
        if (
            !buscaBNCC.trim()
        ) {
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

    const gerarIntervencao = () => {
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
     * DADOS DOS MÓDULOS — usados para renderizar o fluxo
     * ===================================================== */

    const modulos: Array<{
        id: Exclude<ModuleName, null>;
        numero: string;
        nome: string;
        descricao: string;
        Icone: () => JSX.Element;
    }> = [
        {
            id: "diagnostico",
            numero: "01",
            nome: "Diagnóstico",
            descricao: "Leitura do processo de aprendizagem.",
            Icone: IconDiagnostico,
        },
        {
            id: "bncc",
            numero: "02",
            nome: "BNCC",
            descricao: "Consulta à base curricular.",
            Icone: IconBncc,
        },
        {
            id: "planejamento",
            numero: "03",
            nome: "Planejamento",
            descricao: "Construção de planos de aula.",
            Icone: IconPlanejamento,
        },
        {
            id: "intervencao",
            numero: "04",
            nome: "Intervenção",
            descricao: "Estratégias pedagógicas dirigidas.",
            Icone: IconIntervencao,
        },
    ];

    /* =====================================================
     * JSX
     * ===================================================== */

    return (
        <>
            {/* =================================================
                CABEÇALHO / NAVEGAÇÃO
            ================================================= */}

            <header className="site-header">

                <div className="brand-mark">
                    <IconCube className="brand-glyph" />
                    <span className="brand-name">EducaCube</span>
                    <span className="brand-affiliation">UNINTA — Laboratório de Pesquisa</span>
                </div>

                <nav className="site-nav" aria-label="Navegação principal">
                    <a href="#inicio">Início</a>
                    <a href="#ferramentas">Ferramentas</a>
                    <a href="/biblioteca.html">Biblioteca</a>
                    <a href="/atlas.html">Mapa da aprendizagem</a>
                </nav>

                <div className="site-actions">
                    <button
                        type="button"
                        className="btn-ghost"
                        onClick={loginComGoogle}
                    >
                        Entrar com Google
                    </button>

                    <a href="/aluno.html" className="btn-primary">
                        Área do aluno
                    </a>
                </div>

                <button
                    type="button"
                    className="nav-toggle"
                    aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
                    aria-expanded={menuAberto}
                    onClick={() => setMenuAberto((valor) => !valor)}
                >
                    {menuAberto ? <IconClose /> : <IconMenu />}
                </button>

            </header>

            {menuAberto && (
                <div className="mobile-menu">
                    <a href="#inicio" onClick={() => setMenuAberto(false)}>Início</a>
                    <a href="#ferramentas" onClick={() => setMenuAberto(false)}>Ferramentas</a>
                    <a href="/biblioteca.html">Biblioteca</a>
                    <a href="/atlas.html">Mapa da aprendizagem</a>
                    <button type="button" onClick={loginComGoogle}>Entrar com Google</button>
                    <a href="/aluno.html">Área do aluno</a>
                </div>
            )}

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
                CONTEÚDO PRINCIPAL
            ================================================= */}

            <main className="main-container">

                {/* =================================================
                    HERO
                ================================================= */}

                <section className="hero" id="inicio">

                    <div className="hero-grid">

                        <div className="hero-content">

                            <p className="hero-kicker">
                                Um espaço de trabalho para quem diagnostica, planeja
                                e intervém na aprendizagem — não um assistente genérico.
                            </p>

                            <h1>
                                O laboratório <em>pedagógico</em> do EducaCube
                            </h1>

                            <p className="hero-lede">
                                Quatro instrumentos construídos a partir da prática
                                docente: leitura do processo de aprendizagem, consulta
                                curricular, planejamento de aula e desenho de
                                intervenções — no lugar da prática, não em vez dela.
                            </p>

                            <div className="access-card">

                                <p className="access-card__title">
                                    ACESSO AO LABORATÓRIO
                                </p>

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
                                    className="btn-primary"
                                    onClick={
                                        validarAcesso
                                    }
                                >
                                    Entrar no laboratório
                                </button>

                                <div className="access-divider">ou</div>

                                <button
                                    type="button"
                                    className="btn-ghost"
                                    onClick={
                                        loginComGoogle
                                    }
                                >
                                    Continuar com Google
                                </button>

                            </div>

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

                        </div>

                        {/* =================================================
                            CORUJA
                        ================================================= */}

                        <section
                            id="brain-viewport"
                            ref={
                                brainViewportRef
                            }
                            aria-label="Modelo tridimensional da coruja do EducaCube"
                        >

                            <div className="brain-frame">

                                <span className="brain-corner brain-corner--tl" />

                                <span className="brain-corner brain-corner--tr" />

                                <span className="brain-corner brain-corner--bl" />

                                <span className="brain-corner brain-corner--br" />

                            </div>

                            <div className="brain-label">

                                <span>Guardiã do laboratório</span>

                                <strong>
                                    A coruja do EducaCube
                                </strong>

                            </div>

                        </section>

                    </div>

                </section>

                {/* =================================================
                    TRANSFORM PARTICLES
                ================================================= */}

                <section className="transform-section">

                    <div className="transform-header">

                        <strong>
                            Conhecimento em movimento
                        </strong>

                        <span>
                            EducaCube
                        </span>

                    </div>

                    <div className="transform-particles-wrapper">

                        <TransformParticles
                            words={[
                                "PEDAGOGIA",
                                "APRENDIZAGEM",
                                "NEUROEDUCAÇÃO",
                                "SABEDORIA",
                            ]}
                            color="#7c5cab"
                            particleCount={900}
                        />

                    </div>

                </section>

                {/* =================================================
                    MÓDULOS — FLUXO DE TRABALHO
                ================================================= */}

                <section className="workspace-section" id="ferramentas">

                    <div className="workspace-header">
                        <h2>Um fluxo, quatro instrumentos</h2>
                        <p>
                            Da leitura do processo de aprendizagem até a intervenção —
                            cada módulo assume o trabalho na etapa em que o anterior termina.
                        </p>
                    </div>

                    <nav
                        className="chalk-tray"
                        aria-label="Módulos do laboratório"
                    >

                        {modulos.map(({ id, numero, nome, descricao, Icone }) => (
                            <button
                                key={id}
                                type="button"
                                className="tray-item"
                                onClick={() => openModule(id)}
                            >
                                <div className="tray-top">
                                    <span className="tray-index">{numero}</span>
                                    <span className="tray-icon">
                                        <Icone />
                                    </span>
                                </div>

                                <span className="tray-name">{nome}</span>
                                <span className="tray-desc">{descricao}</span>
                                <span className="tray-cta">Abrir módulo</span>
                            </button>
                        ))}

                    </nav>

                </section>

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

                        <p className="module-eyebrow">
                            Módulo 01
                        </p>

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

                        <p className="module-eyebrow">
                            Módulo 02
                        </p>

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

                        <p className="module-eyebrow">
                            Módulo 03
                        </p>

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

                        <p className="module-eyebrow">
                            Módulo 04
                        </p>

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

            {/* =================================================
                BANNER DE COOKIES
            ================================================= */}

            {showCookieBanner && (
                <div
                    className="cookie-banner"
                    role="dialog"
                    aria-label="Aviso de cookies"
                >

                    <div className="cookie-content">

                        <div className="cookie-icon">
                            <IconCookie />
                        </div>

                        <div className="cookie-text">

                            <h3>
                                Cookies e privacidade
                            </h3>

                            <p>
                                O EducaCube utiliza cookies
                                e tecnologias semelhantes
                                para manter funcionalidades
                                da plataforma, autenticação
                                e preferências.
                            </p>

                            <a
                                href="/cookies.html"
                                className="cookie-link"
                            >
                                Política de Cookies
                            </a>

                        </div>

                        <div className="cookie-actions">

                            <button
                                type="button"
                                className="cookie-btn"
                                onClick={() =>
                                    salvarConsentimento(
                                        "recusado"
                                    )
                                }
                            >
                                Recusar
                            </button>

                            <button
                                type="button"
                                className="cookie-btn"
                                onClick={
                                    abrirConfiguracoesCookies
                                }
                            >
                                Configurar
                            </button>

                            <button
                                type="button"
                                className="cookie-btn cookie-btn-accept"
                                onClick={() =>
                                    salvarConsentimento(
                                        "aceito"
                                    )
                                }
                            >
                                Aceitar
                            </button>

                        </div>

                    </div>

                </div>
            )}

        </>
    );
}

export default App;

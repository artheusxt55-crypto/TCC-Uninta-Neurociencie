import {
    lazy,
    Suspense,
    useEffect,
    useRef,
    useState,
} from "react";

import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";

import { usePerformanceMode } from "./hooks/usePerformanceMode";

import {
    aceitarAnalytics,
    recusarAnalytics,
} from "./lib/analytics";

/* =========================================================
 * PÁGINAS
 * ========================================================= */

import AuraAI from "./pages/AuraAI";
import LoginPage from "./pages/LoginPage";

/* =========================================================
 * COMPONENTES PESADOS
 * ========================================================= */

const OwlShowcase = lazy(
    () => import("./components/OwlShowcase")
);

const TransformDesktop = lazy(
    () => import("./components/TransformDesktop")
);

/* =========================================================
 * TIPOS
 * ========================================================= */

type VideoIndex = 0 | 1 | 2;

type ModuleName =
    | "diagnostico"
    | "bncc"
    | "planejamento"
    | "intervencao"
    | null;

/* =========================================================
 * PALAVRAS ROTATIVAS DO HERO
 * ========================================================= */

const HERO_ROTATING_WORDS = [
    "pedagógico",
    "investigativo",
    "colaborativo",
    "vivo",
] as const;

type Resultados = {
    diagnostico?: string;
    bncc?: string;
    planejamento?: string;
    intervencao?: string;
};

/* =========================================================
 * ÍCONES
 * ========================================================= */

function IconCube({
    className,
}: {
    className?: string;
}) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
            aria-hidden="true"
        >
            <path d="M12 3 L20.5 7.5 V16.5 L12 21 L3.5 16.5 V7.5 Z" />
            <path d="M3.5 7.5 L12 12 L20.5 7.5" />
            <path d="M12 12 V21" />
        </svg>
    );
}

function IconDiagnostico() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
        >
            <circle
                cx="10.5"
                cy="10.5"
                r="6.5"
            />

            <path d="M15.5 15.5 L21 21" />
        </svg>
    );
}

function IconBncc() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
        >
            <path d="M4 5.5 C6.5 4.2 9 4.2 12 5.5 C15 4.2 17.5 4.2 20 5.5 V18.5 C17.5 17.2 15 17.2 12 18.5 C9 17.2 6.5 17.2 4 18.5 Z" />
            <path d="M12 5.5 V18.5" />
        </svg>
    );
}

function IconPlanejamento() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
        >
            <rect
                x="4"
                y="4"
                width="16"
                height="16"
                rx="1"
            />

            <path d="M8 9 H16 M8 13 H16 M8 17 H12.5" />
        </svg>
    );
}

function IconIntervencao() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="12"
                r="8"
            />

            <circle
                cx="12"
                cy="12"
                r="3.2"
            />

            <path d="M12 2.5 V5 M12 19 V21.5" />
        </svg>
    );
}

function IconMenu() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
        >
            <path d="M4 7 H20 M4 12 H20 M4 17 H20" />
        </svg>
    );
}

function IconClose() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
        >
            <path d="M5 5 L19 19 M19 5 L5 19" />
        </svg>
    );
}

function IconCookie() {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
        >
            <circle
                cx="12"
                cy="12"
                r="8.5"
            />

            <circle
                cx="9"
                cy="10"
                r="1"
                fill="currentColor"
                stroke="none"
            />

            <circle
                cx="14"
                cy="9"
                r="1"
                fill="currentColor"
                stroke="none"
            />

            <circle
                cx="13"
                cy="14.5"
                r="1"
                fill="currentColor"
                stroke="none"
            />
        </svg>
    );
}

/* =========================================================
 * LAB PAGE — HOME
 * ========================================================= */

function LabPage() {
    /* =====================================================
     * PERFORMANCE
     * ===================================================== */

    const performanceMode =
        usePerformanceMode();

    const isFull =
        performanceMode === "full";

    /* =====================================================
     * REFERÊNCIAS DOS VÍDEOS
     * ===================================================== */

    const videosRef =
        useRef<(HTMLVideoElement | null)[]>([]);

    const transitioningRef =
        useRef(false);

    const transitionTimeoutRef =
        useRef<number | null>(null);

    /* =====================================================
     * ESTADOS
     * ===================================================== */

    const [currentVideo, setCurrentVideo] =
        useState<VideoIndex>(0);

    const [activeModule, setActiveModule] =
        useState<ModuleName>(null);

    const [menuAberto, setMenuAberto] =
        useState(false);

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

    const [showCookieBanner, setShowCookieBanner] =
        useState(false);

    const [heroWordIndex, setHeroWordIndex] =
        useState(0);

    /* =====================================================
     * COOKIES / PRIVACIDADE / ANALYTICS
     * ===================================================== */

    useEffect(() => {
        const consentimento =
            localStorage.getItem(
                "educacube_cookie_consent"
            );

        if (!consentimento) {
            setShowCookieBanner(true);
            recusarAnalytics();
            return;
        }

        if (
            consentimento ===
            "aceito"
        ) {
            aceitarAnalytics();
        } else {
            recusarAnalytics();
        }
    }, []);

    const salvarConsentimento = (
        escolha:
            | "aceito"
            | "recusado"
    ) => {
        localStorage.setItem(
            "educacube_cookie_consent",
            escolha
        );

        document.cookie =
            `educacube_cookie_consent=${escolha}; ` +
            `Max-Age=31536000; ` +
            `Path=/; ` +
            `SameSite=Lax`;

        if (
            escolha ===
            "aceito"
        ) {
            aceitarAnalytics();
        } else {
            recusarAnalytics();
        }

        setShowCookieBanner(false);
    };

    const abrirConfiguracoesCookies =
        () => {
            window.location.href =
                "/cookies.html";
        };

    /* =====================================================
     * MÓDULOS
     * ===================================================== */

    const openModule = (
        name: Exclude<
            ModuleName,
            null
        >
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
        if (!isFull) {
            return;
        }

        const videos =
            videosRef.current.filter(
                (
                    video
                ): video is HTMLVideoElement =>
                    video !== null
            );

        if (!videos.length) {
            return;
        }

        videos.forEach(
            (
                video,
                index
            ) => {
                video.muted = true;
                video.playsInline = true;
                video.preload = "auto";
                video.loop =
                    index === 2;
            }
        );

        const firstVideo =
            videos[0];

        firstVideo.currentTime =
            0;

        firstVideo
            .play()
            .catch(() => {
                console.warn(
                    "O navegador bloqueou o autoplay."
                );
            });

        const cleanups:
            Array<() => void> = [];

        videos.forEach(
            (
                video,
                index
            ) => {
                const handleEnded =
                    () => {
                        if (
                            index === 2
                        ) {
                            return;
                        }

                        if (
                            index !==
                            currentVideo
                        ) {
                            return;
                        }

                        if (
                            transitioningRef.current
                        ) {
                            return;
                        }

                        const nextIndex =
                            (
                                index +
                                1
                            ) as VideoIndex;

                        const nextVideo =
                            videos[
                                nextIndex
                            ];

                        if (!nextVideo) {
                            return;
                        }

                        transitioningRef.current =
                            true;

                        nextVideo.currentTime =
                            0;

                        nextVideo
                            .play()
                            .then(() => {
                                nextVideo.classList.add(
                                    "active"
                                );

                                transitionTimeoutRef.current =
                                    window.setTimeout(
                                        () => {
                                            video.classList.remove(
                                                "active"
                                            );

                                            video.pause();

                                            video.currentTime =
                                                0;

                                            setCurrentVideo(
                                                nextIndex
                                            );

                                            transitioningRef.current =
                                                false;
                                        },
                                        1400
                                    );
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

                cleanups.push(
                    () =>
                        video.removeEventListener(
                            "ended",
                            handleEnded
                        )
                );
            }
        );

        return () => {
            cleanups.forEach(
                (
                    cleanup
                ) =>
                    cleanup()
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
    }, [
        currentVideo,
        isFull,
    ]);

    /* =====================================================
     * PALAVRA ROTATIVA DO HERO
     * ===================================================== */

    useEffect(() => {
        const prefersReducedMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            ).matches;

        if (prefersReducedMotion) {
            return;
        }

        const intervalId =
            window.setInterval(() => {
                setHeroWordIndex(
                    (prev) =>
                        (prev + 1) %
                        HERO_ROTATING_WORDS.length
                );
            }, 2600);

        return () =>
            window.clearInterval(
                intervalId
            );
    }, []);

    /* =====================================================
     * TECLA ESC
     * ===================================================== */

    useEffect(() => {
        const handleKeyDown =
            (
                event: KeyboardEvent
            ) => {
                if (
                    event.key ===
                    "Escape"
                ) {
                    closeModule();

                    setMenuAberto(
                        false
                    );
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
                (
                    prev
                ) => ({
                    ...prev,

                    diagnostico:
                        "A interface está funcionando. A integração com a IA ainda precisa ser conectada ao backend.",
                })
            );
        };

    /* =====================================================
     * BNCC
     * ===================================================== */

    const consultarBNCC =
        () => {
            if (
                !buscaBNCC.trim()
            ) {
                alert(
                    "Digite algo para pesquisar."
                );

                return;
            }

            setResultado(
                (
                    prev
                ) => ({
                    ...prev,

                    bncc:
                        "A interface de consulta está funcionando. A base BNCC ainda precisa ser conectada.",
                })
            );
        };

    /* =====================================================
     * PLANEJAMENTO
     * ===================================================== */

    const gerarPlano =
        () => {
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
                (
                    prev
                ) => ({
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
                (
                    prev
                ) => ({
                    ...prev,

                    intervencao:
                        "O módulo está funcionando. A geração da estratégia ainda precisa da integração com a IA.",
                })
            );
        };

    /* =====================================================
     * DADOS DOS MÓDULOS
     * ===================================================== */

    const modulos: Array<{
        id:
            Exclude<
                ModuleName,
                null
            >;

        numero: string;

        nome: string;

        descricao: string;

        Icone: () =>
            JSX.Element;
    }> = [
        {
            id:
                "diagnostico",

            numero:
                "01",

            nome:
                "Diagnóstico",

            descricao:
                "Leitura do processo de aprendizagem.",

            Icone:
                IconDiagnostico,
        },

        {
            id:
                "bncc",

            numero:
                "02",

            nome:
                "BNCC",

            descricao:
                "Consulta à base curricular.",

            Icone:
                IconBncc,
        },

        {
            id:
                "planejamento",

            numero:
                "03",

            nome:
                "Planejamento",

            descricao:
                "Construção de planos de aula.",

            Icone:
                IconPlanejamento,
        },

        {
            id:
                "intervencao",

            numero:
                "04",

            nome:
                "Intervenção",

            descricao:
                "Estratégias pedagógicas dirigidas.",

            Icone:
                IconIntervencao,
        },
    ];

    /* =====================================================
     * JSX
     * ===================================================== */

    return (
        <>
            {/* =================================================
                CABEÇALHO
            ================================================= */}

            <header className="site-header">

                <div className="brand-mark">

                    <IconCube
                        className="brand-glyph"
                    />

                    <span className="brand-name">
                        EducaCube
                    </span>

                    <span className="brand-affiliation">
                        UNINTA — Laboratório de Pesquisa
                    </span>

                </div>

                <nav
                    className="site-nav"
                    aria-label="Navegação principal"
                >

                    <a href="#inicio">
                        Início
                    </a>

                    <a href="#ferramentas">
                        Ferramentas
                    </a>

                    <a href="/biblioteca.html">
                        Biblioteca
                    </a>

                    <a href="/atlas.html">
                        Mapa da aprendizagem
                    </a>

                </nav>

                <div className="site-actions">

                    <a
                        href="/login"
                        className="btn-ghost"
                    >
                        Área do Aluno
                    </a>

                    <a
                        href="/aura"
                        className="btn-primary"
                    >
                        AURA AI
                    </a>

                </div>

                <button
                    type="button"
                    className="nav-toggle"
                    aria-label={
                        menuAberto
                            ? "Fechar menu"
                            : "Abrir menu"
                    }
                    aria-expanded={
                        menuAberto
                    }
                    onClick={() =>
                        setMenuAberto(
                            (
                                valor
                            ) =>
                                !valor
                        )
                    }
                >

                    {menuAberto
                        ? (
                            <IconClose />
                        )
                        : (
                            <IconMenu />
                        )}

                </button>

            </header>

            {/* =================================================
                MENU MOBILE
            ================================================= */}

            {menuAberto && (
                <div className="mobile-menu">

                    <a
                        href="#inicio"
                        onClick={() =>
                            setMenuAberto(
                                false
                            )
                        }
                    >
                        Início
                    </a>

                    <a
                        href="#ferramentas"
                        onClick={() =>
                            setMenuAberto(
                                false
                            )
                        }
                    >
                        Ferramentas
                    </a>

                    <a href="/biblioteca.html">
                        Biblioteca
                    </a>

                    <a href="/atlas.html">
                        Mapa da aprendizagem
                    </a>

                    <a href="/login">
                        Área do Aluno
                    </a>

                    <a href="/aura">
                        AURA AI
                    </a>

                </div>
            )}

            {/* =================================================
                VÍDEOS
            ================================================= */}

            {isFull && (
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
                        preload="metadata"
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
                        preload="metadata"
                        loop
                    />

                </div>
            )}

            {/* =================================================
                CAMADAS
            ================================================= */}

            <div className="video-overlay" />

            {isFull && (
                <>
                    <div className="video-purple-glow" />
                    <div className="architectural-grid" />
                    <div className="side-line" />
                    <div className="grain" />
                </>
            )}

            {/* =================================================
                CONTEÚDO PRINCIPAL
            ================================================= */}

            <main className="main-container">

                <section
                    className="hero"
                    id="inicio"
                >

                    <div className="hero-grid">

                        <div className="hero-content">

                            <p className="hero-kicker">
                                Um espaço de trabalho para quem
                                diagnostica, planeja e intervém
                                na aprendizagem — não um
                                assistente genérico.
                            </p>

                            <h1>
                                <span className="sr-only">
                                    O laboratório pedagógico
                                    do EducaCube
                                </span>
                                <span aria-hidden="true">
                                    O laboratório{" "}
                                </span>
                                <span
                                    className="hero-rotator"
                                    aria-hidden="true"
                                >
                                    {HERO_ROTATING_WORDS.map(
                                        (
                                            word,
                                            index
                                        ) => (
                                            <span
                                                key={
                                                    word
                                                }
                                                className="hero-rotator__word"
                                                data-state={
                                                    index ===
                                                    heroWordIndex
                                                        ? "active"
                                                        : index <
                                                            heroWordIndex
                                                          ? "prev"
                                                          : "next"
                                                }
                                            >
                                                {
                                                    word
                                                }
                                            </span>
                                        )
                                    )}
                                </span>
                                <span aria-hidden="true">
                                    {" "}do EducaCube
                                </span>
                            </h1>

                            <p className="hero-lede">
                                Quatro instrumentos construídos
                                a partir da prática docente:
                                leitura do processo de aprendizagem,
                                consulta curricular, planejamento
                                de aula e desenho de intervenções —
                                no lugar da prática, não em vez dela.
                            </p>

                            {/* =================================================
                                ACESSO AO LABORATÓRIO
                                LOGIN REMOVIDO DA HOME
                            ================================================= */}

                            <div className="access-card">

                                <p className="access-card__title">
                                    ÁREA DO ALUNO
                                </p>

                                <p
                                    style={{
                                        margin:
                                            "0 0 20px",

                                        lineHeight:
                                            1.7,

                                        opacity:
                                            0.78,
                                    }}
                                >
                                    Acesse seu espaço de trabalho,
                                    seus estudos e a inteligência
                                    pedagógica do EducaCube.
                                </p>

                                <a
                                    href="/login"
                                    className="btn-primary"
                                    style={{
                                        display:
                                            "flex",

                                        width:
                                            "100%",

                                        justifyContent:
                                            "center",

                                        alignItems:
                                            "center",

                                        textDecoration:
                                            "none",
                                    }}
                                >
                                    Entrar na plataforma
                                </a>

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

                        <section
                            id="brain-viewport"
                            aria-label="Modelo tridimensional da coruja do EducaCube"
                        >

                            <div className="brain-frame">

                                <span className="brain-corner brain-corner--tl" />
                                <span className="brain-corner brain-corner--tr" />
                                <span className="brain-corner brain-corner--bl" />
                                <span className="brain-corner brain-corner--br" />

                                {isFull && (
                                    <Suspense
                                        fallback={
                                            <div className="owl-loading" />
                                        }
                                    >
                                        <OwlShowcase />
                                    </Suspense>
                                )}

                                {!isFull && (
                                    <img
                                        src="/educacubelogo.webp"
                                        alt="Coruja do EducaCube"
                                        className="owl-mobile-image"
                                    />
                                )}

                            </div>

                            <div className="brain-label">

                                <span>
                                    Guardiã do laboratório
                                </span>

                                <strong>
                                    A coruja do EducaCube
                                </strong>

                            </div>

                        </section>

                    </div>

                </section>

                {isFull && (
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

                            <Suspense fallback={null}>
                                <TransformDesktop />
                            </Suspense>

                        </div>

                    </section>
                )}

                <section
                    className="workspace-section"
                    id="ferramentas"
                >

                    <div className="workspace-header">

                        <h2>
                            Um fluxo, quatro instrumentos
                        </h2>

                        <p>
                            Da leitura do processo de aprendizagem
                            até a intervenção — cada módulo assume
                            o trabalho na etapa em que o anterior termina.
                        </p>

                    </div>

                    <nav
                        className="chalk-tray"
                        aria-label="Módulos do laboratório"
                    >

                        {modulos.map(
                            ({
                                id,
                                numero,
                                nome,
                                descricao,
                                Icone,
                            }) => (

                                <button
                                    key={id}
                                    type="button"
                                    className="tray-item"
                                    onClick={() =>
                                        openModule(
                                            id
                                        )
                                    }
                                >

                                    <div className="tray-top">

                                        <span className="tray-index">
                                            {numero}
                                        </span>

                                        <span className="tray-icon">
                                            <Icone />
                                        </span>

                                    </div>

                                    <span className="tray-name">
                                        {nome}
                                    </span>

                                    <span className="tray-desc">
                                        {descricao}
                                    </span>

                                    <span className="tray-cta">
                                        Abrir módulo
                                    </span>

                                </button>

                            )
                        )}

                    </nav>

                </section>

            </main>

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
                                    length:
                                        9,
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
                                        {
                                            index +
                                            1
                                        }º Ano
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
                            event
                                .target
                                .value
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
                            event
                                .target
                                .value
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
                            event
                                .target
                                .value
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
                            length:
                                9,
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
                                {
                                    index +
                                    1
                                }º Ano
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
                            event
                                .target
                                .value
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
                            event
                                .target
                                .value
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
                            event
                                .target
                                .value
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
                                da plataforma, autenticação,
                                preferências e, caso autorizado,
                                estatísticas de uso.
                            </p>

                            <div className="cookie-links">

                                <a
                                    href="/privacidade.html"
                                    className="cookie-link"
                                >
                                    Política de Privacidade
                                </a>

                                <a
                                    href="/cookies.html"
                                    className="cookie-link"
                                >
                                    Política de Cookies
                                </a>

                            </div>

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

/* =========================================================
 * APP — ROTEADOR
 * ========================================================= */

function App() {
    return (
        <BrowserRouter>
            <Routes>

                {/* =================================================
                    LOGIN INDEPENDENTE
                ================================================= */}

                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/login/"
                    element={<LoginPage />}
                />

                {/* =================================================
                    AURA AI
                ================================================= */}

                <Route
                    path="/aura"
                    element={<AuraAI />}
                />

                <Route
                    path="/aura/"
                    element={<AuraAI />}
                />

                {/* =================================================
                    HOME
                ================================================= */}

                <Route
                    path="/*"
                    element={<LabPage />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;

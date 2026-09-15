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

import {
    auth,
    googleProvider,
    db,
} from "./lib/firebase";

import {
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    updateProfile,
} from "firebase/auth";

import {
    doc,
    getDoc,
    setDoc,
    serverTimestamp,
} from "firebase/firestore";

import { usePerformanceMode } from "./hooks/usePerformanceMode";

import {
    aceitarAnalytics,
    recusarAnalytics,
} from "./lib/analytics";

/* =========================================================
 * AURA AI
 * ========================================================= */

import AuraAI from "./pages/AuraAI";

/* =========================================================
 * COMPONENTES PESADOS
 * ========================================================= */

const OwlShowcase = lazy(
    () => import("./components/OwlShowcase")
);

const TransformDesktop = lazy(
    () => import("./components/TransformDesktop")
);

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

/* =========================================================
 * ÍCONES
 * ========================================================= */

function IconUser({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
        >
            <circle cx="12" cy="8" r="3.4" />
            <path d="M4.5 20 C5.8 15.8 8.5 14 12 14 C15.5 14 18.2 15.8 19.5 20" />
        </svg>
    );
}

function IconLock({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
        >
            <rect x="5" y="11" width="14" height="9.5" rx="2" />
            <path d="M8 11 V7.5 A4 4 0 0 1 16 7.5 V11" />
        </svg>
    );
}

function IconEye({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
        >
            <path d="M2.5 12 C5 7 8.3 4.7 12 4.7 C15.7 4.7 19 7 21.5 12 C19 17 15.7 19.3 12 19.3 C8.3 19.3 5 17 2.5 12 Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    );
}

function IconEyeOff({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
        >
            <path d="M3.5 3.5 L20.5 20.5" />
            <path d="M10.6 5.1 C11.06 5 11.53 4.95 12 4.95 C15.7 4.95 19 7.2 21.5 12 C20.7 13.6 19.75 14.9 18.7 15.95" />
            <path d="M6.9 6.9 C4.9 8.2 3.5 10 2.5 12 C5 16.8 8.3 19.05 12 19.05 C13.35 19.05 14.65 18.75 15.85 18.15" />
            <path d="M9.6 10.1 A3 3 0 0 0 14 14.35" />
        </svg>
    );
}

function IconArrowRight({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
        >
            <path d="M4 12 H19" />
            <path d="M13.5 6 L19.5 12 L13.5 18" />
        </svg>
    );
}

function IconGoogle({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 24 24"
            aria-hidden="true"
        >
            <path
                fill="#EA4335"
                d="M12 10.2v3.9h5.5c-.24 1.4-1.7 4.1-5.5 4.1-3.3 0-6-2.7-6-6.2s2.7-6.2 6-6.2c1.9 0 3.15.8 3.88 1.5l2.64-2.55C16.86 3.02 14.68 2 12 2 6.98 2 2.9 6.03 2.9 11s4.08 9 9.1 9c5.25 0 8.74-3.7 8.74-8.9 0-.6-.07-1.06-.15-1.5H12Z"
            />
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
            <circle cx="10.5" cy="10.5" r="6.5" />
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
            <circle cx="12" cy="12" r="8" />
            <circle cx="12" cy="12" r="3.2" />
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
            <circle cx="12" cy="12" r="8.5" />

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
 * LAB PAGE
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

    const [emailInput, setEmailInput] =
        useState("");

    const [senhaInput, setSenhaInput] =
        useState("");

    const [confirmarSenhaInput, setConfirmarSenhaInput] =
        useState("");

    const [nomeInput, setNomeInput] =
        useState("");

    const [modoAutenticacao, setModoAutenticacao] =
        useState<"login" | "cadastro">("login");

    const [carregandoAuth, setCarregandoAuth] =
        useState(false);

    const [mostrarSenha, setMostrarSenha] =
        useState(false);

    const [lembrarDeMim, setLembrarDeMim] =
        useState(true);

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

        if (consentimento === "aceito") {
            aceitarAnalytics();
        } else {
            recusarAnalytics();
        }
    }, []);

    /* =====================================================
     * LEMBRAR E-MAIL NO ACESSO
     * ===================================================== */

    useEffect(() => {
        const emailLembrado =
            localStorage.getItem(
                "educacube_remembered_email"
            );

        if (emailLembrado) {
            setEmailInput(emailLembrado);
        } else {
            setLembrarDeMim(false);
        }
    }, []);

    const salvarConsentimento = (
        escolha: "aceito" | "recusado"
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

        if (escolha === "aceito") {
            aceitarAnalytics();
        } else {
            recusarAnalytics();
        }

        setShowCookieBanner(false);
    };

    const abrirConfiguracoesCookies = () => {
        window.location.href =
            "/cookies.html";
    };

    /* =====================================================
     * FIREBASE → FIRESTORE
     * ===================================================== */

    const salvarUsuarioNoFirestore = async (
        user: any
    ) => {
        try {
            if (!user || !user.uid) {
                console.error(
                    "Usuário Firebase inválido."
                );

                return false;
            }

            const usuarioRef =
                doc(
                    db,
                    "usuarios",
                    user.uid
                );

            const usuarioExistente =
                await getDoc(
                    usuarioRef
                );

            if (!usuarioExistente.exists()) {
                await setDoc(
                    usuarioRef,
                    {
                        uid: user.uid,
                        nome: user.displayName || "",
                        email: user.email || "",
                        foto: user.photoURL || "",
                        criadoEm: serverTimestamp(),
                        ultimoLogin: serverTimestamp(),
                    }
                );

                console.log(
                    "✅ Perfil criado no Firestore."
                );
            } else {
                await setDoc(
                    usuarioRef,
                    {
                        uid: user.uid,
                        nome: user.displayName || "",
                        email: user.email || "",
                        foto: user.photoURL || "",
                        ultimoLogin: serverTimestamp(),
                    },
                    {
                        merge: true,
                    }
                );

                console.log(
                    "✅ Perfil atualizado no Firestore."
                );
            }

            return true;
        } catch (error) {
            console.error(
                "❌ Erro ao salvar usuário no Firestore:",
                error
            );

            return false;
        }
    };

    /* =====================================================
     * REGISTRAR ACESSO
     * ===================================================== */

    const registrarAcesso = async () => {
        try {
            const user =
                auth.currentUser;

            if (!user) {
                console.warn(
                    "⚠️ Não foi possível registrar acesso: usuário não autenticado."
                );

                return;
            }

            const idToken =
                await user.getIdToken();

            const response =
                await fetch(
                    "/api/registrar-acesso",
                    {
                        method: "POST",
                        headers: {
                            Authorization:
                                `Bearer ${idToken}`,

                            "Content-Type":
                                "application/json",
                        },
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                console.error(
                    "❌ Erro ao registrar acesso:",
                    data
                );

                return;
            }

            console.log(
                "✅ Acesso registrado:",
                data
            );
        } catch (error) {
            console.error(
                "❌ Erro ao registrar acesso:",
                error
            );
        }
    };

    /* =====================================================
     * ENVIO DE VERIFICAÇÃO — RESEND
     * ===================================================== */

    const enviarEmailVerificacao = async (
        user: any
    ) => {
        try {
            const response =
                await fetch(
                    "/api/enviar-verificacao",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json",
                        },

                        body: JSON.stringify({
                            email: user.email,
                        }),
                    }
                );

            const data =
                await response.json();

            if (!response.ok) {
                console.error(
                    "Erro ao enviar verificação:",
                    data
                );

                return false;
            }

            console.log(
                "E-mail personalizado enviado pelo Resend:",
                data
            );

            return true;
        } catch (error) {
            console.error(
                "Erro ao chamar API de verificação:",
                error
            );

            return false;
        }
    };

    /* =====================================================
     * LOGIN GOOGLE
     * ===================================================== */

    const loginComGoogle = async () => {
        try {
            setCarregandoAuth(true);

            const result =
                await signInWithPopup(
                    auth,
                    googleProvider
                );

            const user =
                result.user;

            console.log(
                "Login Firebase realizado:",
                {
                    uid: user.uid,
                    nome: user.displayName,
                    email: user.email,
                }
            );

            const salvo =
                await salvarUsuarioNoFirestore(
                    user
                );

            if (!salvo) {
                alert(
                    "Login realizado, mas não foi possível salvar seu perfil no Firestore."
                );

                return;
            }

            await registrarAcesso();

            alert(
                `Bem-vindo, ${
                    user.displayName ||
                    "usuário"
                }!`
            );

            window.location.href =
                "/aura";
        } catch (error) {
            console.error(
                "Erro no login com Google:",
                error
            );

            alert(
                "Não foi possível entrar com Google."
            );
        } finally {
            setCarregandoAuth(false);
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

        firstVideo.currentTime = 0;

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
                        if (index === 2) {
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
                                index + 1
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
     * AUTENTICAÇÃO — LOGIN E-MAIL
     * ===================================================== */

    const entrarComEmail = async () => {
        const email =
            emailInput.trim();

        const senha =
            senhaInput;

        if (
            !email ||
            !senha
        ) {
            alert(
                "Digite seu e-mail e sua senha."
            );

            return;
        }

        setCarregandoAuth(true);

        try {
            const result =
                await signInWithEmailAndPassword(
                    auth,
                    email,
                    senha
                );

            console.log(
                "Login com e-mail realizado:",
                {
                    uid:
                        result.user.uid,

                    email:
                        result.user.email,
                }
            );

            const salvo =
                await salvarUsuarioNoFirestore(
                    result.user
                );

            if (!salvo) {
                alert(
                    "Login realizado, mas não foi possível salvar seu perfil no Firestore."
                );

                return;
            }

            if (lembrarDeMim) {
                localStorage.setItem(
                    "educacube_remembered_email",
                    email
                );
            } else {
                localStorage.removeItem(
                    "educacube_remembered_email"
                );
            }

            await registrarAcesso();

            window.location.href =
                "/aura";
        } catch (error: any) {
            console.error(
                "Erro no login com e-mail:",
                error
            );

            if (
                error.code ===
                    "auth/invalid-credential" ||
                error.code ===
                    "auth/wrong-password" ||
                error.code ===
                    "auth/user-not-found"
            ) {
                alert(
                    "E-mail ou senha incorretos."
                );
            } else if (
                error.code ===
                "auth/invalid-email"
            ) {
                alert(
                    "Digite um e-mail válido."
                );
            } else if (
                error.code ===
                "auth/too-many-requests"
            ) {
                alert(
                    "Muitas tentativas. Aguarde alguns minutos e tente novamente."
                );
            } else {
                alert(
                    "Não foi possível entrar. Tente novamente."
                );
            }
        } finally {
            setCarregandoAuth(false);
        }
    };

    /* =====================================================
     * CRIAR CONTA
     * ===================================================== */

    const criarConta = async () => {
        const nome =
            nomeInput.trim();

        const email =
            emailInput.trim();

        const senha =
            senhaInput;

        const confirmarSenha =
            confirmarSenhaInput;

        if (!nome) {
            alert(
                "Digite seu nome."
            );

            return;
        }

        if (
            !email ||
            !senha ||
            !confirmarSenha
        ) {
            alert(
                "Preencha todos os campos."
            );

            return;
        }

        if (
            senha.length < 6
        ) {
            alert(
                "A senha precisa ter pelo menos 6 caracteres."
            );

            return;
        }

        if (
            senha !==
            confirmarSenha
        ) {
            alert(
                "As senhas não coincidem."
            );

            return;
        }

        setCarregandoAuth(true);

        try {
            const result =
                await createUserWithEmailAndPassword(
                    auth,
                    email,
                    senha
                );

            await updateProfile(
                result.user,
                {
                    displayName:
                        nome,
                }
            );

            const salvo =
                await salvarUsuarioNoFirestore(
                    result.user
                );

            if (!salvo) {
                console.warn(
                    "Conta Firebase criada, mas o perfil não foi salvo no Firestore."
                );
            }

            await registrarAcesso();

            const emailEnviado =
                await enviarEmailVerificacao(
                    result.user
                );

            if (!emailEnviado) {
                console.warn(
                    "Conta criada, mas o e-mail de verificação não pôde ser enviado pelo Resend."
                );
            }

            console.log(
                "Conta criada:",
                {
                    uid:
                        result.user.uid,

                    email:
                        result.user.email,

                    nome:
                        result.user.displayName,
                }
            );

            alert(
                "Conta criada com sucesso! Enviamos um e-mail de verificação para você. Depois de confirmar seu e-mail, você poderá entrar no laboratório."
            );

            setModoAutenticacao(
                "login"
            );

            setSenhaInput("");

            setConfirmarSenhaInput("");
        } catch (error: any) {
            console.error(
                "Erro ao criar conta:",
                error
            );

            if (
                error.code ===
                "auth/email-already-in-use"
            ) {
                alert(
                    "Este e-mail já possui uma conta. Tente entrar."
                );
            } else if (
                error.code ===
                "auth/invalid-email"
            ) {
                alert(
                    "Digite um e-mail válido."
                );
            } else if (
                error.code ===
                "auth/weak-password"
            ) {
                alert(
                    "A senha é muito fraca. Use pelo menos 6 caracteres."
                );
            } else {
                alert(
                    "Não foi possível criar a conta. Tente novamente."
                );
            }
        } finally {
            setCarregandoAuth(false);
        }
    };

    /* =====================================================
     * RECUPERAÇÃO DE SENHA
     * ===================================================== */

    const recuperarSenha = async () => {
        const email =
            emailInput.trim();

        if (!email) {
            alert(
                "Digite seu e-mail no campo acima para recuperar sua senha."
            );

            return;
        }

        try {
            await sendPasswordResetEmail(
                auth,
                email
            );

            alert(
                "Se existir uma conta com esse e-mail, enviaremos as instruções para redefinir sua senha."
            );
        } catch (error: any) {
            console.error(
                "Erro ao recuperar senha:",
                error
            );

            if (
                error.code ===
                "auth/invalid-email"
            ) {
                alert(
                    "Digite um e-mail válido."
                );
            } else {
                alert(
                    "Não foi possível enviar o e-mail de recuperação."
                );
            }
        }
    };

    const alternarModoAutenticacao = (
        modo:
            | "login"
            | "cadastro"
    ) => {
        setModoAutenticacao(
            modo
        );

        setSenhaInput("");

        setConfirmarSenhaInput("");
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

                    <span className="brand-badge">
                        <img
                            src="/educacubelogo.webp"
                            alt=""
                            aria-hidden="true"
                        />
                    </span>

                    <span className="brand-name">
                        Educa
                        <em>Cube</em>
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

                    <span className="site-tagline">
                        Aprender · Planejar · Transformar
                    </span>

                </nav>

                <div className="site-actions">

                    <button
                        type="button"
                        className="btn-ghost"
                        onClick={
                            loginComGoogle
                        }
                        disabled={
                            carregandoAuth
                        }
                    >
                        {carregandoAuth
                            ? "Aguarde..."
                            : "Entrar com Google"}
                    </button>

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
                        ? <IconClose />
                        : <IconMenu />
                    }

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

                    <button
                        type="button"
                        onClick={
                            loginComGoogle
                        }
                        disabled={
                            carregandoAuth
                        }
                    >
                        {carregandoAuth
                            ? "Aguarde..."
                            : "Entrar com Google"}
                    </button>

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
                                O laboratório{" "}
                                <em>pedagógico</em>{" "}
                                do EducaCube
                            </h1>

                            <p className="hero-lede">
                                Quatro instrumentos construídos
                                a partir da prática docente:
                                leitura do processo de aprendizagem,
                                consulta curricular, planejamento
                                de aula e desenho de intervenções —
                                no lugar da prática, não em vez dela.
                            </p>

                            <div className="access-card">

                                <div className="access-card__brand">

                                    <span className="brand-badge">
                                        <img
                                            src="/educacubelogo.webp"
                                            alt=""
                                            aria-hidden="true"
                                        />
                                    </span>

                                    <span className="access-card__brand-text">
                                        <strong>
                                            Educa
                                            <em>Cube</em>
                                        </strong>
                                        <span>
                                            Plataforma educacional
                                        </span>
                                    </span>

                                </div>

                                <div className="access-card__heading">
                                    <h2>
                                        {modoAutenticacao === "login"
                                            ? "Bem-vindo de volta"
                                            : "Crie sua conta"}
                                    </h2>
                                    <p>
                                        {modoAutenticacao === "login"
                                            ? "Acesse o laboratório e continue de onde parou."
                                            : "Leva menos de um minuto para começar."}
                                    </p>
                                </div>

                                <div
                                    className="access-tabs"
                                    role="tablist"
                                    aria-label="Modo de acesso"
                                >

                                    <button
                                        type="button"
                                        role="tab"
                                        aria-selected={
                                            modoAutenticacao ===
                                            "login"
                                        }
                                        className={
                                            modoAutenticacao ===
                                            "login"
                                                ? "is-active"
                                                : ""
                                        }
                                        onClick={() =>
                                            alternarModoAutenticacao(
                                                "login"
                                            )
                                        }
                                    >
                                        Entrar
                                    </button>

                                    <button
                                        type="button"
                                        role="tab"
                                        aria-selected={
                                            modoAutenticacao ===
                                            "cadastro"
                                        }
                                        className={
                                            modoAutenticacao ===
                                            "cadastro"
                                                ? "is-active"
                                                : ""
                                        }
                                        onClick={() =>
                                            alternarModoAutenticacao(
                                                "cadastro"
                                            )
                                        }
                                    >
                                        Criar conta
                                    </button>

                                </div>

                                {modoAutenticacao ===
                                    "cadastro" && (
                                    <div className="field-group">
                                        <label
                                            className="field-label"
                                            htmlFor="nomeInput"
                                        >
                                            Nome
                                        </label>

                                        <IconUser
                                            className="field-icon"
                                        />

                                        <input
                                            type="text"
                                            id="nomeInput"
                                            value={
                                                nomeInput
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setNomeInput(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Digite seu nome"
                                            autoComplete="name"
                                        />
                                    </div>
                                )}

                                <div className="field-group">
                                    <label
                                        className="field-label"
                                        htmlFor="emailInput"
                                    >
                                        E-mail
                                    </label>

                                    <IconUser
                                        className="field-icon"
                                    />

                                    <input
                                        type="email"
                                        id="emailInput"
                                        value={
                                            emailInput
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setEmailInput(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Usuário ou e-mail"
                                        autoComplete="email"
                                    />
                                </div>

                                <div className="field-group field-group--password">
                                    <label
                                        className="field-label"
                                        htmlFor="senhaInput"
                                    >
                                        Senha
                                    </label>

                                    <IconLock
                                        className="field-icon"
                                    />

                                    <input
                                        type={
                                            mostrarSenha
                                                ? "text"
                                                : "password"
                                        }
                                        id="senhaInput"
                                        value={
                                            senhaInput
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setSenhaInput(
                                                event
                                                    .target
                                                    .value
                                            )
                                        }
                                        placeholder="Senha"
                                        autoComplete={
                                            modoAutenticacao ===
                                            "login"
                                                ? "current-password"
                                                : "new-password"
                                        }
                                    />

                                    <button
                                        type="button"
                                        className="field-toggle"
                                        onClick={() =>
                                            setMostrarSenha(
                                                (valor) => !valor
                                            )
                                        }
                                        aria-label={
                                            mostrarSenha
                                                ? "Ocultar senha"
                                                : "Mostrar senha"
                                        }
                                    >
                                        {mostrarSenha ? (
                                            <IconEyeOff />
                                        ) : (
                                            <IconEye />
                                        )}
                                    </button>
                                </div>

                                {modoAutenticacao ===
                                    "cadastro" && (
                                    <div className="field-group field-group--password">
                                        <label
                                            className="field-label"
                                            htmlFor="confirmarSenhaInput"
                                        >
                                            Confirmar senha
                                        </label>

                                        <IconLock
                                            className="field-icon"
                                        />

                                        <input
                                            type={
                                                mostrarSenha
                                                    ? "text"
                                                    : "password"
                                            }
                                            id="confirmarSenhaInput"
                                            value={
                                                confirmarSenhaInput
                                            }
                                            onChange={(
                                                event
                                            ) =>
                                                setConfirmarSenhaInput(
                                                    event
                                                        .target
                                                        .value
                                                )
                                            }
                                            placeholder="Digite a senha novamente"
                                            autoComplete="new-password"
                                        />
                                    </div>
                                )}

                                {modoAutenticacao ===
                                    "login" && (
                                    <div className="access-remember-row">
                                        <label className="access-remember">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    lembrarDeMim
                                                }
                                                onChange={(
                                                    event
                                                ) =>
                                                    setLembrarDeMim(
                                                        event
                                                            .target
                                                            .checked
                                                    )
                                                }
                                            />
                                            Lembrar de mim
                                        </label>

                                        <button
                                            type="button"
                                            className="access-forgot"
                                            onClick={
                                                recuperarSenha
                                            }
                                        >
                                            Esqueceu sua senha?
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    className="btn-primary"
                                    onClick={
                                        modoAutenticacao ===
                                        "login"
                                            ? entrarComEmail
                                            : criarConta
                                    }
                                    disabled={
                                        carregandoAuth
                                    }
                                >
                                    {carregandoAuth ? (
                                        "Aguarde..."
                                    ) : (
                                        <>
                                            <IconArrowRight />
                                            {modoAutenticacao ===
                                            "login"
                                                ? "Entrar"
                                                : "Criar conta"}
                                        </>
                                    )}
                                </button>

                                <div className="access-divider">
                                    ou
                                </div>

                                <button
                                    type="button"
                                    className="btn-ghost"
                                    onClick={
                                        loginComGoogle
                                    }
                                    disabled={
                                        carregandoAuth
                                    }
                                >
                                    {carregandoAuth ? (
                                        "Aguarde..."
                                    ) : (
                                        <>
                                            <IconGoogle />
                                            Continuar com Google
                                        </>
                                    )}
                                </button>

                                <p className="access-card__footer">
                                    Grandes descobertas começam
                                    com o acesso certo.
                                </p>

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
 * APP (ROTEADOR)
 * ========================================================= */

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route
                    path="/aura"
                    element={<AuraAI />}
                />

                <Route
                    path="/aura/"
                    element={<AuraAI />}
                />

                <Route
                    path="/*"
                    element={<LabPage />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;

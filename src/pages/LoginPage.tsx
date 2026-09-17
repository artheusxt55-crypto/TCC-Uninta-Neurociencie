import {
  FormEvent,
  useEffect,
  useState,
} from "react";

import {
  auth,
  googleProvider,
  db,
} from "../lib/firebase";

import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  User,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

/* =========================================================
 * ÍCONE DO CUBO
 * ========================================================= */

function CubeIcon({
  size = 30,
}: {
  size?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3 L20.5 7.5 V16.5 L12 21 L3.5 16.5 V7.5 Z" />
      <path d="M3.5 7.5 L12 12 L20.5 7.5" />
      <path d="M12 12 V21" />
    </svg>
  );
}

/* =========================================================
 * ÍCONES
 * ========================================================= */

function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M3 7L12 13L21 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="4" y="10" width="16" height="11" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20C5.8 16.8 8.1 15 12 15C15.9 15 18.2 16.8 19 20" />
    </svg>
  );
}

function EyeIcon({
  visible,
}: {
  visible: boolean;
}) {
  if (visible) {
    return (
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
        <circle cx="12" cy="12" r="2.5" />
      </svg>
    );
  }

  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M3 3L21 21" />
      <path d="M10.6 5.7C11.1 5.6 11.5 5.5 12 5.5C18 5.5 21.5 12 21.5 12C20.5 13.8 19.1 15.4 17.5 16.5" />
      <path d="M6.2 6.2C4.6 7.4 3.4 9.1 2.5 12C2.5 12 6 18.5 12 18.5C13.2 18.5 14.3 18.2 15.3 17.8" />
      <path d="M9.9 9.9C9.4 10.5 9.1 11.2 9.1 12C9.1 13.6 10.4 14.9 12 14.9C12.8 14.9 13.5 14.6 14.1 14.1" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M21.35 12.27c0-.78-.07-1.54-.23-2.27H12v4.3h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.42Z"
      />
      <path
        fill="currentColor"
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.75Z"
      />
      <path
        fill="currentColor"
        d="M6.54 13.83A5.86 5.86 0 0 1 6.23 12c0-.64.11-1.26.31-1.83V7.64H3.3A9.76 9.76 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.36l3.24-2.53Z"
      />
      <path
        fill="currentColor"
        d="M12 6.14c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.25 14.63 2.25 12 2.25A9.74 9.74 0 0 0 3.3 7.64l3.24 2.53C7.31 7.86 9.46 6.14 12 6.14Z"
      />
    </svg>
  );
}

/* =========================================================
 * COMPONENTE
 * ========================================================= */

export default function LoginPage() {
  const [modo, setModo] = useState<"login" | "cadastro">("login");

  const [emailInput, setEmailInput] = useState("");
  const [senhaInput, setSenhaInput] = useState("");
  const [confirmarSenhaInput, setConfirmarSenhaInput] = useState("");
  const [nomeInput, setNomeInput] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);

  const [lembrarLogin, setLembrarLogin] = useState(false);

  const [carregandoAuth, setCarregandoAuth] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [mensagemSucesso, setMensagemSucesso] = useState("");

  /* =========================================================
   * RECUPERA E-MAIL SALVO
   * ========================================================= */

  useEffect(() => {
    const emailSalvo = localStorage.getItem(
      "educacube_saved_email"
    );

    if (emailSalvo) {
      setEmailInput(emailSalvo);
      setLembrarLogin(true);
    }
  }, []);

  /* =========================================================
   * LIMPA MENSAGENS
   * ========================================================= */

  function limparMensagens() {
    setMensagemErro("");
    setMensagemSucesso("");
  }

  /* =========================================================
   * SALVAR USUÁRIO NO FIRESTORE
   * ========================================================= */

  async function salvarUsuarioNoFirestore(user: User) {
    try {
      const usuarioRef = doc(
        db,
        "usuarios",
        user.uid
      );

      const usuarioExistente = await getDoc(
        usuarioRef
      );

      const dadosUsuario = {
        uid: user.uid,
        nome:
          user.displayName ||
          nomeInput ||
          "",
        email: user.email || "",
        foto: user.photoURL || "",
        ultimoLogin: serverTimestamp(),
      };

      if (!usuarioExistente.exists()) {
        await setDoc(usuarioRef, {
          ...dadosUsuario,
          criadoEm: serverTimestamp(),
        });
      } else {
        await setDoc(
          usuarioRef,
          dadosUsuario,
          { merge: true }
        );
      }
    } catch (error) {
      console.error(
        "Erro ao salvar usuário no Firestore:",
        error
      );
    }
  }

  /* =========================================================
   * REGISTRAR ACESSO
   * ========================================================= */

  async function registrarAcesso(user: User) {
    try {
      const token = await user.getIdToken();

      await fetch("/api/registrar-acesso", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error(
        "Erro ao registrar acesso:",
        error
      );
    }
  }

  /* =========================================================
   * ENVIAR VERIFICAÇÃO
   * ========================================================= */

  async function enviarEmailVerificacao(user: User) {
    try {
      const token = await user.getIdToken();

      await fetch("/api/enviar-verificacao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error(
        "Erro ao enviar verificação:",
        error
      );
    }
  }

  /* =========================================================
   * FINALIZAR AUTENTICAÇÃO
   * ========================================================= */

  async function finalizarLogin(user: User) {
    await salvarUsuarioNoFirestore(user);
    await registrarAcesso(user);

    if (lembrarLogin && user.email) {
      localStorage.setItem(
        "educacube_saved_email",
        user.email
      );
    } else {
      localStorage.removeItem(
        "educacube_saved_email"
      );
    }

    window.location.href = "/aura";
  }

  /* =========================================================
   * LOGIN GOOGLE
   * ========================================================= */

  async function loginComGoogle() {
    limparMensagens();
    setCarregandoAuth(true);

    try {
      const resultado = await signInWithPopup(
        auth,
        googleProvider
      );

      await finalizarLogin(resultado.user);
    } catch (error: any) {
      console.error(
        "Erro no login com Google:",
        error
      );

      if (
        error?.code ===
        "auth/popup-closed-by-user"
      ) {
        setMensagemErro(
          "A janela do Google foi fechada antes da conclusão do login."
        );
      } else if (
        error?.code ===
        "auth/popup-blocked"
      ) {
        setMensagemErro(
          "O navegador bloqueou a janela do Google. Permita pop-ups e tente novamente."
        );
      } else {
        setMensagemErro(
          "Não foi possível entrar com o Google. Tente novamente."
        );
      }
    } finally {
      setCarregandoAuth(false);
    }
  }

  /* =========================================================
   * LOGIN COM E-MAIL
   * ========================================================= */

  async function entrarComEmail() {
    limparMensagens();

    const email = emailInput.trim();
    const senha = senhaInput;

    if (!email) {
      setMensagemErro(
        "Digite seu e-mail."
      );
      return;
    }

    if (!senha) {
      setMensagemErro(
        "Digite sua senha."
      );
      return;
    }

    setCarregandoAuth(true);

    try {
      const resultado =
        await signInWithEmailAndPassword(
          auth,
          email,
          senha
        );

      await finalizarLogin(resultado.user);
    } catch (error: any) {
      console.error(
        "Erro no login:",
        error
      );

      switch (error?.code) {
        case "auth/invalid-email":
          setMensagemErro(
            "Digite um e-mail válido."
          );
          break;

        case "auth/invalid-credential":
        case "auth/wrong-password":
        case "auth/user-not-found":
          setMensagemErro(
            "E-mail ou senha incorretos."
          );
          break;

        case "auth/user-disabled":
          setMensagemErro(
            "Esta conta foi desativada."
          );
          break;

        case "auth/too-many-requests":
          setMensagemErro(
            "Muitas tentativas. Aguarde alguns minutos e tente novamente."
          );
          break;

        default:
          setMensagemErro(
            "Não foi possível entrar. Tente novamente."
          );
      }
    } finally {
      setCarregandoAuth(false);
    }
  }

  /* =========================================================
   * CRIAR CONTA
   * ========================================================= */

  async function criarConta() {
    limparMensagens();

    const nome = nomeInput.trim();
    const email = emailInput.trim();
    const senha = senhaInput;
    const confirmacao = confirmarSenhaInput;

    if (!nome) {
      setMensagemErro(
        "Digite seu nome."
      );
      return;
    }

    if (!email) {
      setMensagemErro(
        "Digite seu e-mail."
      );
      return;
    }

    if (!senha) {
      setMensagemErro(
        "Digite uma senha."
      );
      return;
    }

    if (senha.length < 6) {
      setMensagemErro(
        "A senha precisa ter pelo menos 6 caracteres."
      );
      return;
    }

    if (senha !== confirmacao) {
      setMensagemErro(
        "As senhas não coincidem."
      );
      return;
    }

    setCarregandoAuth(true);

    try {
      const resultado =
        await createUserWithEmailAndPassword(
          auth,
          email,
          senha
        );

      await updateProfile(
        resultado.user,
        {
          displayName: nome,
        }
      );

      await salvarUsuarioNoFirestore(
        resultado.user
      );

      await registrarAcesso(
        resultado.user
      );

      await enviarEmailVerificacao(
        resultado.user
      );

      if (lembrarLogin) {
        localStorage.setItem(
          "educacube_saved_email",
          email
        );
      }

      setMensagemSucesso(
        "Conta criada com sucesso. Enviamos um e-mail de verificação."
      );

      setTimeout(() => {
        window.location.href = "/aura";
      }, 1000);
    } catch (error: any) {
      console.error(
        "Erro ao criar conta:",
        error
      );

      switch (error?.code) {
        case "auth/email-already-in-use":
          setMensagemErro(
            "Este e-mail já possui uma conta."
          );
          break;

        case "auth/invalid-email":
          setMensagemErro(
            "Digite um e-mail válido."
          );
          break;

        case "auth/weak-password":
          setMensagemErro(
            "Escolha uma senha mais forte."
          );
          break;

        default:
          setMensagemErro(
            "Não foi possível criar a conta. Tente novamente."
          );
      }
    } finally {
      setCarregandoAuth(false);
    }
  }

  /* =========================================================
   * RECUPERAR SENHA
   * ========================================================= */

  async function recuperarSenha() {
    limparMensagens();

    const email = emailInput.trim();

    if (!email) {
      setMensagemErro(
        "Digite seu e-mail primeiro para recuperar a senha."
      );
      return;
    }

    setCarregandoAuth(true);

    try {
      await sendPasswordResetEmail(
        auth,
        email
      );

      setMensagemSucesso(
        "Enviamos um link para redefinir sua senha."
      );
    } catch (error: any) {
      console.error(
        "Erro ao recuperar senha:",
        error
      );

      switch (error?.code) {
        case "auth/invalid-email":
          setMensagemErro(
            "Digite um e-mail válido."
          );
          break;

        case "auth/user-not-found":
          setMensagemErro(
            "Não encontramos uma conta com esse e-mail."
          );
          break;

        default:
          setMensagemErro(
            "Não foi possível enviar o e-mail de recuperação."
          );
      }
    } finally {
      setCarregandoAuth(false);
    }
  }

  /* =========================================================
   * SUBMIT
   * ========================================================= */

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (modo === "login") {
      void entrarComEmail();
    } else {
      void criarConta();
    }
  }

  /* =========================================================
   * ALTERNAR MODO
   * ========================================================= */

  function alternarModo(
    novoModo: "login" | "cadastro"
  ) {
    limparMensagens();
    setModo(novoModo);
    setSenhaInput("");
    setConfirmarSenhaInput("");
  }

  /* =========================================================
   * JSX
   * ========================================================= */

  return (
    <main
      className="min-h-screen w-full bg-[#0A0A0A] text-white"
      style={{
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div className="grid min-h-screen lg:grid-cols-2">

        {/* =================================================
         * LADO ESQUERDO
         * ================================================= */}

        <section className="flex min-h-screen items-center justify-center px-6 py-10 sm:px-10">

          <div className="w-full max-w-[360px]">

            {/* LOGO */}

            <a
              href="/"
              className="mb-10 flex w-fit items-center gap-3 no-underline"
              aria-label="EducaCube - início"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#170033] text-white"
              >
                <CubeIcon size={25} />
              </span>

              <span className="text-[19px] font-semibold tracking-[-0.03em] text-white">
                EducaCube
              </span>
            </a>

            {/* CABEÇALHO */}

            <div className="mb-7">

              <h1 className="text-[30px] font-semibold tracking-[-0.04em] text-white">
                {modo === "login"
                  ? "Bem-vindo de volta."
                  : "Crie sua conta."}
              </h1>

              <p className="mt-2 text-[14px] leading-6 text-white/50">
                {modo === "login"
                  ? "Entre para acessar seu espaço de trabalho pedagógico."
                  : "Comece a usar o ambiente educacional do EducaCube."}
              </p>

            </div>

            {/* ALTERNÂNCIA */}

            <div className="mb-6 grid grid-cols-2 rounded-xl border border-white/10 bg-white/[0.025] p-1">

              <button
                type="button"
                onClick={() =>
                  alternarModo("login")
                }
                className={`rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition ${
                  modo === "login"
                    ? "bg-[#170033] text-white"
                    : "text-white/45 hover:text-white/80"
                }`}
              >
                Entrar
              </button>

              <button
                type="button"
                onClick={() =>
                  alternarModo("cadastro")
                }
                className={`rounded-[10px] px-3 py-2.5 text-[13px] font-medium transition ${
                  modo === "cadastro"
                    ? "bg-[#170033] text-white"
                    : "text-white/45 hover:text-white/80"
                }`}
              >
                Criar conta
              </button>

            </div>

            {/* FORMULÁRIO */}

            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {/* NOME */}

              {modo === "cadastro" && (
                <div>
                  <label
                    htmlFor="nome"
                    className="mb-2 block text-[12px] font-medium text-white/65"
                  >
                    Nome
                  </label>

                  <div className="relative">

                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                      <UserIcon />
                    </span>

                    <input
                      id="nome"
                      type="text"
                      value={nomeInput}
                      onChange={(event) =>
                        setNomeInput(
                          event.target.value
                        )
                      }
                      placeholder="Seu nome"
                      autoComplete="name"
                      disabled={carregandoAuth}
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.025] pl-11 pr-4 text-[14px] text-white outline-none transition placeholder:text-white/25 focus:border-[#170033] focus:ring-2 focus:ring-[#170033]/40 disabled:cursor-not-allowed disabled:opacity-50"
                    />

                  </div>
                </div>
              )}

              {/* E-MAIL */}

              <div>

                <label
                  htmlFor="email"
                  className="mb-2 block text-[12px] font-medium text-white/65"
                >
                  E-mail
                </label>

                <div className="relative">

                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                    <MailIcon />
                  </span>

                  <input
                    id="email"
                    type="email"
                    value={emailInput}
                    onChange={(event) =>
                      setEmailInput(
                        event.target.value
                      )
                    }
                    placeholder="voce@exemplo.com"
                    autoComplete="email"
                    disabled={carregandoAuth}
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.025] pl-11 pr-4 text-[14px] text-white outline-none transition placeholder:text-white/25 focus:border-[#170033] focus:ring-2 focus:ring-[#170033]/40 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                </div>

              </div>

              {/* SENHA */}

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label
                    htmlFor="senha"
                    className="block text-[12px] font-medium text-white/65"
                  >
                    Senha
                  </label>

                </div>

                <div className="relative">

                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                    <LockIcon />
                  </span>

                  <input
                    id="senha"
                    type={
                      mostrarSenha
                        ? "text"
                        : "password"
                    }
                    value={senhaInput}
                    onChange={(event) =>
                      setSenhaInput(
                        event.target.value
                      )
                    }
                    placeholder="Sua senha"
                    autoComplete={
                      modo === "login"
                        ? "current-password"
                        : "new-password"
                    }
                    disabled={carregandoAuth}
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.025] pl-11 pr-12 text-[14px] text-white outline-none transition placeholder:text-white/25 focus:border-[#170033] focus:ring-2 focus:ring-[#170033]/40 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarSenha(
                        (value) => !value
                      )
                    }
                    disabled={carregandoAuth}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white/70"
                    aria-label={
                      mostrarSenha
                        ? "Ocultar senha"
                        : "Mostrar senha"
                    }
                  >
                    <EyeIcon
                      visible={mostrarSenha}
                    />
                  </button>

                </div>

              </div>

              {/* CONFIRMAR SENHA */}

              {modo === "cadastro" && (
                <div>

                  <label
                    htmlFor="confirmarSenha"
                    className="mb-2 block text-[12px] font-medium text-white/65"
                  >
                    Confirmar senha
                  </label>

                  <div className="relative">

                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30">
                      <LockIcon />
                    </span>

                    <input
                      id="confirmarSenha"
                      type={
                        mostrarConfirmacao
                          ? "text"
                          : "password"
                      }
                      value={
                        confirmarSenhaInput
                      }
                      onChange={(event) =>
                        setConfirmarSenhaInput(
                          event.target.value
                        )
                      }
                      placeholder="Repita sua senha"
                      autoComplete="new-password"
                      disabled={carregandoAuth}
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.025] pl-11 pr-12 text-[14px] text-white outline-none transition placeholder:text-white/25 focus:border-[#170033] focus:ring-2 focus:ring-[#170033]/40 disabled:cursor-not-allowed disabled:opacity-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarConfirmacao(
                          (value) => !value
                        )
                      }
                      disabled={carregandoAuth}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white/70"
                      aria-label={
                        mostrarConfirmacao
                          ? "Ocultar confirmação de senha"
                          : "Mostrar confirmação de senha"
                      }
                    >
                      <EyeIcon
                        visible={
                          mostrarConfirmacao
                        }
                      />
                    </button>

                  </div>

                </div>
              )}

              {/* LEMBRAR / RECUPERAR */}

              {modo === "login" && (
                <div className="flex items-center justify-between gap-4 pt-1">

                  <label className="flex cursor-pointer items-center gap-2">

                    <input
                      type="checkbox"
                      checked={lembrarLogin}
                      onChange={(event) =>
                        setLembrarLogin(
                          event.target.checked
                        )
                      }
                      className="h-4 w-4 cursor-pointer rounded border-white/20 bg-transparent accent-[#170033]"
                    />

                    <span className="text-[12px] text-white/50">
                      Lembrar meu e-mail
                    </span>

                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      void recuperarSenha()
                    }
                    disabled={carregandoAuth}
                    className="text-[12px] font-medium text-white/60 transition hover:text-white disabled:opacity-40"
                  >
                    Esqueci minha senha
                  </button>

                </div>
              )}

              {/* MENSAGEM DE ERRO */}

              {mensagemErro && (
                <div className="rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-[12px] leading-5 text-white/70">
                  {mensagemErro}
                </div>
              )}

              {/* MENSAGEM DE SUCESSO */}

              {mensagemSucesso && (
                <div className="rounded-xl border border-white/10 bg-[#170033]/40 px-4 py-3 text-[12px] leading-5 text-white/80">
                  {mensagemSucesso}
                </div>
              )}

              {/* BOTÃO PRINCIPAL */}

              <button
                type="submit"
                disabled={carregandoAuth}
                className="flex h-12 w-full items-center justify-center rounded-xl bg-[#170033] px-5 text-[13px] font-semibold text-white shadow-[0_12px_35px_rgba(23,0,51,0.28)] transition hover:bg-[#22004d] focus:outline-none focus:ring-2 focus:ring-[#170033]/60 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {carregandoAuth ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                    Processando...
                  </span>
                ) : modo === "login" ? (
                  "Entrar no EducaCube"
                ) : (
                  "Criar minha conta"
                )}
              </button>

            </form>

            {/* DIVISOR */}

            <div className="my-6 flex items-center gap-4">

              <div className="h-px flex-1 bg-white/10" />

              <span className="text-[11px] uppercase tracking-[0.12em] text-white/25">
                ou
              </span>

              <div className="h-px flex-1 bg-white/10" />

            </div>

            {/* GOOGLE */}

            <button
              type="button"
              onClick={() =>
                void loginComGoogle()
              }
              disabled={carregandoAuth}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-transparent px-5 text-[13px] font-medium text-white/75 transition hover:border-white/20 hover:bg-white/[0.035] hover:text-white focus:outline-none focus:ring-2 focus:ring-[#170033]/50 focus:ring-offset-2 focus:ring-offset-[#0A0A0A] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <GoogleIcon />
              Continuar com Google
            </button>

            {/* RODAPÉ */}

            <p className="mt-7 text-center text-[11px] leading-5 text-white/25">
              Ao continuar, você concorda com as condições
              de uso e políticas do EducaCube.
            </p>

          </div>

        </section>

        {/* =================================================
         * LADO DIREITO
         * ================================================= */}

        <aside className="relative hidden min-h-screen overflow-hidden bg-[#170033] lg:flex">

          {/* ELEMENTOS DECORATIVOS */}

          <div className="absolute inset-0 opacity-[0.08]">
            <div
              className="absolute inset-0"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.35) 1px, transparent 1px)",
                backgroundSize:
                  "64px 64px",
              }}
            />
          </div>

          <div className="absolute -right-32 -top-32 h-[520px] w-[520px] rounded-full border border-white/[0.06]" />

          <div className="absolute -bottom-40 -left-40 h-[520px] w-[520px] rounded-full border border-white/[0.06]" />

          {/* CONTEÚDO */}

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* MARCA */}

            <div className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
                <CubeIcon size={25} />
              </div>

              <span className="text-[15px] font-semibold tracking-[-0.02em]">
                EducaCube
              </span>

            </div>

            {/* TEXTO PRINCIPAL */}

            <div className="max-w-[570px]">

              <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.2em] text-white/40">
                Laboratório de Pesquisa e Práticas Pedagógicas
              </p>

              <h2 className="max-w-[560px] text-4xl font-semibold leading-[1.08] tracking-[-0.045em] text-white xl:text-5xl">
                A inteligência educacional começa com a prática pedagógica.
              </h2>

              <p className="mt-7 max-w-[500px] text-[15px] leading-7 text-white/55">
                Um ambiente pensado para quem pesquisa,
                diagnostica, planeja e intervém na
                aprendizagem — com tecnologia desenvolvida
                para a educação.
              </p>

              {/* FRASE DA PLATAFORMA */}

              <div className="mt-10 max-w-[500px] border-l border-white/20 pl-5">

                <p className="text-[15px] leading-7 text-white/75">
                  “Tecnologia para organizar o trabalho
                  pedagógico sem substituir o olhar de
                  quem ensina.”
                </p>

                <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-white/30">
                  Princípio EducaCube
                </p>

              </div>

            </div>

            {/* RODAPÉ DO PAINEL */}

            <div className="flex items-center justify-between border-t border-white/10 pt-5">

              <span className="text-[10px] uppercase tracking-[0.16em] text-white/25">
                EDUCACUBE
              </span>

              <span className="text-[10px] text-white/25">
                Educação · Tecnologia · Prática
              </span>

            </div>

          </div>

        </aside>

      </div>
    </main>
  );
}

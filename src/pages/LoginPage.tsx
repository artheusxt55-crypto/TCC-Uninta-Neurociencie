
import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
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
} from "firebase/auth";

import type {
  User,
} from "firebase/auth";

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

/* =========================================================
   ÍCONES
========================================================= */

function CubeIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 2.8 20 7.3v9.4L12 21.2l-8-4.5V7.3L12 2.8Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="m4.5 7.4 7.5 4.2 7.5-4.2M12 11.6v9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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
      aria-hidden="true"
    >
      <rect
        x="5"
        y="10"
        width="14"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
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
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="8"
        r="3.2"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M5.5 20c.7-3.2 2.9-5 6.5-5s5.8 1.8 6.5 5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function EyeIcon({
  aberto,
}: {
  aberto: boolean;
}) {
  return aberto ? (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2.8 12s3.3-5.2 9.2-5.2S21.2 12 21.2 12s-3.3 5.2-9.2 5.2S2.8 12 2.8 12Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle
        cx="12"
        cy="12"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.7"
      />
    </svg>
  ) : (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M3 3l18 18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M10.6 6.9A9.8 9.8 0 0 1 12 6.8c5.9 0 9.2 5.2 9.2 5.2a17.7 17.7 0 0 1-3.1 3.4M6.2 8.7C4 10.2 2.8 12 2.8 12S6.1 17.2 12 17.2c1.1 0 2.1-.2 3-.5"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M21.35 12.27c0-.72-.06-1.41-.19-2.07H12v3.91h5.23a4.47 4.47 0 0 1-1.94 2.93v2.43h3.14c1.84-1.69 2.92-4.18 2.92-7.2Z"
      />
      <path
        fill="#34A853"
        d="M12 21.75c2.63 0 4.84-.87 6.45-2.35l-3.14-2.43c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.29v2.5A9.75 9.75 0 0 0 12 21.75Z"
      />
      <path
        fill="#FBBC05"
        d="M6.54 13.86A5.86 5.86 0 0 1 6.23 12c0-.65.11-1.28.31-1.86v-2.5H3.29A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.04 4.36l3.25-2.5Z"
      />
      <path
        fill="#EA4335"
        d="M12 6.11c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.22 14.63 2.25 12 2.25a9.75 9.75 0 0 0-8.71 5.39l3.25 2.5C6.31 7.83 8.46 6.11 12 6.11Z"
      />
    </svg>
  );
}

/* =========================================================
   COMPONENTE
========================================================= */

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
     RECUPERA E-MAIL SALVO
  ========================================================= */

  useEffect(() => {
    const emailSalvo = localStorage.getItem(
      "educacube_saved_email",
    );

    if (emailSalvo) {
      setEmailInput(emailSalvo);
      setLembrarLogin(true);
    }
  }, []);

  /* =========================================================
     FIRESTORE
  ========================================================= */

  async function salvarUsuarioNoFirestore(user: User) {
    const usuarioRef = doc(
      db,
      "usuarios",
      user.uid,
    );

    const usuarioAtual = await getDoc(usuarioRef);

    const dadosUsuario: Record<string, unknown> = {
      uid: user.uid,
      nome:
        user.displayName ||
        nomeInput ||
        "",
      email: user.email || "",
      foto: user.photoURL || "",
      ultimoLogin: serverTimestamp(),
    };

    if (!usuarioAtual.exists()) {
      dadosUsuario.criadoEm = serverTimestamp();
    }

    await setDoc(
      usuarioRef,
      dadosUsuario,
      {
        merge: true,
      },
    );
  }

  /* =========================================================
     REGISTRAR ACESSO
  ========================================================= */

  async function registrarAcesso(user: User) {
    try {
      const token = await user.getIdToken();

      await fetch(
        "/api/registrar-acesso",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      console.error(
        "Erro ao registrar acesso:",
        error,
      );
    }
  }

  /* =========================================================
     E-MAIL DE VERIFICAÇÃO
  ========================================================= */

  async function enviarEmailVerificacao(user: User) {
    try {
      const token = await user.getIdToken();

      await fetch(
        "/api/enviar-verificacao",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        },
      );
    } catch (error) {
      console.error(
        "Erro ao enviar verificação:",
        error,
      );
    }
  }

  /* =========================================================
     FINALIZAR LOGIN
  ========================================================= */

  async function finalizarLogin(user: User) {
    await salvarUsuarioNoFirestore(user);

    await registrarAcesso(user);

    if (lembrarLogin && user.email) {
      localStorage.setItem(
        "educacube_saved_email",
        user.email,
      );
    } else {
      localStorage.removeItem(
        "educacube_saved_email",
      );
    }

    window.location.href = "/aura";
  }

  /* =========================================================
     LOGIN GOOGLE
  ========================================================= */

  async function loginComGoogle() {
    setMensagemErro("");
    setMensagemSucesso("");
    setCarregandoAuth(true);

    try {
      const resultado =
        await signInWithPopup(
          auth,
          googleProvider,
        );

      await finalizarLogin(
        resultado.user,
      );
    } catch (error: unknown) {
      console.error(error);

      setMensagemErro(
        obterMensagemFirebase(error),
      );
    } finally {
      setCarregandoAuth(false);
    }
  }

  /* =========================================================
     LOGIN COM E-MAIL
  ========================================================= */

  async function entrarComEmail() {
    if (!emailInput.trim()) {
      setMensagemErro(
        "Digite seu e-mail.",
      );
      return;
    }

    if (!senhaInput) {
      setMensagemErro(
        "Digite sua senha.",
      );
      return;
    }

    setCarregandoAuth(true);
    setMensagemErro("");
    setMensagemSucesso("");

    try {
      const resultado =
        await signInWithEmailAndPassword(
          auth,
          emailInput.trim(),
          senhaInput,
        );

      await finalizarLogin(
        resultado.user,
      );
    } catch (error: unknown) {
      console.error(error);

      setMensagemErro(
        obterMensagemFirebase(error),
      );
    } finally {
      setCarregandoAuth(false);
    }
  }

  /* =========================================================
     CRIAR CONTA
  ========================================================= */

  async function criarConta() {
    if (!nomeInput.trim()) {
      setMensagemErro(
        "Digite seu nome.",
      );
      return;
    }

    if (!emailInput.trim()) {
      setMensagemErro(
        "Digite seu e-mail.",
      );
      return;
    }

    if (senhaInput.length < 6) {
      setMensagemErro(
        "A senha precisa ter pelo menos 6 caracteres.",
      );
      return;
    }

    if (
      senhaInput !==
      confirmarSenhaInput
    ) {
      setMensagemErro(
        "As senhas não coincidem.",
      );
      return;
    }

    setCarregandoAuth(true);
    setMensagemErro("");
    setMensagemSucesso("");

    try {
      const resultado =
        await createUserWithEmailAndPassword(
          auth,
          emailInput.trim(),
          senhaInput,
        );

      await updateProfile(
        resultado.user,
        {
          displayName:
            nomeInput.trim(),
        },
      );

      await salvarUsuarioNoFirestore(
        resultado.user,
      );

      await registrarAcesso(
        resultado.user,
      );

      await enviarEmailVerificacao(
        resultado.user,
      );

      if (
        lembrarLogin &&
        resultado.user.email
      ) {
        localStorage.setItem(
          "educacube_saved_email",
          resultado.user.email,
        );
      }

      setMensagemSucesso(
        "Conta criada com sucesso. Redirecionando...",
      );

      setTimeout(() => {
        window.location.href =
          "/aura";
      }, 900);
    } catch (error: unknown) {
      console.error(error);

      setMensagemErro(
        obterMensagemFirebase(error),
      );
    } finally {
      setCarregandoAuth(false);
    }
  }

  /* =========================================================
     RECUPERAR SENHA
  ========================================================= */

  async function recuperarSenha() {
    if (!emailInput.trim()) {
      setMensagemErro(
        "Digite seu e-mail para recuperar a senha.",
      );
      return;
    }

    setCarregandoAuth(true);
    setMensagemErro("");
    setMensagemSucesso("");

    try {
      await sendPasswordResetEmail(
        auth,
        emailInput.trim(),
      );

      setMensagemSucesso(
        "Enviamos um link para redefinir sua senha.",
      );
    } catch (error: unknown) {
      console.error(error);

      setMensagemErro(
        obterMensagemFirebase(error),
      );
    } finally {
      setCarregandoAuth(false);
    }
  }

  /* =========================================================
     SUBMIT
  ========================================================= */

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (modo === "login") {
      void entrarComEmail();
    } else {
      void criarConta();
    }
  }

  /* =========================================================
     TROCAR MODO
  ========================================================= */

  function alternarModo() {
    setModo((atual) =>
      atual === "login"
        ? "cadastro"
        : "login",
    );

    setMensagemErro("");
    setMensagemSucesso("");
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main
      className="min-h-screen w-full bg-[#0A0A0A] text-white"
      style={{
        fontFamily:
          "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      }}
    >
      <div className="min-h-screen w-full lg:grid lg:grid-cols-2">
        {/* =================================================
            LADO ESQUERDO
        ================================================== */}

        <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10 sm:px-10 lg:px-12">
          {/* brilho extremamente discreto */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[130px]"
            style={{
              background:
                "radial-gradient(circle, #170033 0%, transparent 68%)",
            }}
          />

          <div className="relative z-10 w-full max-w-[380px]">
            {/* LOGO */}

            <a
              href="/"
              className="mb-12 flex w-fit items-center gap-3 transition-opacity hover:opacity-80"
              aria-label="Voltar para o EducaCube"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#170033] text-purple-300">
                <CubeIcon />
              </span>

              <span className="text-[20px] font-semibold tracking-[-0.03em]">
                Educa<span className="text-purple-400">Cube</span>
              </span>
            </a>

            {/* CABEÇALHO */}

            <div className="mb-8">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-purple-400">
                Área do aluno
              </p>

              <h1 className="text-[32px] font-semibold tracking-[-0.04em] text-white sm:text-[36px]">
                {modo === "login"
                  ? "Bem-vindo de volta."
                  : "Crie sua conta."}
              </h1>

              <p className="mt-3 text-[14px] leading-6 text-white/45">
                {modo === "login"
                  ? "Entre para continuar seus estudos no EducaCube."
                  : "Crie seu acesso ao laboratório educacional do EducaCube."}
              </p>
            </div>

            {/* MENSAGENS */}

            {mensagemErro && (
              <div className="mb-5 rounded-xl border border-red-500/20 bg-red-500/[0.07] px-4 py-3 text-[13px] leading-5 text-red-300">
                {mensagemErro}
              </div>
            )}

            {mensagemSucesso && (
              <div className="mb-5 rounded-xl border border-purple-400/20 bg-purple-500/[0.08] px-4 py-3 text-[13px] leading-5 text-purple-200">
                {mensagemSucesso}
              </div>
            )}

            {/* FORMULÁRIO */}

            <form
              onSubmit={handleSubmit}
              className="space-y-5"
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
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                      <UserIcon />
                    </span>

                    <input
                      id="nome"
                      type="text"
                      value={nomeInput}
                      onChange={(event) =>
                        setNomeInput(
                          event.target.value,
                        )
                      }
                      placeholder="Seu nome"
                      autoComplete="name"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-4 text-[14px] text-white outline-none transition placeholder:text-white/25 hover:border-white/15 focus:border-purple-500/70 focus:bg-white/[0.045] focus:ring-4 focus:ring-purple-500/10"
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
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
                    <MailIcon />
                  </span>

                  <input
                    id="email"
                    type="email"
                    value={emailInput}
                    onChange={(event) =>
                      setEmailInput(
                        event.target.value,
                      )
                    }
                    placeholder="voce@exemplo.com"
                    autoComplete="email"
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-4 text-[14px] text-white outline-none transition placeholder:text-white/25 hover:border-white/15 focus:border-purple-500/70 focus:bg-white/[0.045] focus:ring-4 focus:ring-purple-500/10"
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

                  {modo === "login" && (
                    <button
                      type="button"
                      onClick={() =>
                        void recuperarSenha()
                      }
                      className="text-[12px] font-medium text-purple-400 transition hover:text-purple-300"
                    >
                      Esqueceu a senha?
                    </button>
                  )}
                </div>

                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
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
                        event.target.value,
                      )
                    }
                    placeholder="••••••••"
                    autoComplete={
                      modo === "login"
                        ? "current-password"
                        : "new-password"
                    }
                    className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-12 text-[14px] text-white outline-none transition placeholder:text-white/25 hover:border-white/15 focus:border-purple-500/70 focus:bg-white/[0.045] focus:ring-4 focus:ring-purple-500/10"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarSenha(
                        (valor) => !valor,
                      )
                    }
                    className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/5 hover:text-white/60"
                    aria-label={
                      mostrarSenha
                        ? "Ocultar senha"
                        : "Mostrar senha"
                    }
                  >
                    <EyeIcon
                      aberto={mostrarSenha}
                    />
                  </button>
                </div>
              </div>

              {/* CONFIRMAÇÃO */}

              {modo === "cadastro" && (
                <div>
                  <label
                    htmlFor="confirmarSenha"
                    className="mb-2 block text-[12px] font-medium text-white/65"
                  >
                    Confirmar senha
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30">
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
                          event.target.value,
                        )
                      }
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className="h-12 w-full rounded-xl border border-white/10 bg-white/[0.035] pl-11 pr-12 text-[14px] text-white outline-none transition placeholder:text-white/25 hover:border-white/15 focus:border-purple-500/70 focus:bg-white/[0.045] focus:ring-4 focus:ring-purple-500/10"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarConfirmacao(
                          (valor) => !valor,
                        )
                      }
                      className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-white/30 transition hover:bg-white/5 hover:text-white/60"
                      aria-label={
                        mostrarConfirmacao
                          ? "Ocultar confirmação de senha"
                          : "Mostrar confirmação de senha"
                      }
                    >
                      <EyeIcon
                        aberto={
                          mostrarConfirmacao
                        }
                      />
                    </button>
                  </div>
                </div>
              )}

              {/* LEMBRAR */}

              {modo === "login" && (
                <label className="flex cursor-pointer items-center gap-3 text-[12px] text-white/45">
                  <input
                    type="checkbox"
                    checked={lembrarLogin}
                    onChange={(event) =>
                      setLembrarLogin(
                        event.target.checked,
                      )
                    }
                    className="h-4 w-4 cursor-pointer rounded border-white/20 bg-white/5 accent-purple-600"
                  />

                  <span>
                    Lembrar meu e-mail
                  </span>
                </label>
              )}

              {/* BOTÃO PRINCIPAL */}

              <button
                type="submit"
                disabled={carregandoAuth}
                className="group relative flex h-12 w-full items-center justify-center overflow-hidden rounded-xl bg-[#170033] text-[13px] font-semibold text-white transition duration-200 hover:bg-[#23004d] hover:shadow-[0_0_35px_rgba(91,33,182,0.18)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="relative z-10">
                  {carregandoAuth
                    ? "Aguarde..."
                    : modo === "login"
                      ? "Entrar no EducaCube"
                      : "Criar minha conta"}
                </span>
              </button>
            </form>

            {/* DIVISOR */}

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/[0.08]" />

              <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-white/25">
                ou
              </span>

              <div className="h-px flex-1 bg-white/[0.08]" />
            </div>

            {/* GOOGLE */}

            <button
              type="button"
              onClick={() =>
                void loginComGoogle()
              }
              disabled={carregandoAuth}
              className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-transparent text-[13px] font-medium text-white/75 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleIcon />

              <span>
                Continuar com Google
              </span>
            </button>

            {/* TROCAR MODO */}

            <p className="mt-8 text-center text-[13px] text-white/35">
              {modo === "login"
                ? "Ainda não possui uma conta?"
                : "Já possui uma conta?"}{" "}
              <button
                type="button"
                onClick={alternarModo}
                className="font-medium text-purple-400 transition hover:text-purple-300"
              >
                {modo === "login"
                  ? "Criar conta"
                  : "Entrar"}
              </button>
            </p>

            {/* RODAPÉ */}

            <div className="mt-10 text-center">
              <p className="text-[10px] leading-5 text-white/20">
                EducaCube · Laboratório de Pesquisa
                e Práticas Pedagógicas
              </p>
            </div>
          </div>
        </section>

        {/* =================================================
            LADO DIREITO
        ================================================== */}

        <section className="relative hidden min-h-screen overflow-hidden bg-[#170033] lg:flex">
          {/* textura / iluminação */}

          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 70% 25%, rgba(124,58,237,0.28), transparent 30%), radial-gradient(circle at 25% 80%, rgba(76,29,149,0.22), transparent 35%), #170033",
            }}
          />

          {/* grid discreto */}

          <div
            className="absolute inset-0 opacity-[0.055]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize:
                "48px 48px",
            }}
          />

          {/* círculo decorativo */}

          <div className="absolute -right-32 -top-32 h-[420px] w-[420px] rounded-full border border-white/[0.06]" />

          <div className="absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full border border-white/[0.05]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            {/* MARCA */}

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-purple-200">
                <CubeIcon />
              </div>

              <span className="text-[17px] font-semibold tracking-[-0.02em] text-white/90">
                EducaCube
              </span>
            </div>

            {/* TEXTO PRINCIPAL */}

            <div className="max-w-[590px]">
              <div className="mb-7 flex items-center gap-3">
                <span className="h-px w-10 bg-purple-300/50" />

                <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-purple-200/70">
                  Educação + tecnologia
                </span>
              </div>

              <h2 className="max-w-[570px] text-[48px] font-semibold leading-[1.05] tracking-[-0.055em] text-white xl:text-[58px]">
                A inteligência educacional começa com a prática pedagógica.
              </h2>

              <p className="mt-7 max-w-[510px] text-[15px] leading-7 text-purple-100/55">
                Um ambiente pensado para quem
                pesquisa, diagnostica, planeja e
                intervém na aprendizagem — com
                tecnologia desenvolvida para a
                educação.
              </p>

              {/* PRINCÍPIO */}

              <div className="mt-12 max-w-[500px] border-l border-purple-300/25 pl-5">
                <p className="text-[15px] leading-7 text-white/65">
                  “Tecnologia para organizar o
                  trabalho pedagógico sem
                  substituir o olhar de quem
                  ensina.”
                </p>

                <p className="mt-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-purple-200/40">
                  Princípio EducaCube
                </p>
              </div>
            </div>

            {/* RODAPÉ DIREITO */}

            <div className="flex items-end justify-between gap-8">
              <div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-purple-200/35">
                  Laboratório de Pesquisa
                </p>

                <p className="mt-1 text-[11px] text-white/30">
                  Práticas pedagógicas orientadas
                  por tecnologia.
                </p>
              </div>

              <div className="hidden text-right xl:block">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/25">
                  EDUCACUBE
                </p>

                <p className="mt-1 text-[10px] text-white/20">
                  AURA AI
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

/* =========================================================
   TRATAMENTO DE ERROS DO FIREBASE
========================================================= */

function obterMensagemFirebase(
  error: unknown,
): string {
  if (
    typeof error !== "object" ||
    error === null ||
    !("code" in error)
  ) {
    return "Não foi possível concluir a operação. Tente novamente.";
  }

  const codigo = String(
    (error as { code?: unknown }).code ||
      "",
  );

  switch (codigo) {
    case "auth/invalid-email":
      return "O e-mail informado não é válido.";

    case "auth/user-not-found":
      return "Não encontramos uma conta com esse e-mail.";

    case "auth/wrong-password":
      return "A senha informada está incorreta.";

    case "auth/invalid-credential":
      return "E-mail ou senha incorretos.";

    case "auth/email-already-in-use":
      return "Este e-mail já está cadastrado.";

    case "auth/weak-password":
      return "A senha precisa ter pelo menos 6 caracteres.";

    case "auth/popup-closed-by-user":
      return "A janela do Google foi fechada antes da conclusão.";

    case "auth/popup-blocked":
      return "O navegador bloqueou a janela de login do Google.";

    case "auth/account-exists-with-different-credential":
      return "Já existe uma conta usando este e-mail com outro método de login.";

    case "auth/too-many-requests":
      return "Muitas tentativas foram realizadas. Aguarde alguns minutos e tente novamente.";

    case "auth/network-request-failed":
      return "Não foi possível conectar ao Firebase. Verifique sua internet.";

    default:
      return "Não foi possível concluir o login. Tente novamente.";
  }
}


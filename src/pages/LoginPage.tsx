import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import "../styles/login.css";

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
  if (aberto) {
    return (
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
    );
  }

  return (
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
  const [modo, setModo] =
    useState<"login" | "cadastro">("login");

  const [emailInput, setEmailInput] =
    useState("");

  const [senhaInput, setSenhaInput] =
    useState("");

  const [confirmarSenhaInput, setConfirmarSenhaInput] =
    useState("");

  const [nomeInput, setNomeInput] =
    useState("");

  const [mostrarSenha, setMostrarSenha] =
    useState(false);

  const [mostrarConfirmacao, setMostrarConfirmacao] =
    useState(false);

  const [lembrarLogin, setLembrarLogin] =
    useState(false);

  const [carregandoAuth, setCarregandoAuth] =
    useState(false);

  const [mensagemErro, setMensagemErro] =
    useState("");

  const [mensagemSucesso, setMensagemSucesso] =
    useState("");

  /* =========================================================
     RECUPERA E-MAIL SALVO
  ========================================================= */

  useEffect(() => {
    const emailSalvo =
      localStorage.getItem(
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

  async function salvarUsuarioNoFirestore(
    user: User,
  ) {
    const usuarioRef = doc(
      db,
      "usuarios",
      user.uid,
    );

    const usuarioAtual =
      await getDoc(usuarioRef);

    const dadosUsuario: Record<
      string,
      unknown
    > = {
      uid: user.uid,

      nome:
        user.displayName ||
        nomeInput ||
        "",

      email:
        user.email || "",

      foto:
        user.photoURL || "",

      ultimoLogin:
        serverTimestamp(),
    };

    if (!usuarioAtual.exists()) {
      dadosUsuario.criadoEm =
        serverTimestamp();
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

  async function registrarAcesso(
    user: User,
  ) {
    try {
      const token =
        await user.getIdToken();

      await fetch(
        "/api/registrar-acesso",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
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

  async function enviarEmailVerificacao(
    user: User,
  ) {
    try {
      const token =
        await user.getIdToken();

      await fetch(
        "/api/enviar-verificacao",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
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

  async function finalizarLogin(
    user: User,
  ) {
    await salvarUsuarioNoFirestore(
      user,
    );

    await registrarAcesso(user);

    if (
      lembrarLogin &&
      user.email
    ) {
      localStorage.setItem(
        "educacube_saved_email",
        user.email,
      );
    } else {
      localStorage.removeItem(
        "educacube_saved_email",
      );
    }

    window.location.href =
      "/aura";
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
        obterMensagemFirebase(
          error,
        ),
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
        obterMensagemFirebase(
          error,
        ),
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

      window.setTimeout(() => {
        window.location.href =
          "/aura";
      }, 900);
    } catch (error: unknown) {
      console.error(error);

      setMensagemErro(
        obterMensagemFirebase(
          error,
        ),
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
        obterMensagemFirebase(
          error,
        ),
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
    <main className="login-page">

      <div className="login-layout">

        {/* =================================================
            LADO ESQUERDO
        ================================================= */}

        <section className="login-left">

          <div className="login-left-glow" />

          <div className="login-container">

            {/* LOGO */}

            <a
              href="/"
              className="login-logo"
              aria-label="Voltar para o EducaCube"
            >
              <span className="login-logo-icon">
                <CubeIcon />
              </span>

              <span className="login-logo-name">
                Educa<span>Cube</span>
              </span>
            </a>

            {/* CABEÇALHO */}

            <div className="login-header">

              <p className="login-eyebrow">
                Área do aluno
              </p>

              <h1 className="login-title">
                {modo === "login"
                  ? "Bem-vindo de volta."
                  : "Crie sua conta."}
              </h1>

              <p className="login-description">
                {modo === "login"
                  ? "Entre para continuar seus estudos no EducaCube."
                  : "Crie seu acesso ao laboratório educacional do EducaCube."}
              </p>

            </div>

            {/* MENSAGEM DE ERRO */}

            {mensagemErro && (
              <div
                className="login-error"
                role="alert"
              >
                {mensagemErro}
              </div>
            )}

            {/* MENSAGEM DE SUCESSO */}

            {mensagemSucesso && (
              <div
                className="login-success"
                role="status"
              >
                {mensagemSucesso}
              </div>
            )}

            {/* FORMULÁRIO */}

            <form
              onSubmit={handleSubmit}
              className="login-form"
            >

              {/* NOME */}

              {modo === "cadastro" && (
                <div className="login-field">

                  <label
                    htmlFor="nome"
                    className="login-label"
                  >
                    Nome
                  </label>

                  <div className="login-input-wrapper">

                    <span className="login-input-icon">
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
                      className="login-input"
                    />

                  </div>
                </div>
              )}

              {/* E-MAIL */}

              <div className="login-field">

                <label
                  htmlFor="email"
                  className="login-label"
                >
                  E-mail
                </label>

                <div className="login-input-wrapper">

                  <span className="login-input-icon">
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
                    className="login-input"
                  />

                </div>
              </div>

              {/* SENHA */}

              <div className="login-field">

                <div className="login-field-header">

                  <label
                    htmlFor="senha"
                    className="login-label"
                  >
                    Senha
                  </label>

                  {modo === "login" && (
                    <button
                      type="button"
                      onClick={() =>
                        void recuperarSenha()
                      }
                      className="login-forgot"
                    >
                      Esqueceu a senha?
                    </button>
                  )}

                </div>

                <div className="login-input-wrapper">

                  <span className="login-input-icon">
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
                    className="login-input login-input-password"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setMostrarSenha(
                        (valor) => !valor,
                      )
                    }
                    className="login-password-toggle"
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

              {/* CONFIRMAR SENHA */}

              {modo === "cadastro" && (
                <div className="login-field">

                  <label
                    htmlFor="confirmarSenha"
                    className="login-label"
                  >
                    Confirmar senha
                  </label>

                  <div className="login-input-wrapper">

                    <span className="login-input-icon">
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
                      className="login-input login-input-password"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setMostrarConfirmacao(
                          (valor) => !valor,
                        )
                      }
                      className="login-password-toggle"
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

              {/* LEMBRAR E-MAIL */}

              {modo === "login" && (
                <label className="login-remember">

                  <input
                    type="checkbox"
                    checked={lembrarLogin}
                    onChange={(event) =>
                      setLembrarLogin(
                        event.target.checked,
                      )
                    }
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
                className="login-primary-button"
              >
                <span>
                  {carregandoAuth
                    ? "Aguarde..."
                    : modo === "login"
                      ? "Entrar no EducaCube"
                      : "Criar minha conta"}
                </span>
              </button>

            </form>

            {/* DIVISOR */}

            <div className="login-divider">

              <span className="login-divider-line" />

              <span className="login-divider-text">
                ou
              </span>

              <span className="login-divider-line" />

            </div>

            {/* GOOGLE */}

            <button
              type="button"
              onClick={() =>
                void loginComGoogle()
              }
              disabled={carregandoAuth}
              className="login-google-button"
            >
              <GoogleIcon />

              <span>
                Continuar com Google
              </span>
            </button>

            {/* TROCAR MODO */}

            <p className="login-switch">

              {modo === "login"
                ? "Ainda não possui uma conta?"
                : "Já possui uma conta?"}{" "}

              <button
                type="button"
                onClick={alternarModo}
                className="login-switch-button"
              >
                {modo === "login"
                  ? "Criar conta"
                  : "Entrar"}
              </button>

            </p>

            {/* RODAPÉ */}

            <div className="login-footer">
              EducaCube · Laboratório de Pesquisa
              e Práticas Pedagógicas
            </div>

          </div>
        </section>

        {/* =================================================
            LADO DIREITO
        ================================================= */}

        <section className="login-right">

          <div className="login-right-grid" />

          <div className="login-decoration-circle one" />

          <div className="login-decoration-circle two" />

          <div className="login-right-content">

            {/* MARCA */}

            <div className="login-right-brand">

              <span className="login-right-brand-icon">
                <CubeIcon />
              </span>

              <span className="login-right-brand-name">
                EducaCube
              </span>

            </div>

            {/* CONTEÚDO PRINCIPAL */}

            <div className="login-right-main">

              <div className="login-right-kicker">

                <span className="login-right-kicker-line" />

                <span>
                  Educação + tecnologia
                </span>

              </div>

              <h2 className="login-right-title">
                A inteligência educacional começa com a prática pedagógica.
              </h2>

              <p className="login-right-description">
                Um ambiente pensado para quem
                pesquisa, diagnostica, planeja e
                intervém na aprendizagem — com
                tecnologia desenvolvida para a
                educação.
              </p>

              {/* PRINCÍPIO */}

              <div className="login-quote">

                <p className="login-quote-text">
                  “Tecnologia para organizar o
                  trabalho pedagógico sem
                  substituir o olhar de quem
                  ensina.”
                </p>

                <p className="login-quote-label">
                  Princípio EducaCube
                </p>

              </div>

            </div>

            {/* RODAPÉ DIREITO */}

            <div className="login-right-footer">

              <div>

                <p className="login-right-footer-label">
                  Laboratório de Pesquisa
                </p>

                <p className="login-right-footer-text">
                  Práticas pedagógicas orientadas
                  por tecnologia.
                </p>

              </div>

              <div className="login-right-footer-aura">

                <strong>
                  EDUCACUBE
                </strong>

                <span>
                  AURA AI
                </span>

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
    (error as {
      code?: unknown;
    }).code || "",
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

    case "auth/operation-not-allowed":
      return "Este método de login não está habilitado no Firebase.";

    case "auth/user-disabled":
      return "Esta conta foi desativada.";

    default:
      return "Não foi possível concluir o login. Tente novamente.";
  }
}

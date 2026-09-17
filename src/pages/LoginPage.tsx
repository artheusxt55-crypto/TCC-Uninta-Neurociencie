
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

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

import type { User } from "firebase/auth";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ArrowRight,
} from "lucide-react";

import "../styles/login.css";

type ModoAutenticacao = "login" | "cadastro";

function mensagemFirebase(error: unknown): string {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  switch (code) {
    case "auth/invalid-email":
      return "Digite um endereço de e-mail válido.";

    case "auth/user-not-found":
      return "Não encontramos uma conta com esse e-mail.";

    case "auth/wrong-password":
      return "A senha informada não está correta.";

    case "auth/invalid-credential":
      return "E-mail ou senha incorretos.";

    case "auth/email-already-in-use":
      return "Esse e-mail já está cadastrado.";

    case "auth/weak-password":
      return "Escolha uma senha com pelo menos 6 caracteres.";

    case "auth/popup-closed-by-user":
      return "A janela do Google foi fechada antes da conclusão.";

    case "auth/popup-blocked":
      return "O navegador bloqueou a janela do Google.";

    case "auth/account-exists-with-different-credential":
      return "Esse e-mail já está associado a outro método de acesso.";

    case "auth/too-many-requests":
      return "Muitas tentativas. Aguarde um pouco e tente novamente.";

    case "auth/network-request-failed":
      return "Não foi possível conectar ao serviço.";

    case "auth/operation-not-allowed":
      return "Este método de acesso não está habilitado.";

    case "auth/user-disabled":
      return "Esta conta está desativada.";

    default:
      return "Não foi possível concluir o acesso. Tente novamente.";
  }
}

async function salvarUsuarioNoFirestore(
  user: User,
  nomeInformado?: string,
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
      nomeInformado ||
      "",

    email:
      user.email ||
      "",

    foto:
      user.photoURL ||
      "",

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
  } catch {
    // O login não será bloqueado.
  }
}

async function enviarVerificacao(
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
  } catch {
    // O cadastro não será bloqueado.
  }
}

export default function LoginPage() {
  const [
    modo,
    setModo,
  ] = useState<ModoAutenticacao>(
    "login",
  );

  const [
    emailInput,
    setEmailInput,
  ] = useState("");

  const [
    senhaInput,
    setSenhaInput,
  ] = useState("");

  const [
    confirmarSenhaInput,
    setConfirmarSenhaInput,
  ] = useState("");

  const [
    nomeInput,
    setNomeInput,
  ] = useState("");

  const [
    mostrarSenha,
    setMostrarSenha,
  ] = useState(false);

  const [
    mostrarConfirmacao,
    setMostrarConfirmacao,
  ] = useState(false);

  const [
    lembrarLogin,
    setLembrarLogin,
  ] = useState(false);

  const [
    carregandoAuth,
    setCarregandoAuth,
  ] = useState(false);

  const [
    mensagemErro,
    setMensagemErro,
  ] = useState("");

  const [
    mensagemSucesso,
    setMensagemSucesso,
  ] = useState("");

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

  function limparMensagens() {
    setMensagemErro("");
    setMensagemSucesso("");
  }

  function trocarModo(
    novoModo: ModoAutenticacao,
  ) {
    limparMensagens();

    setModo(novoModo);

    setSenhaInput("");
    setConfirmarSenhaInput("");
  }

  async function entrarComEmail(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    limparMensagens();

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

    try {
      if (lembrarLogin) {
        localStorage.setItem(
          "educacube_saved_email",
          emailInput.trim(),
        );
      } else {
        localStorage.removeItem(
          "educacube_saved_email",
        );
      }

      const resultado =
        await signInWithEmailAndPassword(
          auth,
          emailInput.trim(),
          senhaInput,
        );

      await salvarUsuarioNoFirestore(
        resultado.user,
      );

      await registrarAcesso(
        resultado.user,
      );

      window.location.href =
        "/aura";
    } catch (error) {
      setMensagemErro(
        mensagemFirebase(error),
      );
    } finally {
      setCarregandoAuth(false);
    }
  }

  async function criarConta(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    limparMensagens();

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
        nomeInput.trim(),
      );

      await registrarAcesso(
        resultado.user,
      );

      await enviarVerificacao(
        resultado.user,
      );

      if (lembrarLogin) {
        localStorage.setItem(
          "educacube_saved_email",
          emailInput.trim(),
        );
      }

      setMensagemSucesso(
        "Conta criada. Preparando seu acesso...",
      );

      setTimeout(() => {
        window.location.href =
          "/aura";
      }, 900);
    } catch (error) {
      setMensagemErro(
        mensagemFirebase(error),
      );
    } finally {
      setCarregandoAuth(false);
    }
  }

  async function entrarComGoogle() {
    limparMensagens();

    setCarregandoAuth(true);

    try {
      const resultado =
        await signInWithPopup(
          auth,
          googleProvider,
        );

      await salvarUsuarioNoFirestore(
        resultado.user,
      );

      await registrarAcesso(
        resultado.user,
      );

      if (
        resultado.user.email &&
        lembrarLogin
      ) {
        localStorage.setItem(
          "educacube_saved_email",
          resultado.user.email,
        );
      }

      window.location.href =
        "/aura";
    } catch (error) {
      setMensagemErro(
        mensagemFirebase(error),
      );
    } finally {
      setCarregandoAuth(false);
    }
  }

  async function recuperarSenha() {
    limparMensagens();

    if (!emailInput.trim()) {
      setMensagemErro(
        "Digite seu e-mail para receber o link de recuperação.",
      );

      return;
    }

    setCarregandoAuth(true);

    try {
      await sendPasswordResetEmail(
        auth,
        emailInput.trim(),
      );

      setMensagemSucesso(
        "Se esse e-mail estiver cadastrado, você receberá as instruções para redefinir sua senha.",
      );
    } catch (error) {
      setMensagemErro(
        mensagemFirebase(error),
      );
    } finally {
      setCarregandoAuth(false);
    }
  }

  const estaNoCadastro =
    modo === "cadastro";

  return (
    <main className="login-page">
      <div className="login-layout">

        {/* ==========================================
            LADO ESQUERDO
            ========================================== */}

        <section className="login-left">

          <div className="login-container">

            <div className="login-logo">

              <div
                className="login-logo-icon"
                aria-hidden="true"
              >
                E
              </div>

              <span className="login-logo-name">
                EducaCube
              </span>

            </div>

            <div className="login-card">

              <header className="login-header">

                <p className="login-eyebrow">
                  {estaNoCadastro
                    ? "NOVO ACESSO"
                    : "ÁREA DO ALUNO"}
                </p>

                <h1 className="login-title">
                  {estaNoCadastro
                    ? "Crie sua conta."
                    : "Bem-vindo de volta."}
                </h1>

                <p className="login-description">
                  {estaNoCadastro
                    ? "Preencha seus dados para acessar o EducaCube."
                    : "Acesse sua conta para continuar seus estudos no EducaCube."}
                </p>

              </header>

              {mensagemErro && (
                <div
                  className="login-error"
                  role="alert"
                >
                  {mensagemErro}
                </div>
              )}

              {mensagemSucesso && (
                <div
                  className="login-success"
                  role="status"
                >
                  {mensagemSucesso}
                </div>
              )}

              <form
                className="login-form"
                onSubmit={
                  estaNoCadastro
                    ? criarConta
                    : entrarComEmail
                }
              >

                {estaNoCadastro && (
                  <div className="login-field">

                    <label
                      className="login-label"
                      htmlFor="nome"
                    >
                      Nome
                    </label>

                    <div className="login-input-wrapper">

                      <input
                        id="nome"
                        className="login-input login-input-no-icon"
                        type="text"
                        autoComplete="name"
                        placeholder="Seu nome"
                        value={nomeInput}
                        onChange={(event) =>
                          setNomeInput(
                            event.target.value,
                          )
                        }
                      />

                    </div>

                  </div>
                )}

                <div className="login-field">

                  <label
                    className="login-label"
                    htmlFor="email"
                  >
                    E-mail
                  </label>

                  <div className="login-input-wrapper">

                    <Mail
                      className="login-input-icon"
                      size={17}
                      aria-hidden="true"
                    />

                    <input
                      id="email"
                      className="login-input"
                      type="email"
                      autoComplete="email"
                      placeholder="seu@email.com"
                      value={emailInput}
                      onChange={(event) =>
                        setEmailInput(
                          event.target.value,
                        )
                      }
                    />

                  </div>

                </div>

                <div className="login-field">

                  <div className="login-field-header">

                    <label
                      className="login-label"
                      htmlFor="senha"
                    >
                      Senha
                    </label>

                    {!estaNoCadastro && (
                      <button
                        type="button"
                        className="login-forgot"
                        onClick={
                          recuperarSenha
                        }
                      >
                        Esqueceu sua senha?
                      </button>
                    )}

                  </div>

                  <div className="login-input-wrapper">

                    <LockKeyhole
                      className="login-input-icon"
                      size={17}
                      aria-hidden="true"
                    />

                    <input
                      id="senha"
                      className="login-input login-input-password"
                      type={
                        mostrarSenha
                          ? "text"
                          : "password"
                      }
                      autoComplete={
                        estaNoCadastro
                          ? "new-password"
                          : "current-password"
                      }
                      placeholder="Digite sua senha"
                      value={senhaInput}
                      onChange={(event) =>
                        setSenhaInput(
                          event.target.value,
                        )
                      }
                    />

                    <button
                      type="button"
                      className="login-password-toggle"
                      aria-label={
                        mostrarSenha
                          ? "Ocultar senha"
                          : "Mostrar senha"
                      }
                      onClick={() =>
                        setMostrarSenha(
                          (valor) =>
                            !valor,
                        )
                      }
                    >
                      {mostrarSenha ? (
                        <EyeOff size={17} />
                      ) : (
                        <Eye size={17} />
                      )}
                    </button>

                  </div>

                </div>

                {estaNoCadastro && (
                  <div className="login-field">

                    <label
                      className="login-label"
                      htmlFor="confirmar-senha"
                    >
                      Confirmar senha
                    </label>

                    <div className="login-input-wrapper">

                      <LockKeyhole
                        className="login-input-icon"
                        size={17}
                        aria-hidden="true"
                      />

                      <input
                        id="confirmar-senha"
                        className="login-input login-input-password"
                        type={
                          mostrarConfirmacao
                            ? "text"
                            : "password"
                        }
                        autoComplete="new-password"
                        placeholder="Digite a senha novamente"
                        value={
                          confirmarSenhaInput
                        }
                        onChange={(event) =>
                          setConfirmarSenhaInput(
                            event.target.value,
                          )
                        }
                      />

                      <button
                        type="button"
                        className="login-password-toggle"
                        aria-label={
                          mostrarConfirmacao
                            ? "Ocultar confirmação"
                            : "Mostrar confirmação"
                        }
                        onClick={() =>
                          setMostrarConfirmacao(
                            (valor) =>
                              !valor,
                          )
                        }
                      >
                        {mostrarConfirmacao ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>

                    </div>

                  </div>
                )}

                {!estaNoCadastro && (
                  <div className="login-options">

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
                        Lembrar de mim
                      </span>

                    </label>

                  </div>
                )}

                <button
                  type="submit"
                  className="login-primary-button"
                  disabled={carregandoAuth}
                >
                  <span>
                    {carregandoAuth
                      ? "Aguarde..."
                      : estaNoCadastro
                        ? "Criar conta"
                        : "Entrar"}
                  </span>

                  {!carregandoAuth && (
                    <ArrowRight size={16} />
                  )}
                </button>

              </form>

              <div className="login-divider">

                <span />

                <small>
                  ou
                </small>

                <span />

              </div>

              <button
                type="button"
                className="login-google-button"
                onClick={
                  entrarComGoogle
                }
                disabled={carregandoAuth}
              >

                <svg
                  className="login-google-icon"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="#4285F4"
                    d="M21.35 12.27c0-.72-.06-1.41-.18-2.07H12v3.92h5.24a4.48 4.48 0 0 1-1.94 2.94v2.45h3.14c1.84-1.69 2.91-4.18 2.91-7.24Z"
                  />

                  <path
                    fill="#34A853"
                    d="M12 21.5c2.63 0 4.84-.87 6.45-2.36l-3.14-2.45c-.87.58-1.98.92-3.31.92-2.54 0-4.69-1.72-5.46-4.03H3.3v2.53A9.74 9.74 0 0 0 12 21.5Z"
                  />

                  <path
                    fill="#FBBC05"
                    d="M6.54 13.58A5.86 5.86 0 0 1 6.23 12c0-.55.1-1.08.31-1.58V7.89H3.3A9.5 9.5 0 0 0 2.25 12c0 1.53.37 2.98 1.05 4.11l3.24-2.53Z"
                  />

                  <path
                    fill="#EA4335"
                    d="M12 6.39c1.43 0 2.71.49 3.72 1.46l2.79-2.79C16.84 3.45 14.63 2.5 12 2.5a9.74 9.74 0 0 0-8.7 5.39l3.24 2.53c.77-2.31 2.92-4.03 5.46-4.03Z"
                  />
                </svg>

                <span>
                  Continuar com Google
                </span>

              </button>

              <p className="login-switch">

                {estaNoCadastro
                  ? "Já tem uma conta?"
                  : "Ainda não tem uma conta?"}

                <button
                  type="button"
                  className="login-switch-button"
                  onClick={() =>
                    trocarModo(
                      estaNoCadastro
                        ? "login"
                        : "cadastro",
                    )
                  }
                >
                  {estaNoCadastro
                    ? "Entrar"
                    : "Criar conta"}
                </button>

              </p>

            </div>

            <p className="login-footer">
              EducaCube · Área do Aluno
            </p>

          </div>

        </section>

        {/* ==========================================
            LADO DIREITO
            ========================================== */}

        <section className="login-right">

          <div className="login-right-content">

            <div className="login-right-brand">

              <div
                className="login-right-brand-icon"
                aria-hidden="true"
              >
                E
              </div>

              <span>
                EducaCube
              </span>

            </div>

            <div className="login-right-main">

              <p className="login-right-kicker">
                ÁREA DO ALUNO
              </p>

              <h2 className="login-right-title">
                Estudos, materiais e apoio em um só lugar.
              </h2>

              <p className="login-right-description">
                Organize seus estudos, consulte seus
                materiais e use a Aura quando precisar
                de ajuda para entender um conteúdo.
              </p>

              <div className="login-right-detail">

                <span
                  className="login-right-detail-line"
                />

                <p>
                  O EducaCube reúne as ferramentas
                  que fazem parte da rotina de estudo
                  em um único ambiente.
                </p>

              </div>

            </div>

            <div className="login-right-footer">

              <span>
                EDUCACUBE
              </span>

              <p>
                Seu ambiente de estudos.
              </p>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}


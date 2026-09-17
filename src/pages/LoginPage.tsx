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


type ModoAutenticacao =
  | "login"
  | "cadastro";


function mensagemFirebase(
  error: unknown,
): string {
  const code =
    typeof error === "object" &&
    error !== null &&
    "code" in error
      ? String(
          (error as { code: unknown }).code,
        )
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
      return "O navegador bloqueou a janela de login do Google.";

    case "auth/account-exists-with-different-credential":
      return "Esse e-mail já está associado a outro método de acesso.";

    case "auth/too-many-requests":
      return "Muitas tentativas foram feitas. Aguarde um pouco e tente novamente.";

    case "auth/network-request-failed":
      return "Não foi possível conectar ao serviço. Verifique sua internet.";

    case "auth/operation-not-allowed":
      return "Este método de acesso ainda não está habilitado.";

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
  const usuarioRef =
    doc(
      db,
      "usuarios",
      user.uid,
    );

  const usuarioAtual =
    await getDoc(usuarioRef);

  const dadosUsuario:
    Record<string, unknown> = {
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
    /*
      O login não deve ser bloqueado
      caso o registro complementar
      de acesso falhe.
    */
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
    /*
      O cadastro continua mesmo se
      o envio complementar falhar.
    */
  }
}


export default function LoginPage() {
  const [
    modo,
    setModo,
  ] =
    useState<ModoAutenticacao>(
      "login",
    );

  const [
    emailInput,
    setEmailInput,
  ] =
    useState("");

  const [
    senhaInput,
    setSenhaInput,
  ] =
    useState("");

  const [
    confirmarSenhaInput,
    setConfirmarSenhaInput,
  ] =
    useState("");

  const [
    nomeInput,
    setNomeInput,
  ] =
    useState("");

  const [
    mostrarSenha,
    setMostrarSenha,
  ] =
    useState(false);

  const [
    mostrarConfirmacao,
    setMostrarConfirmacao,
  ] =
    useState(false);

  const [
    lembrarLogin,
    setLembrarLogin,
  ] =
    useState(false);

  const [
    carregandoAuth,
    setCarregandoAuth,
  ] =
    useState(false);

  const [
    mensagemErro,
    setMensagemErro,
  ] =
    useState("");

  const [
    mensagemSucesso,
    setMensagemSucesso,
  ] =
    useState("");


  useEffect(() => {
    const emailSalvo =
      localStorage.getItem(
        "educacube_saved_email",
      );

    if (emailSalvo) {
      setEmailInput(
        emailSalvo,
      );

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

      const user =
        resultado.user;

      await salvarUsuarioNoFirestore(
        user,
      );

      await registrarAcesso(
        user,
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

      const user =
        resultado.user;

      await updateProfile(
        user,
        {
          displayName:
            nomeInput.trim(),
        },
      );

      await salvarUsuarioNoFirestore(
        user,
        nomeInput.trim(),
      );

      await registrarAcesso(
        user,
      );

      await enviarVerificacao(
        user,
      );

      if (lembrarLogin) {
        localStorage.setItem(
          "educacube_saved_email",
          emailInput.trim(),
        );
      }

      setMensagemSucesso(
        "Conta criada. Estamos preparando seu acesso.",
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

      const user =
        resultado.user;

      await salvarUsuarioNoFirestore(
        user,
      );

      await registrarAcesso(
        user,
      );

      if (user.email && lembrarLogin) {
        localStorage.setItem(
          "educacube_saved_email",
          user.email,
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

        {/* =================================================
            LADO ESQUERDO
            ================================================= */}

        <section className="login-left">

          <div
            className="login-left-glow"
            aria-hidden="true"
          />

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

                    <div
                      className="login-input-icon"
                      aria-hidden="true"
                    >
                      <Mail size={17} />
                    </div>

                    <input
                      id="nome"
                      className="login-input"
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

                  <div
                    className="login-input-icon"
                    aria-hidden="true"
                  >
                    <Mail size={17} />
                  </div>

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
                    style={{
                      marginBottom: 0,
                    }}
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

                  <div
                    className="login-input-icon"
                    aria-hidden="true"
                  >
                    <LockKeyhole size={17} />
                  </div>

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

                    <div
                      className="login-input-icon"
                      aria-hidden="true"
                    >
                      <LockKeyhole size={17} />
                    </div>

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
                          ? "Ocultar confirmação da senha"
                          : "Mostrar confirmação da senha"
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
                <div
                  style={{
                    marginBottom: "22px",
                  }}
                >
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
                {carregandoAuth
                  ? "Aguarde..."
                  : estaNoCadastro
                    ? "Criar conta"
                    : "Entrar"}

                {!carregandoAuth && (
                  <ArrowRight
                    size={16}
                    style={{
                      marginLeft: 7,
                      verticalAlign:
                        "middle",
                    }}
                  />
                )}
              </button>

            </form>


            <div className="login-divider">

              <span
                className="login-divider-line"
              />

              <span
                className="login-divider-text"
              >
                ou
              </span>

              <span
                className="login-divider-line"
              />

            </div>


            <button
              type="button"
              className="login-google-button"
              onClick={
                entrarComGoogle
              }
              disabled={carregandoAuth}
            >
              <strong
                style={{
                  fontSize: "15px",
                }}
              >
                G
              </strong>

              Continuar com Google
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


            <p className="login-footer">
              EducaCube · Área do Aluno
            </p>

          </div>
        </section>


        {/* =================================================
            LADO DIREITO
            ================================================= */}

        <section className="login-right">

          <div
            className="login-right-grid"
            aria-hidden="true"
          />

          <div
            className="login-decoration-circle one"
            aria-hidden="true"
          />

          <div
            className="login-decoration-circle two"
            aria-hidden="true"
          />


          <div className="login-right-content">

            <div className="login-right-brand">

              <div
                className="login-right-brand-icon"
                aria-hidden="true"
              >
                E
              </div>

              <span className="login-right-brand-name">
                EducaCube
              </span>

            </div>


            <div className="login-right-main">

              <div className="login-right-kicker">

                <span className="login-right-kicker-line" />

                Área do aluno

              </div>


              <h2 className="login-right-title">
                Estudos, materiais e apoio em um só lugar.
              </h2>


              <p className="login-right-description">
                Organize seus estudos, consulte seus materiais
                e use a Aura quando precisar de ajuda para
                entender um conteúdo.
              </p>


              <div className="login-quote">

                <p className="login-quote-text">
                  O EducaCube reúne as ferramentas que fazem
                  parte da rotina de estudo em um único ambiente.
                </p>

                <span className="login-quote-label">
                  EducaCube
                </span>

              </div>


              <div className="login-right-footer">

                <span className="login-right-footer-label">
                  Seu ambiente de estudos
                </span>

                <span className="login-right-footer-text">
                  Materiais, estudos e{" "}
                  <span className="login-right-footer-aura">
                    Aura AI
                  </span>
                  .
                </span>

              </div>

            </div>

          </div>

        </section>

      </div>
    </main>
  );
}

import {
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";

import {
  ArrowUp,
  Bot,
  Copy,
  Menu,
  Mic,
  MicOff,
  Plus,
  Sparkles,
  Volume2,
  VolumeX,
} from "lucide-react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import NeuralOrb from "../components/NeuralOrb";
import ChatSidebar from "../components/ChatSidebar";
import { useAudioAnalyzer } from "../hooks/useAudioAnalyzer";

import {
  analisarComGroq,
  buscarDoRedis,
  falarTexto,
  pararFala,
  salvarNoRedis,
} from "../lib/aura-engine";

import "../styles/aura-ai.css";

interface AuraMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface AuraConversation {
  id: string;
  title: string;
  messages: AuraMessage[];
  createdAt: Date;
  updatedAt: Date;
}

function generateId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}`;
}

function createConversation(): AuraConversation {
  const now = new Date();

  return {
    id: generateId(),
    title: "Nova conversa",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

function normalizeDate(value: unknown): Date {
  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    const date = new Date(value);

    if (!Number.isNaN(date.getTime())) {
      return date;
    }
  }

  return new Date();
}

export default function AuraAI() {
  const [userId] = useState(() => {
    const existingUserId =
      localStorage.getItem("aura_user_id");

    if (existingUserId) {
      return existingUserId;
    }

    const newUserId = `guest-${generateId()}`;

    localStorage.setItem(
      "aura_user_id",
      newUserId
    );

    return newUserId;
  });

  const [conversations, setConversations] =
    useState<AuraConversation[]>([]);

  const [
    activeConversationId,
    setActiveConversationId,
  ] = useState<string>("");

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [voiceEnabled, setVoiceEnabled] =
    useState(false);

  const [copiedId, setCopiedId] =
    useState<string | null>(null);

  const {
    isActive,
    isProcessing,
    volume,
    frequency,
    start,
    stop,
  } = useAudioAnalyzer();

  /*
   * ============================================================
   * HISTÓRICO
   * ============================================================
   */

  useEffect(() => {
    const saved =
      buscarDoRedis<unknown>(userId);

    if (
      Array.isArray(saved) &&
      saved.length > 0
    ) {
      const normalized: AuraConversation[] =
        saved
          .map((rawConversation) => {
            if (
              !rawConversation ||
              typeof rawConversation !== "object"
            ) {
              return null;
            }

            const conversation =
              rawConversation as Record<
                string,
                unknown
              >;

            const rawMessages =
              Array.isArray(
                conversation.messages
              )
                ? conversation.messages
                : [];

            const messages: AuraMessage[] =
              rawMessages
                .map((rawMessage) => {
                  if (
                    !rawMessage ||
                    typeof rawMessage !== "object"
                  ) {
                    return null;
                  }

                  const message =
                    rawMessage as Record<
                      string,
                      unknown
                    >;

                  return {
                    id:
                      typeof message.id ===
                      "string"
                        ? message.id
                        : generateId(),

                    role:
                      message.role ===
                      "assistant"
                        ? "assistant"
                        : "user",

                    content:
                      typeof message.content ===
                      "string"
                        ? message.content
                        : "",

                    timestamp:
                      normalizeDate(
                        message.timestamp
                      ),
                  };
                })
                .filter(
                  (
                    message
                  ): message is AuraMessage =>
                    message !== null
                );

            return {
              id:
                typeof conversation.id ===
                "string"
                  ? conversation.id
                  : generateId(),

              title:
                typeof conversation.title ===
                "string"
                  ? conversation.title
                  : "Nova conversa",

              messages,

              createdAt:
                normalizeDate(
                  conversation.createdAt
                ),

              updatedAt:
                normalizeDate(
                  conversation.updatedAt
                ),
            };
          })
          .filter(
            (
              conversation
            ): conversation is AuraConversation =>
              conversation !== null
          );

      if (normalized.length > 0) {
        setConversations(normalized);

        setActiveConversationId(
          normalized[0].id
        );

        return;
      }
    }

    const initialConversation =
      createConversation();

    setConversations([
      initialConversation,
    ]);

    setActiveConversationId(
      initialConversation.id
    );
  }, [userId]);

  /*
   * ============================================================
   * SALVAR HISTÓRICO
   * ============================================================
   */

  useEffect(() => {
    if (conversations.length === 0) {
      return;
    }

    salvarNoRedis(
      userId,
      conversations
    );
  }, [
    conversations,
    userId,
  ]);

  /*
   * ============================================================
   * LIMPEZA
   * ============================================================
   */

  useEffect(() => {
    return () => {
      pararFala();
      stop();
    };
  }, [stop]);

  /*
   * ============================================================
   * CONVERSA ATUAL
   * ============================================================
   */

  const activeConversation =
    useMemo(() => {
      return conversations.find(
        (conversation) =>
          conversation.id ===
          activeConversationId
      );
    }, [
      conversations,
      activeConversationId,
    ]);

  /*
   * ============================================================
   * NOVA CONVERSA
   * ============================================================
   */

  function handleNewConversation() {
    const newConversation =
      createConversation();

    setConversations((current) => [
      newConversation,
      ...current,
    ]);

    setActiveConversationId(
      newConversation.id
    );

    setInput("");
    setSidebarOpen(false);

    pararFala();
  }

  /*
   * ============================================================
   * ATUALIZAR CONVERSA
   * ============================================================
   */

  function updateConversation(
    conversationId: string,
    updater: (
      conversation: AuraConversation
    ) => AuraConversation
  ) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id ===
        conversationId
          ? updater(conversation)
          : conversation
      )
    );
  }

  /*
   * ============================================================
   * ENVIAR
   * ============================================================
   */

  async function handleSend() {
    const text = input.trim();

    if (!text || loading) {
      return;
    }

    let conversation =
      activeConversation;

    if (!conversation) {
      conversation =
        createConversation();

      setConversations((current) => [
        conversation!,
        ...current,
      ]);

      setActiveConversationId(
        conversation.id
      );
    }

    const userMessage: AuraMessage = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const messagesBeforeAI: AuraMessage[] =
      [
        ...conversation.messages,
        userMessage,
      ];

    updateConversation(
      conversation.id,
      (current) => ({
        ...current,

        title:
          current.messages.length === 0
            ? text.length > 50
              ? `${text.substring(0, 50)}...`
              : text
            : current.title,

        messages: messagesBeforeAI,

        updatedAt: new Date(),
      })
    );

    setInput("");
    setLoading(true);

    try {
      const contexto =
        messagesBeforeAI
          .slice(-12)
          .map((message) => {
            const speaker =
              message.role === "user"
                ? "Usuário"
                : "AURA";

            return `${speaker}: ${message.content}`;
          });

      const result =
        await analisarComGroq(
          text,
          contexto
        );

      const responseText =
        result?.resposta ||
        "Não consegui gerar uma resposta neste momento.";

      const assistantMessage: AuraMessage =
        {
          id: generateId(),
          role: "assistant",
          content: responseText,
          timestamp: new Date(),
        };

      updateConversation(
        conversation.id,
        (current) => ({
          ...current,

          messages: [
            ...current.messages,
            assistantMessage,
          ],

          updatedAt: new Date(),
        })
      );

      if (voiceEnabled) {
        falarTexto(responseText);
      }
    } catch (error) {
      console.error(
        "Erro na comunicação com a AURA:",
        error
      );

      const errorMessage: AuraMessage =
        {
          id: generateId(),
          role: "assistant",
          content:
            "⚠️ Não consegui conectar ao sistema de inteligência da AURA. Verifique a API e tente novamente.",
          timestamp: new Date(),
        };

      updateConversation(
        conversation.id,
        (current) => ({
          ...current,

          messages: [
            ...current.messages,
            errorMessage,
          ],

          updatedAt: new Date(),
        })
      );
    } finally {
      setLoading(false);
    }
  }

  /*
   * ============================================================
   * ENTER
   * ============================================================
   */

  function handleInputKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      void handleSend();
    }
  }

  /*
   * ============================================================
   * COPIAR
   * ============================================================
   */

  async function handleCopy(
    message: AuraMessage
  ) {
    try {
      await navigator.clipboard.writeText(
        message.content
      );

      setCopiedId(message.id);

      window.setTimeout(() => {
        setCopiedId(null);
      }, 1500);
    } catch (error) {
      console.error(
        "Erro ao copiar:",
        error
      );
    }
  }

  /*
   * ============================================================
   * VOZ
   * ============================================================
   */

  function handleVoiceToggle() {
    if (voiceEnabled) {
      pararFala();
      setVoiceEnabled(false);
      return;
    }

    setVoiceEnabled(true);
  }

  /*
   * ============================================================
   * MICROFONE
   * ============================================================
   */

  async function handleMicrophone() {
    try {
      if (isActive) {
        stop();
        return;
      }

      await start();
    } catch (error) {
      console.error(
        "Erro ao acessar microfone:",
        error
      );
    }
  }

  /*
   * ============================================================
   * SIDEBAR
   * ============================================================
   */

  const sidebarConversations =
    conversations.map(
      (conversation) => ({
        id: conversation.id,
        title: conversation.title,
        createdAt:
          conversation.createdAt,
        updatedAt:
          conversation.updatedAt,
        messages:
          conversation.messages,
      })
    );

  /*
   * ============================================================
   * INTERFACE
   * ============================================================
   */

  return (
    <div className="aura-page">
      <div className="aura-layout">

        {/* SIDEBAR DESKTOP */}

        <aside className="aura-sidebar-desktop">
          <ChatSidebar
            conversations={
              sidebarConversations
            }
            activeConvId={
              activeConversationId
            }
            onSelect={(id: string) => {
              setActiveConversationId(id);
            }}
            onNew={
              handleNewConversation
            }
            isOpen={true}
            onClose={() => {
              setSidebarOpen(false);
            }}
          />
        </aside>

        {/* SIDEBAR MOBILE */}

        {sidebarOpen && (
          <div className="aura-mobile-overlay">

            <button
              type="button"
              aria-label="Fechar menu"
              className="aura-mobile-backdrop"
              onClick={() =>
                setSidebarOpen(false)
              }
            />

            <div className="aura-mobile-sidebar">
              <ChatSidebar
                conversations={
                  sidebarConversations
                }
                activeConvId={
                  activeConversationId
                }
                onSelect={(id: string) => {
                  setActiveConversationId(id);
                  setSidebarOpen(false);
                }}
                onNew={
                  handleNewConversation
                }
                isOpen={true}
                onClose={() => {
                  setSidebarOpen(false);
                }}
              />
            </div>
          </div>
        )}

        {/* MAIN */}

        <main className="aura-main">

          {/* HEADER */}

          <header className="aura-header">

            <div className="aura-header-left">

              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="aura-menu-button"
                aria-label="Abrir conversas"
              >
                <Menu size={21} />
              </button>

              <div className="aura-brand">

                <div className="aura-brand-icon">
                  <Bot size={20} />
                </div>

                <div className="aura-brand-info">

                  <div className="aura-brand-title">
                    <h1>AURA AI</h1>

                    <Sparkles size={13} />
                  </div>

                  <div className="aura-status">
                    <span className="aura-status-dot" />

                    <span>
                      Sistema neural online
                    </span>
                  </div>

                </div>
              </div>
            </div>

            <div className="aura-header-actions">

              <button
                type="button"
                onClick={
                  handleVoiceToggle
                }
                className={`aura-icon-button ${
                  voiceEnabled
                    ? "aura-icon-button-active"
                    : ""
                }`}
                title={
                  voiceEnabled
                    ? "Desativar voz"
                    : "Ativar voz"
                }
                aria-label={
                  voiceEnabled
                    ? "Desativar voz"
                    : "Ativar voz"
                }
              >
                {voiceEnabled ? (
                  <Volume2 size={18} />
                ) : (
                  <VolumeX size={18} />
                )}
              </button>

              <button
                type="button"
                onClick={
                  handleNewConversation
                }
                className="aura-new-chat-button"
              >
                <Plus size={16} />

                <span>
                  Nova conversa
                </span>
              </button>

            </div>
          </header>

          {/* CHAT */}

          <section className="aura-chat-section">

            <div className="aura-background-glow aura-glow-one" />
            <div className="aura-background-glow aura-glow-two" />

            <div className="aura-chat-container">

              {/* WELCOME */}

              {(!activeConversation ||
                activeConversation.messages
                  .length === 0) && (

                <div className="aura-welcome">

                  <div className="aura-welcome-grid" />

                  <div className="aura-orb-wrapper">

                    <NeuralOrb
                      size="xl"
                      volume={volume}
                      frequency={frequency}
                      isActive={
                        isActive ||
                        loading
                      }
                      isProcessing={
                        isProcessing
                      }
                    />

                  </div>

                  <div className="aura-welcome-text">

                    <span className="aura-welcome-label">
                      INTELLIGÊNCIA EDUCACIONAL
                    </span>

                    <h2>
                      Conhecimento começa
                      com uma pergunta.
                    </h2>

                    <p>
                      Converse com a AURA sobre
                      Pedagogia, Educação,
                      aprendizagem, metodologias
                      de ensino, pesquisas e
                      conhecimento científico.
                    </p>

                  </div>

                </div>
              )}

              {/* MENSAGENS */}

              {activeConversation &&
                activeConversation.messages
                  .length > 0 && (

                <div className="aura-messages-scroll">

                  <div className="aura-messages">

                    {activeConversation.messages.map(
                      (message) => (

                        <div
                          key={message.id}
                          className={`aura-message-row ${
                            message.role === "user"
                              ? "aura-message-row-user"
                              : "aura-message-row-assistant"
                          }`}
                        >

                          <div
                            className={`aura-message-bubble ${
                              message.role === "user"
                                ? "aura-user-message"
                                : "aura-assistant-message"
                            }`}
                          >

                            {message.role ===
                            "assistant" ? (

                              <div className="aura-assistant-content">

                                <div className="aura-message-avatar">
                                  <Bot size={15} />
                                </div>

                                <div className="aura-message-body">

                                  <div className="aura-message-author">
                                    AURA
                                  </div>

                                  <div className="aura-markdown">

                                    <ReactMarkdown
                                      remarkPlugins={[
                                        remarkGfm,
                                      ]}
                                      components={{
                                        a: ({
                                          href,
                                          children,
                                        }) => (
                                          <a
                                            href={href}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                          >
                                            {children}
                                          </a>
                                        ),
                                      }}
                                    >
                                      {
                                        message.content
                                      }
                                    </ReactMarkdown>

                                  </div>

                                  <div className="aura-message-actions">

                                    <button
                                      type="button"
                                      onClick={() =>
                                        void handleCopy(
                                          message
                                        )
                                      }
                                      className="aura-message-action"
                                    >
                                      <Copy size={13} />

                                      <span>
                                        {copiedId ===
                                        message.id
                                          ? "Copiado"
                                          : "Copiar"}
                                      </span>
                                    </button>

                                    {voiceEnabled && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          falarTexto(
                                            message.content
                                          )
                                        }
                                        className="aura-message-action aura-speak-button"
                                        title="Ouvir resposta"
                                        aria-label="Ouvir resposta"
                                      >
                                        <Volume2 size={14} />
                                      </button>
                                    )}

                                  </div>

                                </div>
                              </div>

                            ) : (

                              <p className="aura-user-text">
                                {message.content}
                              </p>

                            )}

                          </div>
                        </div>
                      )
                    )}

                    {loading && (

                      <div className="aura-message-row aura-message-row-assistant">

                        <div className="aura-processing">

                          <div className="aura-processing-orb">
                            <span />
                            <span />
                            <span />
                          </div>

                          <div>
                            <strong>
                              AURA está processando
                            </strong>

                            <span>
                              Organizando conhecimento...
                            </span>
                          </div>

                        </div>

                      </div>
                    )}

                  </div>
                </div>
              )}

              {/* INPUT */}

              <div className="aura-input-area">

                <div className="aura-input-wrapper">

                  <textarea
                    value={input}
                    onChange={(event) =>
                      setInput(
                        event.target.value
                      )
                    }
                    onKeyDown={
                      handleInputKeyDown
                    }
                    placeholder="Pergunte algo para a AURA..."
                    rows={1}
                    disabled={loading}
                    className="aura-textarea"
                  />

                  <div className="aura-microphone-area">

                    <button
                      type="button"
                      onClick={
                        handleMicrophone
                      }
                      className={`aura-microphone-button ${
                        isActive
                          ? "aura-microphone-active"
                          : ""
                      }`}
                      title={
                        isActive
                          ? "Desativar microfone"
                          : "Ativar microfone"
                      }
                      aria-label={
                        isActive
                          ? "Desativar microfone"
                          : "Ativar microfone"
                      }
                    >
                      {isActive ? (
                        <MicOff size={18} />
                      ) : (
                        <Mic size={18} />
                      )}
                    </button>

                    {isActive && (
                      <span className="aura-microphone-status">
                        Ouvindo
                      </span>
                    )}

                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      void handleSend()
                    }
                    disabled={
                      !input.trim() ||
                      loading
                    }
                    className="aura-send-button"
                    title="Enviar mensagem"
                    aria-label="Enviar mensagem"
                  >
                    <ArrowUp size={18} />
                  </button>

                </div>

                <p className="aura-disclaimer">
                  AURA AI pode cometer erros.
                  Verifique informações
                  importantes.
                </p>

              </div>

            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

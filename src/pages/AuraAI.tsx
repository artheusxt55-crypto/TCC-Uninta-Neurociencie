import {
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
} from "react";

import {
  ArrowUp,
  Copy,
  Menu,
  Mic,
  MicOff,
  Plus,
  Volume2,
  VolumeX,
  Waypoints,
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

function generateId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;
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

function normalizeDate(
  value: unknown,
  fallback = new Date()
): Date {
  if (value instanceof Date) {
    return value;
  }

  if (
    typeof value === "string" ||
    typeof value === "number"
  ) {
    const parsed = new Date(value);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return fallback;
}

function formatMessageTime(date: Date) {
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuraAI() {
  const [conversations, setConversations] =
    useState<AuraConversation[]>([]);

  const [activeConvId, setActiveConvId] =
    useState("");

  const [input, setInput] = useState("");

  const [loading, setLoading] = useState(false);

  const [voiceEnabled, setVoiceEnabled] =
    useState(false);

  const [copiedId, setCopiedId] = useState<
    string | null
  >(null);

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [historyLoaded, setHistoryLoaded] =
    useState(false);

  const {
    isActive,
    isProcessing,
    volume,
    frequency,
    start,
    stop,
  } = useAudioAnalyzer();

  const [userId] = useState(() => {
    const existing = localStorage.getItem(
      "aura_user_id"
    );

    if (existing) {
      return existing;
    }

    const guestId = `guest-${generateId()}`;

    localStorage.setItem(
      "aura_user_id",
      guestId
    );

    return guestId;
  });

  /*
   * =====================================================
   * HISTÓRICO
   * =====================================================
   */

  useEffect(() => {
    let mounted = true;

    async function carregarHistorico() {
      try {
        const saved =
          await buscarDoRedis<unknown>(userId);

        if (!mounted) return;

        if (!Array.isArray(saved) || saved.length === 0) {
          const initial = createConversation();

          setConversations([initial]);
          setActiveConvId(initial.id);

          return;
        }

        const normalized: AuraConversation[] =
          saved
            .filter(
              (item): item is Record<string, unknown> =>
                typeof item === "object" &&
                item !== null
            )
            .map((item) => {
              const now = new Date();

              const rawMessages = Array.isArray(
                item.messages
              )
                ? item.messages
                : [];

              const messages: AuraMessage[] =
                rawMessages
                  .filter(
                    (
                      message
                    ): message is Record<
                      string,
                      unknown
                    > =>
                      typeof message === "object" &&
                      message !== null
                  )
                  .map((message) => ({
                    id:
                      typeof message.id === "string"
                        ? message.id
                        : generateId(),

                    role:
                      message.role === "user"
                        ? "user"
                        : "assistant",

                    content:
                      typeof message.content ===
                      "string"
                        ? message.content
                        : "",

                    timestamp: normalizeDate(
                      message.timestamp,
                      now
                    ),
                  }));

              return {
                id:
                  typeof item.id === "string"
                    ? item.id
                    : generateId(),

                title:
                  typeof item.title === "string" &&
                  item.title.trim()
                    ? item.title
                    : "Nova conversa",

                messages,

                createdAt: normalizeDate(
                  item.createdAt,
                  now
                ),

                updatedAt: normalizeDate(
                  item.updatedAt,
                  now
                ),
              };
            });

        if (normalized.length === 0) {
          const initial = createConversation();

          setConversations([initial]);
          setActiveConvId(initial.id);

          return;
        }

        setConversations(normalized);
        setActiveConvId(normalized[0].id);
      } catch (error) {
        console.error(
          "Erro ao carregar histórico da AURA:",
          error
        );

        if (!mounted) return;

        const initial = createConversation();

        setConversations([initial]);
        setActiveConvId(initial.id);
      } finally {
        if (mounted) {
          setHistoryLoaded(true);
        }
      }
    }

    carregarHistorico();

    return () => {
      mounted = false;
    };
  }, [userId]);

  /*
   * =====================================================
   * SALVAR HISTÓRICO
   * =====================================================
   */

  useEffect(() => {
    if (!historyLoaded) return;
    if (conversations.length === 0) return;

    salvarNoRedis(userId, conversations).catch(
      (error) => {
        console.error(
          "Erro ao salvar histórico da AURA:",
          error
        );
      }
    );
  }, [
    conversations,
    historyLoaded,
    userId,
  ]);

  /*
   * =====================================================
   * CLEANUP
   * =====================================================
   */

  useEffect(() => {
    return () => {
      pararFala();
      stop();
    };
  }, [stop]);

  /*
   * =====================================================
   * CONVERSA ATIVA
   * =====================================================
   */

  const activeConversation = useMemo(() => {
    return (
      conversations.find(
        (conversation) =>
          conversation.id === activeConvId
      ) ?? null
    );
  }, [
    conversations,
    activeConvId,
  ]);

  /*
   * =====================================================
   * ATUALIZAR CONVERSA
   * =====================================================
   */

  function updateConversation(
    conversationId: string,
    updater: (
      conversation: AuraConversation
    ) => AuraConversation
  ) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? updater(conversation)
          : conversation
      )
    );
  }

  /*
   * =====================================================
   * NOVA CONVERSA
   * =====================================================
   */

  function handleNewConversation() {
    pararFala();

    const conversation =
      createConversation();

    setConversations((current) => [
      conversation,
      ...current,
    ]);

    setActiveConvId(conversation.id);

    setInput("");
    setSidebarOpen(false);
  }

  /*
   * =====================================================
   * ENVIAR MENSAGEM
   * =====================================================
   */

  async function handleSend() {
    const text = input.trim();

    if (!text || loading) return;

    let conversationId = activeConvId;

    if (!conversationId) {
      const newConversation =
        createConversation();

      conversationId = newConversation.id;

      setConversations((current) => [
        newConversation,
        ...current,
      ]);

      setActiveConvId(conversationId);
    }

    const userMessage: AuraMessage = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    const currentConversation =
      conversations.find(
        (conversation) =>
          conversation.id === conversationId
      );

    const previousMessages =
      currentConversation?.messages ?? [];

    const contextMessages = [
      ...previousMessages,
      userMessage,
    ].slice(-12);

    const contexto = contextMessages.map(
      (message) =>
        `${
          message.role === "user"
            ? "Usuário"
            : "AURA"
        }: ${message.content}`
    );

    updateConversation(
      conversationId,
      (conversation) => ({
        ...conversation,

        title:
          conversation.messages.length === 0
            ? text.length > 50
              ? `${text.slice(0, 50)}...`
              : text
            : conversation.title,

        messages: [
          ...conversation.messages,
          userMessage,
        ],

        updatedAt: new Date(),
      })
    );

    setInput("");
    setLoading(true);

    pararFala();

    try {
      const result = await analisarComGroq(
        text,
        contexto
      );

      const responseText =
        result?.resposta?.trim() ||
        "Não consegui formular uma resposta agora.";

      const assistantMessage: AuraMessage = {
        id: generateId(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };

      updateConversation(
        conversationId,
        (conversation) => ({
          ...conversation,

          messages: [
            ...conversation.messages,
            assistantMessage,
          ],

          updatedAt: new Date(),
        })
      );

      if (voiceEnabled) {
        await falarTexto(responseText);
      }
    } catch (error) {
      console.error(
        "Erro na AURA:",
        error
      );

      const errorMessage: AuraMessage = {
        id: generateId(),
        role: "assistant",
        content:
          "Não consegui conectar ao sistema de inteligência da AURA. Verifique a API e tente novamente.",
        timestamp: new Date(),
      };

      updateConversation(
        conversationId,
        (conversation) => ({
          ...conversation,

          messages: [
            ...conversation.messages,
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
   * =====================================================
   * ENTER
   * =====================================================
   */

  function handleInputKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSend();
    }
  }

  /*
   * =====================================================
   * COPIAR
   * =====================================================
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
        setCopiedId((current) =>
          current === message.id
            ? null
            : current
        );
      }, 1500);
    } catch (error) {
      console.error(
        "Não foi possível copiar:",
        error
      );
    }
  }

  /*
   * =====================================================
   * VOZ
   * =====================================================
   */

  function toggleVoice() {
    setVoiceEnabled((current) => {
      const next = !current;

      if (!next) {
        pararFala();
      }

      return next;
    });
  }

  /*
   * =====================================================
   * MICROFONE
   * =====================================================
   */

  async function toggleMicrophone() {
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
   * =====================================================
   * RENDER
   * =====================================================
   */

  return (
    <div className="aura-app-shell">
      <aside className="aura-sidebar-desktop">
        <ChatSidebar
          conversations={conversations}
          activeConvId={activeConvId}
          onSelect={setActiveConvId}
          onNew={handleNewConversation}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />
      </aside>

      <main className="aura-main">
        {/* =============================================
            HEADER
            ============================================= */}

        <header className="aura-header">
          <div className="aura-header-left">
            <button
              type="button"
              className="aura-menu-button"
              onClick={() =>
                setSidebarOpen(true)
              }
              aria-label="Abrir histórico"
            >
              <Menu
                size={19}
                strokeWidth={1.6}
              />
            </button>

            <div className="aura-header-brand">
              <div className="aura-header-mark">
                <Waypoints
                  size={17}
                  strokeWidth={1.55}
                />
              </div>

              <div className="aura-header-brand-copy">
                <span className="aura-header-title">
                  AURA
                </span>

                <span className="aura-header-subtitle">
                  EducaCube
                </span>
              </div>
            </div>
          </div>

          <div className="aura-header-right">
            <div className="aura-network-status">
              <span className="aura-network-dot" />

              <span className="aura-network-label">
                Rede neural ativa
              </span>
            </div>

            <button
              type="button"
              className={`aura-header-action ${
                voiceEnabled
                  ? "aura-header-action-active"
                  : ""
              }`}
              onClick={toggleVoice}
              aria-label={
                voiceEnabled
                  ? "Desativar voz"
                  : "Ativar voz"
              }
              title={
                voiceEnabled
                  ? "Desativar voz"
                  : "Ativar voz"
              }
            >
              {voiceEnabled ? (
                <Volume2
                  size={17}
                  strokeWidth={1.55}
                />
              ) : (
                <VolumeX
                  size={17}
                  strokeWidth={1.55}
                />
              )}
            </button>

            <button
              type="button"
              className="aura-header-new"
              onClick={handleNewConversation}
            >
              <Plus
                size={16}
                strokeWidth={1.7}
              />

              <span>Nova conversa</span>
            </button>
          </div>
        </header>

        {/* =============================================
            CHAT
            ============================================= */}

        <section className="aura-field">
          {!activeConversation ||
          activeConversation.messages.length === 0 ? (
            <div className="aura-welcome">
              <div className="aura-welcome-orb">
                <NeuralOrb
                  isActive={isActive}
                  volume={volume}
                  frequency={frequency}
                  isProcessing={isProcessing}
                  size="xl"
                />
              </div>

              <div className="aura-welcome-copy">
                <div className="aura-welcome-eyebrow">
                  <span />
                  SISTEMA AURA
                </div>

                <h1>
                  Um espaço para
                  <br />
                  pensar em conjunto.
                </h1>

                <p>
                  A AURA conecta metodologias,
                  pesquisas e práticas pedagógicas
                  para apoiar sua reflexão sobre
                  ensino e aprendizagem.
                </p>
              </div>
            </div>
          ) : (
            <div className="aura-messages">
              {activeConversation.messages.map(
                (message) => {
                  const isAssistant =
                    message.role ===
                    "assistant";

                  return (
                    <article
                      key={message.id}
                      className={`aura-message ${
                        isAssistant
                          ? "aura-message-assistant"
                          : "aura-message-user"
                      }`}
                    >
                      {isAssistant && (
                        <div className="aura-message-avatar">
                          <Waypoints
                            size={15}
                            strokeWidth={1.55}
                          />
                        </div>
                      )}

                      <div className="aura-message-body">
                        <div className="aura-message-content">
                          {isAssistant ? (
                            <ReactMarkdown
                              remarkPlugins={[
                                remarkGfm,
                              ]}
                            >
                              {message.content}
                            </ReactMarkdown>
                          ) : (
                            <p>
                              {message.content}
                            </p>
                          )}
                        </div>

                        <div className="aura-message-footer">
                          <span className="aura-message-time">
                            {formatMessageTime(
                              message.timestamp
                            )}
                          </span>

                          {isAssistant && (
                            <div className="aura-message-actions">
                              <button
                                type="button"
                                className="aura-message-action"
                                onClick={() =>
                                  handleCopy(
                                    message
                                  )
                                }
                                aria-label="Copiar resposta"
                                title="Copiar"
                              >
                                <Copy
                                  size={13}
                                  strokeWidth={
                                    1.55
                                  }
                                />

                                {copiedId ===
                                  message.id && (
                                  <span>
                                    Copiado
                                  </span>
                                )}
                              </button>

                              {voiceEnabled && (
                                <button
                                  type="button"
                                  className="aura-message-action"
                                  onClick={() =>
                                    falarTexto(
                                      message.content
                                    )
                                  }
                                  aria-label="Ouvir resposta"
                                  title="Ouvir"
                                >
                                  <Volume2
                                    size={13}
                                    strokeWidth={
                                      1.55
                                    }
                                  />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </article>
                  );
                }
              )}

              {loading && (
                <div className="aura-processing">
                  <div className="aura-processing-avatar">
                    <Waypoints
                      size={14}
                      strokeWidth={1.5}
                    />
                  </div>

                  <div className="aura-processing-content">
                    <div className="aura-processing-label">
                      AURA está elaborando
                    </div>

                    <div className="aura-processing-line">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* =============================================
            COMPOSER
            ============================================= */}

        <div className="aura-composer-area">
          <div
            className={`aura-composer ${
              isActive
                ? "aura-composer-recording"
                : ""
            } ${
              loading
                ? "aura-composer-disabled"
                : ""
            }`}
          >
            <textarea
              value={input}
              onChange={(event) =>
                setInput(event.target.value)
              }
              onKeyDown={handleInputKeyDown}
              placeholder={
                isActive
                  ? "Escutando..."
                  : "Pergunte à AURA sobre educação..."
              }
              disabled={loading}
              rows={1}
              aria-label="Mensagem para a AURA"
            />

            <div className="aura-composer-actions">
              <button
                type="button"
                className={`aura-composer-button aura-mic-button ${
                  isActive
                    ? "aura-mic-button-active"
                    : ""
                }`}
                onClick={toggleMicrophone}
                disabled={loading}
                aria-label={
                  isActive
                    ? "Parar microfone"
                    : "Ativar microfone"
                }
                title={
                  isActive
                    ? "Parar microfone"
                    : "Microfone"
                }
              >
                {isActive ? (
                  <MicOff
                    size={17}
                    strokeWidth={1.6}
                  />
                ) : (
                  <Mic
                    size={17}
                    strokeWidth={1.6}
                  />
                )}
              </button>

              <button
                type="button"
                className={`aura-send-button ${
                  input.trim() && !loading
                    ? "aura-send-button-ready"
                    : ""
                }`}
                onClick={handleSend}
                disabled={
                  !input.trim() || loading
                }
                aria-label="Enviar mensagem"
                title="Enviar"
              >
                <ArrowUp
                  size={17}
                  strokeWidth={1.8}
                />
              </button>
            </div>
          </div>

          <div className="aura-composer-meta">
            <span>
              AURA pode cometer erros. Verifique
              informações importantes.
            </span>

            <span className="aura-composer-shortcut">
              Enter para enviar
              <span>•</span>
              Shift + Enter para nova linha
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

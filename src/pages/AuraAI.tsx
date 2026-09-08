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
  Volume2,
  VolumeX,
  Sparkles,
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

interface AuraMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface AuraConversation {
  id: string;
  title: string;
  messages: AuraMessage[];
  createdAt: number;
  updatedAt: number;
}

function generateId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .substring(2, 10)}`;
}

function createConversation(): AuraConversation {
  const now = Date.now();

  return {
    id: generateId(),
    title: "Nova conversa",
    messages: [],
    createdAt: now,
    updatedAt: now,
  };
}

export default function AuraAI() {
  const [userId] = useState(() => {
    const existing = localStorage.getItem("aura_user_id");

    if (existing) {
      return existing;
    }

    const newId = `guest-${generateId()}`;

    localStorage.setItem("aura_user_id", newId);

    return newId;
  });

  const [conversations, setConversations] = useState<
    AuraConversation[]
  >([]);

  const [activeConversationId, setActiveConversationId] =
    useState<string>("");

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(
    null
  );

  const {
    isActive,
    isProcessing,
    volume,
    frequency,
    start,
    stop,
  } = useAudioAnalyzer();

  /*
   * Carrega o histórico.
   */
  useEffect(() => {
    const saved =
      buscarDoRedis<AuraConversation[]>(userId);

    if (saved && Array.isArray(saved) && saved.length > 0) {
      setConversations(saved);
      setActiveConversationId(saved[0].id);
      return;
    }

    const initialConversation = createConversation();

    setConversations([initialConversation]);
    setActiveConversationId(initialConversation.id);
  }, [userId]);

  /*
   * Salva o histórico.
   */
  useEffect(() => {
    if (conversations.length === 0) {
      return;
    }

    salvarNoRedis(userId, conversations);
  }, [conversations, userId]);

  /*
   * Para a voz ao desmontar a página.
   */
  useEffect(() => {
    return () => {
      pararFala();
    };
  }, []);

  const activeConversation = useMemo(() => {
    return conversations.find(
      (conversation) =>
        conversation.id === activeConversationId
    );
  }, [conversations, activeConversationId]);

  /*
   * Cria uma nova conversa.
   */
  function handleNewConversation() {
    const newConversation = createConversation();

    setConversations((current) => [
      newConversation,
      ...current,
    ]);

    setActiveConversationId(newConversation.id);
    setInput("");
    setSidebarOpen(false);
    pararFala();
  }

  /*
   * Atualiza uma conversa.
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
   * Envia mensagem.
   */
  async function handleSend() {
    const text = input.trim();

    if (!text || loading) {
      return;
    }

    let conversation = activeConversation;

    /*
     * Segurança para o caso de ainda não existir
     * uma conversa ativa.
     */
    if (!conversation) {
      conversation = createConversation();

      setConversations((current) => [
        conversation!,
        ...current,
      ]);

      setActiveConversationId(conversation.id);
    }

    const userMessage: AuraMessage = {
      id: generateId(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const messagesBeforeAI = [
      ...conversation.messages,
      userMessage,
    ];

    updateConversation(conversation.id, (current) => ({
      ...current,
      title:
        current.messages.length === 0
          ? text.length > 50
            ? `${text.substring(0, 50)}...`
            : text
          : current.title,
      messages: messagesBeforeAI,
      updatedAt: Date.now(),
    }));

    setInput("");
    setLoading(true);

    try {
      const contexto = messagesBeforeAI
        .slice(-12)
        .map((message) => {
          const speaker =
            message.role === "user"
              ? "Usuário"
              : "AURA";

          return `${speaker}: ${message.content}`;
        });

      const result = await analisarComGroq(
        text,
        contexto
      );

      const responseText =
        result?.resposta ||
        "Não consegui gerar uma resposta neste momento.";

      const assistantMessage: AuraMessage = {
        id: generateId(),
        role: "assistant",
        content: responseText,
        timestamp: Date.now(),
      };

      updateConversation(conversation.id, (current) => ({
        ...current,
        messages: [
          ...current.messages,
          assistantMessage,
        ],
        updatedAt: Date.now(),
      }));

      if (voiceEnabled) {
        falarTexto(responseText);
      }
    } catch (error) {
      console.error(
        "Erro na comunicação com a AURA:",
        error
      );

      const errorMessage: AuraMessage = {
        id: generateId(),
        role: "assistant",
        content:
          "⚠️ Não consegui conectar ao sistema de inteligência da AURA. Verifique a API e tente novamente.",
        timestamp: Date.now(),
      };

      updateConversation(conversation.id, (current) => ({
        ...current,
        messages: [
          ...current.messages,
          errorMessage,
        ],
        updatedAt: Date.now(),
      }));
    } finally {
      setLoading(false);
    }
  }

  /*
   * Enter envia.
   * Shift + Enter cria nova linha.
   */
  function handleInputKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  }

  /*
   * Copiar resposta.
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
        "Erro ao copiar mensagem:",
        error
      );
    }
  }

  /*
   * Voz.
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
   * Microfone.
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
   * Dados simplificados para a sidebar.
   *
   * A página mantém sua própria estrutura completa de
   * conversas e passa somente os dados necessários para
   * exibição.
   */
  const sidebarConversations = conversations.map(
    (conversation) => ({
      id: conversation.id,
      title: conversation.title,
      updatedAt: conversation.updatedAt,
      createdAt: conversation.createdAt,
      messages: conversation.messages,
    })
  );

  return (
    <div className="h-screen overflow-hidden bg-[#05060a] text-white">
      <div className="flex h-full">

        {/* SIDEBAR DESKTOP */}
        <aside className="hidden md:flex">
          <ChatSidebar
            conversations={sidebarConversations}
            activeConversationId={
              activeConversationId
            }
            onSelectConversation={(id: string) => {
              setActiveConversationId(id);
            }}
            onNewConversation={
              handleNewConversation
            }
          />
        </aside>

        {/* SIDEBAR MOBILE */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-[100] md:hidden">
            <button
              type="button"
              aria-label="Fechar menu"
              className="absolute inset-0 h-full w-full bg-black/70"
              onClick={() =>
                setSidebarOpen(false)
              }
            />

            <div className="relative z-10 h-full w-[85%] max-w-[360px]">
              <ChatSidebar
                conversations={
                  sidebarConversations
                }
                activeConversationId={
                  activeConversationId
                }
                onSelectConversation={(
                  id: string
                ) => {
                  setActiveConversationId(id);
                  setSidebarOpen(false);
                }}
                onNewConversation={
                  handleNewConversation
                }
              />
            </div>
          </div>
        )}

        {/* CONTEÚDO PRINCIPAL */}
        <main className="flex min-w-0 flex-1 flex-col">

          {/* HEADER */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-black/20 px-4 backdrop-blur-xl sm:px-6">

            <div className="flex items-center gap-3">

              <button
                type="button"
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="rounded-xl p-2 text-white/60 transition hover:bg-white/10 hover:text-white md:hidden"
                aria-label="Abrir conversas"
              >
                <Menu size={22} />
              </button>

              <div className="flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/20">
                  <Bot size={20} />
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-sm font-semibold">
                      AURA AI
                    </h1>

                    <Sparkles
                      size={13}
                      className="text-violet-400"
                    />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Sistema neural online
                  </div>
                </div>

              </div>
            </div>

            <div className="flex items-center gap-1 sm:gap-2">

              <button
                type="button"
                onClick={
                  handleVoiceToggle
                }
                className="rounded-xl p-2 text-white/50 transition hover:bg-white/10 hover:text-white"
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
                  <Volume2 size={19} />
                ) : (
                  <VolumeX size={19} />
                )}
              </button>

              <button
                type="button"
                onClick={
                  handleNewConversation
                }
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/75 transition hover:bg-white/10 hover:text-white"
              >
                <Plus size={16} />

                <span className="hidden sm:inline">
                  Nova conversa
                </span>
              </button>

            </div>
          </header>

          {/* ÁREA DO CHAT */}
          <section className="relative min-h-0 flex-1 overflow-hidden">

            {/* BACKGROUND */}
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(99,102,241,0.13),transparent_35%),radial-gradient(circle_at_50%_90%,rgba(6,182,212,0.08),transparent_35%)]" />

            <div className="relative flex h-full flex-col">

              {/* ESTADO INICIAL */}
              {(!activeConversation ||
                activeConversation.messages
                  .length === 0) && (
                <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5">

                  <div className="relative">

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

                  <div className="mt-6 max-w-lg text-center sm:mt-8">

                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      Como posso ajudar?
                    </h2>

                    <p className="mt-3 text-sm leading-6 text-white/40">
                      Converse com a AURA sobre
                      psicologia, neurociência,
                      estudos, pesquisas e
                      conhecimento científico.
                    </p>

                  </div>
                </div>
              )}

              {/* MENSAGENS */}
              {activeConversation &&
                activeConversation.messages
                  .length > 0 && (
                  <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-8">

                    <div className="mx-auto max-w-4xl space-y-6">

                      {activeConversation.messages.map(
                        (message) => (
                          <div
                            key={message.id}
                            className={`flex ${
                              message.role ===
                              "user"
                                ? "justify-end"
                                : "justify-start"
                            }`}
                          >

                            <div
                              className={
                                message.role ===
                                "user"
                                  ? "max-w-[90%] rounded-2xl rounded-br-md bg-violet-600 px-4 py-3 shadow-lg shadow-violet-900/10 sm:max-w-[80%]"
                                  : "max-w-[95%] rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.045] px-4 py-4 sm:max-w-[85%] sm:px-5"
                              }
                            >

                              {message.role ===
                              "assistant" ? (
                                <div className="flex gap-3">

                                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500">
                                    <Bot
                                      size={16}
                                    />
                                  </div>

                                  <div className="min-w-0 flex-1">

                                    <div className="prose prose-invert max-w-none text-sm leading-7 prose-p:my-2 prose-headings:mb-3 prose-headings:mt-4 prose-li:my-0 prose-pre:overflow-x-auto prose-pre:rounded-xl prose-pre:bg-black/40 prose-code:text-cyan-300">

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
                                              href={
                                                href
                                              }
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-cyan-400 underline decoration-cyan-400/40 underline-offset-2 hover:text-cyan-300"
                                            >
                                              {
                                                children
                                              }
                                            </a>
                                          ),
                                        }}
                                      >
                                        {
                                          message.content
                                        }
                                      </ReactMarkdown>

                                    </div>

                                    <div className="mt-3 flex items-center gap-1">

                                      <button
                                        type="button"
                                        onClick={() =>
                                          void handleCopy(
                                            message
                                          )
                                        }
                                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-white/30 transition hover:bg-white/10 hover:text-white/70"
                                      >
                                        <Copy
                                          size={13}
                                        />

                                        {copiedId ===
                                        message.id
                                          ? "Copiado"
                                          : "Copiar"}
                                      </button>

                                      {voiceEnabled && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            falarTexto(
                                              message.content
                                            )
                                          }
                                          className="rounded-lg p-1.5 text-white/30 transition hover:bg-white/10 hover:text-white/70"
                                          title="Ouvir resposta"
                                        >
                                          <Volume2
                                            size={14}
                                          />
                                        </button>
                                      )}

                                    </div>

                                  </div>
                                </div>
                              ) : (
                                <p className="whitespace-pre-wrap text-sm leading-6">
                                  {
                                    message.content
                                  }
                                </p>
                              )}

                            </div>
                          </div>
                        )
                      )}

                      {/* LOADING */}
                      {loading && (
                        <div className="flex justify-start">

                          <div className="rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.045] px-5 py-4">

                            <div className="flex items-center gap-2">

                              <div className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />

                              <div className="h-2 w-2 animate-pulse rounded-full bg-cyan-400 [animation-delay:150ms]" />

                              <div className="h-2 w-2 animate-pulse rounded-full bg-violet-400 [animation-delay:300ms]" />

                              <span className="ml-2 text-xs text-white/40">
                                AURA está processando...
                              </span>

                            </div>

                          </div>

                        </div>
                      )}

                    </div>
                  </div>
                )}

              {/* INPUT */}
              <div className="shrink-0 px-4 pb-4 pt-3 sm:px-8 sm:pb-5">

                <div className="mx-auto max-w-4xl">

                  <div className="relative rounded-2xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/20 backdrop-blur-xl transition focus-within:border-violet-500/40">

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
                      placeholder="Pergunte alguma coisa para a AURA..."
                      rows={1}
                      disabled={loading}
                      className="min-h-[58px] w-full resize-none bg-transparent px-4 pb-12 pt-4 pr-14 text-sm text-white outline-none placeholder:text-white/25"
                    />

                    {/* MICROFONE */}
                    <div className="absolute bottom-2.5 left-3 flex items-center gap-2">

                      <button
                        type="button"
                        onClick={
                          handleMicrophone
                        }
                        className={`rounded-xl p-2 transition ${
                          isActive
                            ? "bg-red-500/20 text-red-400"
                            : "text-white/35 hover:bg-white/10 hover:text-white/70"
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
                        <span className="text-[11px] text-emerald-400">
                          Microfone ativo
                        </span>
                      )}

                    </div>

                    {/* ENVIAR */}
                    <button
                      type="button"
                      onClick={() =>
                        void handleSend()
                      }
                      disabled={
                        !input.trim() ||
                        loading
                      }
                      className="absolute bottom-2.5 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-30"
                      title="Enviar mensagem"
                      aria-label="Enviar mensagem"
                    >
                      <ArrowUp size={18} />
                    </button>

                  </div>

                  <p className="mt-2 text-center text-[10px] text-white/20">
                    AURA AI pode cometer erros.
                    Verifique informações importantes.
                  </p>

                </div>
              </div>

            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

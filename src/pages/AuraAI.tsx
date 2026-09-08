import { useEffect, useMemo, useState } from "react";
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
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import NeuralOrb from "../components/NeuralOrb";
import ChatSidebar from "../components/ChatSidebar";
import useAudioAnalyzer from "../hooks/useAudioAnalyzer";
import {
  analisarComGroq,
  buscarDoRedis,
  falarTexto,
  pararFala,
  salvarNoRedis,
} from "../lib/aura-engine";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

const STORAGE_KEY = "aura_conversations";

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function createConversation(): Conversation {
  return {
    id: createId(),
    title: "Nova conversa",
    messages: [],
    updatedAt: Date.now(),
  };
}

export default function AuraAI() {
  const [userId] = useState(() => {
    return (
      localStorage.getItem("aura_user_id") ||
      `guest-${createId()}`
    );
  });

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const {
    isActive,
    isProcessing,
    volume,
    frequency,
    start,
    stop,
  } = useAudioAnalyzer();

  useEffect(() => {
    localStorage.setItem("aura_user_id", userId);

    const saved = buscarDoRedis<Conversation[]>(userId);

    if (saved && saved.length > 0) {
      setConversations(saved);
      setActiveConversationId(saved[0].id);
    } else {
      const initial = createConversation();

      setConversations([initial]);
      setActiveConversationId(initial.id);
    }
  }, [userId]);

  const activeConversation = useMemo(() => {
    return conversations.find(
      (conversation) =>
        conversation.id === activeConversationId
    );
  }, [conversations, activeConversationId]);

  useEffect(() => {
    if (conversations.length > 0) {
      salvarNoRedis(userId, conversations);
    }
  }, [conversations, userId]);

  useEffect(() => {
    return () => {
      pararFala();
    };
  }, []);

  function createNewConversation() {
    const conversation = createConversation();

    setConversations((current) => [
      conversation,
      ...current,
    ]);

    setActiveConversationId(conversation.id);
    setInput("");
    setSidebarOpen(false);
  }

  function updateConversation(
    conversationId: string,
    updater: (conversation: Conversation) => Conversation
  ) {
    setConversations((current) =>
      current.map((conversation) =>
        conversation.id === conversationId
          ? updater(conversation)
          : conversation
      )
    );
  }

  async function sendMessage() {
    const text = input.trim();

    if (!text || loading) {
      return;
    }

    let conversation = activeConversation;

    if (!conversation) {
      conversation = createConversation();

      setConversations((current) => [
        conversation!,
        ...current,
      ]);

      setActiveConversationId(conversation.id);
    }

    const userMessage: Message = {
      id: createId(),
      role: "user",
      content: text,
      timestamp: Date.now(),
    };

    const updatedMessages = [
      ...conversation.messages,
      userMessage,
    ];

    updateConversation(conversation.id, (current) => ({
      ...current,
      title:
        current.messages.length === 0
          ? text.slice(0, 45)
          : current.title,
      messages: updatedMessages,
      updatedAt: Date.now(),
    }));

    setInput("");
    setLoading(true);

    try {
      const context = updatedMessages
        .slice(-12)
        .map(
          (message) =>
            `${message.role === "user" ? "Usuário" : "AURA"}: ${
              message.content
            }`
        );

      const result = await analisarComGroq(
        text,
        context
      );

      const assistantMessage: Message = {
        id: createId(),
        role: "assistant",
        content:
          result.resposta ||
          "Não consegui gerar uma resposta.",
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

      if (voiceEnabled && result.resposta) {
        falarTexto(result.resposta);
      }
    } catch (error) {
      console.error(error);

      const errorMessage: Message = {
        id: createId(),
        role: "assistant",
        content:
          "⚠️ Ocorreu um erro ao conectar com a inteligência da AURA. Verifique o servidor da API e tente novamente.",
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

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  async function copyMessage(
    message: Message
  ) {
    try {
      await navigator.clipboard.writeText(
        message.content
      );

      setCopiedId(message.id);

      setTimeout(() => {
        setCopiedId(null);
      }, 1500);
    } catch (error) {
      console.error("Erro ao copiar:", error);
    }
  }

  function toggleVoice() {
    if (voiceEnabled) {
      pararFala();
      setVoiceEnabled(false);
    } else {
      setVoiceEnabled(true);
    }
  }

  async function toggleMicrophone() {
    if (isActive) {
      stop();
    } else {
      await start();
    }
  }

  return (
    <div className="min-h-screen bg-[#05060a] text-white">
      <div className="flex h-screen overflow-hidden">

        {/* SIDEBAR */}
        <div className="hidden md:block">
          <ChatSidebar
            conversations={conversations.map(
              (conversation) => ({
                id: conversation.id,
                title: conversation.title,
                updatedAt: conversation.updatedAt,
              })
            )}
            activeConversationId={
              activeConversationId
            }
            onSelectConversation={(id) => {
              setActiveConversationId(id);
            }}
            onNewConversation={
              createNewConversation
            }
          />
        </div>

        {/* MOBILE SIDEBAR */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setSidebarOpen(false)}
            />

            <div className="relative h-full w-[85%] max-w-sm">
              <ChatSidebar
                conversations={conversations.map(
                  (conversation) => ({
                    id: conversation.id,
                    title: conversation.title,
                    updatedAt:
                      conversation.updatedAt,
                  })
                )}
                activeConversationId={
                  activeConversationId
                }
                onSelectConversation={(id) => {
                  setActiveConversationId(id);
                  setSidebarOpen(false);
                }}
                onNewConversation={
                  createNewConversation
                }
              />
            </div>
          </div>
        )}

        {/* MAIN */}
        <main className="flex min-w-0 flex-1 flex-col">

          {/* HEADER */}
          <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-black/20 px-4 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <button
                onClick={() =>
                  setSidebarOpen(true)
                }
                className="rounded-xl p-2 text-white/70 transition hover:bg-white/10 hover:text-white md:hidden"
                aria-label="Abrir menu"
              >
                <Menu size={22} />
              </button>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 shadow-lg shadow-violet-500/20">
                  <Bot size={21} />
                </div>

                <div>
                  <h1 className="text-sm font-semibold">
                    AURA AI
                  </h1>

                  <div className="flex items-center gap-2 text-xs text-white/45">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Sistema neural online
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleVoice}
                className="rounded-xl p-2 text-white/60 transition hover:bg-white/10 hover:text-white"
                title={
                  voiceEnabled
                    ? "Desativar voz"
                    : "Ativar voz"
                }
              >
                {voiceEnabled ? (
                  <Volume2 size={20} />
                ) : (
                  <VolumeX size={20} />
                )}
              </button>

              <button
                onClick={createNewConversation}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white/80 transition hover:bg-white/10"
              >
                <Plus size={16} />
                <span className="hidden sm:inline">
                  Nova conversa
                </span>
              </button>
            </div>
          </header>

          {/* CHAT */}
          <section className="relative flex-1 overflow-hidden">

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(99,102,241,0.12),transparent_35%),radial-gradient(circle_at_50%_80%,rgba(6,182,212,0.08),transparent_35%)]" />

            <div className="relative flex h-full flex-col">

              {/* ORB */}
              {(!activeConversation ||
                activeConversation.messages.length ===
                  0) && (
                <div className="flex flex-1 flex-col items-center justify-center px-6">
                  <div className="relative">
                    <NeuralOrb
                      size="xl"
                      volume={volume}
                      frequency={frequency}
                      isActive={
                        isActive ||
                        isProcessing ||
                        loading
                      }
                    />
                  </div>

                  <div className="mt-8 text-center">
                    <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      Como posso ajudar?
                    </h2>

                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/45">
                      Converse com a AURA sobre
                      psicologia, neurociência,
                      estudos e conhecimento
                      científico.
                    </p>
                  </div>
                </div>
              )}

              {/* MESSAGES */}
              {activeConversation &&
                activeConversation.messages.length >
                  0 && (
                  <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
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
                              className={`max-w-[90%] sm:max-w-[80%] ${
                                message.role ===
                                "user"
                                  ? "rounded-2xl rounded-br-md bg-violet-600 px-4 py-3"
                                  : "rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.045] px-5 py-4"
                              }`}
                            >
                              {message.role ===
                              "assistant" ? (
                                <div className="flex gap-3">
                                  <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500">
                                    <Bot
                                      size={16}
                                    />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <div className="prose prose-invert max-w-none text-sm leading-7 prose-p:my-2 prose-headings:mb-3 prose-headings:mt-4 prose-li:my-0">
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
                                              className="text-cyan-400 underline hover:text-cyan-300"
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

                                    <div className="mt-3 flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          copyMessage(
                                            message
                                          )
                                        }
                                        className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-white/35 transition hover:bg-white/10 hover:text-white/70"
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
                                          onClick={() =>
                                            falarTexto(
                                              message.content
                                            )
                                          }
                                          className="rounded-lg p-1.5 text-white/35 transition hover:bg-white/10 hover:text-white/70"
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
              <div className="shrink-0 px-4 pb-5 pt-3 sm:px-8">
                <div className="mx-auto max-w-4xl">

                  <div className="relative rounded-2xl border border-white/10 bg-white/[0.045] shadow-2xl shadow-black/20 backdrop-blur-xl transition focus-within:border-violet-500/40">

                    <textarea
                      value={input}
                      onChange={(event) =>
                        setInput(event.target.value)
                      }
                      onKeyDown={handleKeyDown}
                      placeholder="Pergunte alguma coisa para a AURA..."
                      rows={1}
                      disabled={loading}
                      className="min-h-[58px] w-full resize-none bg-transparent px-4 pb-12 pt-4 pr-14 text-sm text-white outline-none placeholder:text-white/25"
                    />

                    <div className="absolute bottom-2.5 left-3 flex items-center gap-1">
                      <button
                        onClick={
                          toggleMicrophone
                        }
                        className={`rounded-xl p-2 transition ${
                          isActive
                            ? "bg-red-500/20 text-red-400"
                            : "text-white/35 hover:bg-white/10 hover:text-white/70"
                        }`}
                        title={
                          isActive
                            ? "Parar microfone"
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

                    <button
                      onClick={sendMessage}
                      disabled={
                        !input.trim() ||
                        loading
                      }
                      className="absolute bottom-2.5 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-violet-600 text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-30"
                      title="Enviar"
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

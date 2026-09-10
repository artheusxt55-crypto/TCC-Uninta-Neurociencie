
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
} from "react";

import {
  Box,
  MessageCircle,
  FileText,
  BookOpen,
  FilePenLine,
  Folder,
  Settings,
  Paperclip,
  Send,
  Square,
  Mic,
  ChevronRight,
  Crown,
  User,
  ShieldCheck,
  WifiOff,
  Search,
  Plus,
  Pencil,
  Trash2,
  Copy,
  RotateCcw,
  ChevronDown,
  Volume2,
  VolumeX,
  AlertTriangle,
  Menu,
  X,
} from "lucide-react";

import NeuralOrb, {
  type AuraState,
} from "../components/NeuralOrb";

import { renderAuraMarkdown } from "../components/aura-markdown";

import "../styles/aura-ai.css";

/* ================================================================
   Types
   ================================================================ */

interface NavItem {
  id: string;
  label: string;
  icon: typeof MessageCircle;
}

interface Suggestion {
  id: string;
  label: string;
  detail: string;
  icon: typeof BookOpen;
  prompt: string;
}

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface AuraMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: "complete" | "error";
  createdAt: number;
}

interface ConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  updatedAt: number;
}

/* ================================================================
   Static content
   ================================================================ */

const NAV_ITEMS: NavItem[] = [
  { id: "chat", label: "Chat IA", icon: MessageCircle },
  { id: "estudos", label: "Meus Estudos", icon: FileText },
  { id: "biblioteca", label: "Biblioteca", icon: BookOpen },
  { id: "provas", label: "Provas e Exercícios", icon: FilePenLine },
  { id: "materiais", label: "Materiais", icon: Folder },
  { id: "config", label: "Configurações", icon: Settings },
];

const SUGGESTIONS: Suggestion[] = [
  {
    id: "explicar",
    label: "Explique Piaget de forma simples",
    detail: "Conceito traduzido em linguagem clara",
    icon: BookOpen,
    prompt:
      "Explique a teoria de Piaget de forma simples, com um exemplo prático de sala de aula.",
  },
  {
    id: "exercicios",
    label: "Crie 10 questões sobre a BNCC",
    detail: "Banco de questões personalizado",
    icon: FilePenLine,
    prompt:
      "Crie 10 questões de múltipla escolha sobre a BNCC, com gabarito comentado.",
  },
  {
    id: "plano-aula",
    label: "Transforme este texto em um plano de aula",
    detail: "Estrutura pedagógica pronta para aplicar",
    icon: FileText,
    prompt:
      "Transforme o seguinte texto em um plano de aula estruturado: ",
  },
  {
    id: "comparar",
    label: "Compare duas teorias pedagógicas",
    detail: "Análise lado a lado, com aplicações",
    icon: Folder,
    prompt:
      "Compare a pedagogia de Piaget com a de Vygotsky, destacando aplicações práticas.",
  },
];

// Mock history — replace with the real fetch from your persistence layer
// (Firebase/Supabase). Shape matches `ConversationSummary`.
const now = Date.now();
const HOUR = 3_600_000;

const MOCK_HISTORY: ConversationSummary[] = [
  {
    id: "c1",
    title: "Sequência didática sobre frações",
    messageCount: 12,
    updatedAt: now - 2 * HOUR,
  },
  {
    id: "c2",
    title: "Resumo do capítulo 4 — Ecologia",
    messageCount: 6,
    updatedAt: now - 5 * HOUR,
  },
  {
    id: "c3",
    title: "Questões de vestibular — Literatura",
    messageCount: 18,
    updatedAt: now - 26 * HOUR,
  },
  {
    id: "c4",
    title: "Plano de aula — Revolução Industrial",
    messageCount: 9,
    updatedAt: now - 3 * 24 * HOUR,
  },
  {
    id: "c5",
    title: "Comparação Piaget x Vygotsky",
    messageCount: 14,
    updatedAt: now - 6 * 24 * HOUR,
  },
  {
    id: "c6",
    title: "Redação ENEM — estrutura dissertativa",
    messageCount: 22,
    updatedAt: now - 20 * 24 * HOUR,
  },
];

const DEMO_RESPONSE = `**Conceito**
A aprendizagem significativa ocorre quando um novo conteúdo se conecta ao que o estudante já sabe, em vez de ser memorizado de forma isolada.

**Como funciona**
- O professor identifica os conhecimentos prévios da turma
- O novo conteúdo é apresentado em relação a esses conhecimentos
- O estudante reorganiza sua estrutura de pensamento para incorporar a novidade

**Exemplo**
Ao ensinar frações, partir de situações concretas (dividir uma pizza, repartir um valor) antes de introduzir a notação simbólica.

**Aplicação pedagógica**
1. Comece com uma pergunta diagnóstica
2. Conecte o novo conteúdo a uma situação já vivida pela turma
3. Só então formalize a definição técnica

**Ponto-chave**
Conteúdo sem conexão prévia tende a ser esquecido rapidamente; conteúdo ancorado em conhecimento existente se mantém.`;

/* ================================================================
   Helpers
   ================================================================ */

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRelativeTime(ts: number): string {
  const diffMs = now - ts;
  const diffHours = Math.floor(diffMs / HOUR);

  if (diffHours < 1) return "agora há pouco";
  if (diffHours < 24) return `há ${diffHours}h`;

  const diffDays = Math.floor(diffHours / 24);

  return `há ${diffDays}d`;
}

function groupHistory(items: ConversationSummary[]) {
  const groups: {
    label: string;
    items: ConversationSummary[];
  }[] = [
    { label: "Hoje", items: [] },
    { label: "Ontem", items: [] },
    { label: "Últimos 7 dias", items: [] },
    { label: "Anteriores", items: [] },
  ];

  for (const item of items) {
    const diffDays = Math.floor(
      (now - item.updatedAt) / (24 * HOUR)
    );

    if (diffDays < 1) {
      groups[0].items.push(item);
    } else if (diffDays < 2) {
      groups[1].items.push(item);
    } else if (diffDays < 7) {
      groups[2].items.push(item);
    } else {
      groups[3].items.push(item);
    }
  }

  return groups.filter((g) => g.items.length > 0);
}

const AURA_STATE_LABEL: Record<AuraState, string> = {
  idle: "Pronta",
  listening: "Ouvindo",
  thinking: "Pensando",
  generating: "Respondendo",
  complete: "Concluído",
  speaking: "Falando",
  error: "Erro",
  offline: "Offline",
};

/* ================================================================
   Component
   ================================================================ */

export default function AuraEducacube() {
  const [activeNav, setActiveNav] = useState("chat");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [messages, setMessages] = useState<AuraMessage[]>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const [auraState, setAuraState] =
    useState<AuraState>("idle");

  const [micActive, setMicActive] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);

  const [speakingMessageId, setSpeakingMessageId] =
    useState<string | null>(null);

  const [copiedMessageId, setCopiedMessageId] =
    useState<string | null>(null);

  const [historySearch, setHistorySearch] = useState("");

  const [activeConversationId, setActiveConversationId] =
    useState<string | null>(null);

  const [isOnline, setIsOnline] = useState(
    typeof navigator !== "undefined"
      ? navigator.onLine
      : true
  );

  const [showScrollToLatest, setShowScrollToLatest] =
    useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const textareaRef =
    useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const generatingTimeoutRef =
    useRef<number | null>(null);

  const hasConversation = messages.length > 0;

  /* ---------------- connection status ---------------- */

  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOnline) {
      setAuraState("offline");
    } else if (auraState === "offline") {
      setAuraState("idle");
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOnline]);

  /* ---------------- textarea autosize ---------------- */

  useEffect(() => {
    const el = textareaRef.current;

    if (!el) return;

    el.style.height = "auto";
    el.style.height = `${Math.min(
      el.scrollHeight,
      160
    )}px`;
  }, [input]);

  /* ---------------- simulated mic amplitude ---------------- */

  useEffect(() => {
    if (!micActive) {
      setAudioLevel(0);
      return;
    }

    const id = window.setInterval(() => {
      setAudioLevel(0.3 + Math.random() * 0.7);
    }, 140);

    return () => window.clearInterval(id);
  }, [micActive]);

  /* ---------------- smart scroll ---------------- */

  function isNearBottom(el: HTMLDivElement) {
    return (
      el.scrollHeight -
        el.scrollTop -
        el.clientHeight <
      120
    );
  }

  useEffect(() => {
    const el = scrollRef.current;

    if (!el) return;

    if (isNearBottom(el)) {
      el.scrollTop = el.scrollHeight;
      setShowScrollToLatest(false);
    } else {
      setShowScrollToLatest(true);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages, auraState]);

  function handleMessagesScroll() {
    const el = scrollRef.current;

    if (!el) return;

    setShowScrollToLatest(!isNearBottom(el));
  }

  function scrollToLatest() {
    const el = scrollRef.current;

    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: "smooth",
    });

    setShowScrollToLatest(false);
  }

  /* ---------------- cleanup ---------------- */

  useEffect(() => {
    return () => {
      if (generatingTimeoutRef.current) {
        window.clearTimeout(
          generatingTimeoutRef.current
        );
      }
    };
  }, []);

  /* ================================================================
     Actions
     ================================================================ */

  function sendMessage(text: string) {
    const trimmed = text.trim();

    if (!trimmed || !isOnline) return;

    const userMessage: AuraMessage = {
      id: generateId(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setAttachments([]);
    setAuraState("thinking");

    generatingTimeoutRef.current =
      window.setTimeout(() => {
        setAuraState("generating");

        generatingTimeoutRef.current =
          window.setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: generateId(),
                role: "assistant",
                content: DEMO_RESPONSE,
                status: "complete",
                createdAt: Date.now(),
              },
            ]);

            setAuraState("complete");

            window.setTimeout(
              () => setAuraState("idle"),
              900
            );
          }, 1100);
      }, 700);
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage(input);
    }
  }

  function handleGlobalKeyDown(
    event: KeyboardEvent<HTMLDivElement>
  ) {
    if (
      event.key === "Escape" &&
      sidebarOpen
    ) {
      setSidebarOpen(false);
    }
  }

  function handleStopGenerating() {
    if (generatingTimeoutRef.current) {
      window.clearTimeout(
        generatingTimeoutRef.current
      );
    }

    setAuraState("idle");
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList) return;

    const next: Attachment[] =
      Array.from(fileList).map((file) => ({
        id: generateId(),
        name: file.name,
        size: file.size,
        type: file.type,
      }));

    setAttachments((prev) => [
      ...prev,
      ...next,
    ]);
  }

  function handleFileInputChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    addFiles(event.target.files);
    event.target.value = "";
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setIsDragOver(false);
    addFiles(event.dataTransfer.files);
  }

  function toggleMic() {
    setMicActive((prev) => {
      const next = !prev;

      setAuraState(
        next ? "listening" : "idle"
      );

      return next;
    });
  }

  function toggleSpeak(message: AuraMessage) {
    if (
      speakingMessageId === message.id
    ) {
      setSpeakingMessageId(null);
      setAuraState("idle");
    } else {
      setSpeakingMessageId(message.id);
      setAuraState("speaking");
    }
  }

  async function copyMessage(
    message: AuraMessage
  ) {
    try {
      await navigator.clipboard.writeText(
        message.content
      );

      setCopiedMessageId(message.id);

      window.setTimeout(
        () => setCopiedMessageId(null),
        1600
      );
    } catch {
      // clipboard API unavailable
    }
  }

  function regenerate(messageId: string) {
    setMessages((prev) =>
      prev.filter(
        (m) => m.id !== messageId
      )
    );

    setAuraState("thinking");

    generatingTimeoutRef.current =
      window.setTimeout(() => {
        setAuraState("generating");

        generatingTimeoutRef.current =
          window.setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              {
                id: generateId(),
                role: "assistant",
                content: DEMO_RESPONSE,
                status: "complete",
                createdAt: Date.now(),
              },
            ]);

            setAuraState("idle");
          }, 1100);
      }, 600);
  }

  function retryLastMessage() {
    const lastUser = [...messages]
      .reverse()
      .find((m) => m.role === "user");

    if (lastUser) {
      sendMessage(lastUser.content);
    }
  }

  function startNewConversation() {
    setMessages([]);
    setActiveConversationId(null);
    setAuraState("idle");
    setSidebarOpen(false);
  }

  function openConversation(id: string) {
    setActiveConversationId(id);
    setSidebarOpen(false);

    // Load real messages here later.
  }

  /* ================================================================
     Derived data
     ================================================================ */

  const filteredHistory = useMemo(() => {
    const query =
      historySearch.trim().toLowerCase();

    if (!query) return MOCK_HISTORY;

    return MOCK_HISTORY.filter((c) =>
      c.title
        .toLowerCase()
        .includes(query)
    );
  }, [historySearch]);

  const historyGroups = useMemo(
    () => groupHistory(filteredHistory),
    [filteredHistory]
  );

  const isBusy =
    auraState === "thinking" ||
    auraState === "generating";

  /* ================================================================
     Render
     ================================================================ */

  return (
    <div
      className="aura-page"
      onKeyDown={handleGlobalKeyDown}
    >
      <div className="aura-layout">

        {sidebarOpen && (
          <div
            className="aura-sidebar-overlay"
            onClick={() =>
              setSidebarOpen(false)
            }
          />
        )}

        {/* ================================================= */}
        {/* SIDEBAR                                            */}
        {/* ================================================= */}

        <aside
          className={`aura-sidebar ${
            sidebarOpen
              ? "aura-sidebar-open"
              : ""
          }`}
        >
          <div className="aura-sidebar-top">

            <div
              className="aura-brand"
              style={{ flex: 1 }}
            >
              <div className="aura-brand-mark">
                <Box
                  size={24}
                  strokeWidth={1.6}
                />
              </div>

              <div className="aura-brand-name">
                EducaCube
                <b>
                  AURA · Inteligência
                  Educacional
                </b>
              </div>
            </div>

            <button
              type="button"
              className="aura-drawer-close"
              onClick={() =>
                setSidebarOpen(false)
              }
              aria-label="Fechar menu"
            >
              <X size={16} />
            </button>
          </div>

          <div
            style={{ padding: "0 16px" }}
          >
            <button
              type="button"
              className="aura-new-chat"
              onClick={
                startNewConversation
              }
            >
              <Plus size={15} />
              Nova conversa
            </button>

            <nav className="aura-nav">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  activeNav === item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setActiveNav(item.id)
                    }
                    className={`aura-nav-item ${
                      isActive
                        ? "aura-nav-item-active"
                        : ""
                    }`}
                  >
                    <Icon
                      size={16}
                      strokeWidth={1.8}
                    />
                    <span>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="aura-history">

            <div className="aura-history-search">
              <Search size={13} />

              <input
                value={historySearch}
                onChange={(e) =>
                  setHistorySearch(
                    e.target.value
                  )
                }
                placeholder="Buscar conversas"
                aria-label="Buscar conversas"
              />
            </div>

            {historyGroups.length === 0 && (
              <p className="aura-history-empty">
                Nenhuma conversa encontrada.
              </p>
            )}

            {historyGroups.map(
              (group) => (
                <div
                  className="aura-history-group"
                  key={group.label}
                >
                  <div className="aura-history-group-label">
                    {group.label}
                  </div>

                  {group.items.map(
                    (conv) => (
                      <button
                        key={conv.id}
                        type="button"
                        className={`aura-history-item ${
                          activeConversationId ===
                          conv.id
                            ? "aura-history-item-active"
                            : ""
                        }`}
                        onClick={() =>
                          openConversation(
                            conv.id
                          )
                        }
                      >
                        <div className="aura-history-item-body">

                          <div className="aura-history-item-title">
                            {conv.title}
                          </div>

                          <div className="aura-history-item-meta">
                            {conv.messageCount}{" "}
                            mensagens ·{" "}
                            {formatRelativeTime(
                              conv.updatedAt
                            )}
                          </div>
                        </div>

                        <div className="aura-history-item-actions">

                          <span
                            className="aura-history-action-btn"
                            role="button"
                            tabIndex={0}
                            aria-label="Renomear conversa"
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                          >
                            <Pencil size={12} />
                          </span>

                          <span
                            className="aura-history-action-btn"
                            role="button"
                            tabIndex={0}
                            aria-label="Excluir conversa"
                            onClick={(e) =>
                              e.stopPropagation()
                            }
                          >
                            <Trash2 size={12} />
                          </span>

                        </div>
                      </button>
                    )
                  )}
                </div>
              )
            )}
          </div>

          <div className="aura-sidebar-bottom">

            <button
              type="button"
              className="aura-plan-card"
            >
              <div className="aura-plan-icon">
                <Crown
                  size={13}
                  strokeWidth={2}
                />
              </div>

              <div className="aura-plan-text">
                <div className="aura-plan-title">
                  Plano Estudante
                </div>

                <div className="aura-plan-sub">
                  Mais recursos para o seu
                  aprendizado.
                </div>
              </div>

              <ChevronRight
                size={15}
                className="aura-plan-chevron"
              />
            </button>

            <button
              type="button"
              className="aura-user-row"
            >
              <div className="aura-user-avatar">
                <User
                  size={15}
                  strokeWidth={2}
                />
              </div>

              <div className="aura-user-info">
                <div className="aura-user-name">
                  Aluno(a)
                </div>

                <div className="aura-user-handle">
                  @educacube
                </div>
              </div>

              <ChevronRight
                size={15}
                className="aura-user-chevron"
              />
            </button>

          </div>
        </aside>

        {/* ================================================= */}
        {/* MAIN                                               */}
        {/* ================================================= */}

        <main className="aura-main">

          <header className="aura-header">

            <div className="aura-header-left">

              <button
                type="button"
                className="aura-menu-button"
                onClick={() =>
                  setSidebarOpen(true)
                }
                aria-label="Abrir menu"
              >
                <Menu size={16} />
              </button>

              {/* LOGO DA AURA NO LUGAR DO ORB */}

              <div className="aura-header-logo-slot">
                <img
                  src="/logoIA.png"
                  alt="AURA"
                  className="aura-header-logo"
                />
              </div>

              <div>
                <div className="aura-header-title-row">
                  <h1>AURA</h1>

                  <span
                    className="aura-status-pill"
                    data-state={auraState}
                  >
                    <span className="aura-status-dot" />
                    {
                      AURA_STATE_LABEL[
                        auraState
                      ]
                    }
                  </span>
                </div>

                <p className="aura-header-sub">
                  Inteligência educacional
                  do EducaCube.
                </p>
              </div>

            </div>

            <div className="aura-header-actions">

              <div className="aura-tooltip-wrap">

                <button
                  type="button"
                  className="aura-icon-button"
                  data-tooltip="Nova conversa"
                  aria-label="Nova conversa"
                  onClick={
                    startNewConversation
                  }
                >
                  <Plus
                    size={16}
                    strokeWidth={1.9}
                  />
                </button>

              </div>

            </div>

          </header>

          <section className="aura-chat-section">

            {!hasConversation ? (

              <div className="aura-welcome">

                <div className="aura-welcome-orb">
                  <NeuralOrb
                    state={auraState}
                    size={68}
                    audioLevel={audioLevel}
                  />
                </div>

                <div className="aura-welcome-eyebrow">
                  EDUCACUBE
                </div>

                <h2>
                  A inteligência educacional
                  <br />
                  do <em>EducaCube</em>, à sua
                  disposição.
                </h2>

                <p className="aura-welcome-sub">
                  Explique conceitos, construa
                  exercícios, estruture aulas e
                  organize pesquisas — com a
                  profundidade que o estudo
                  pedagógico exige.
                </p>

                <div className="aura-suggestions">

                  {SUGGESTIONS.map(
                    (suggestion) => {
                      const Icon =
                        suggestion.icon;

                      return (
                        <button
                          key={
                            suggestion.id
                          }
                          type="button"
                          className="aura-suggestion-row"
                          onClick={() =>
                            sendMessage(
                              suggestion.prompt
                            )
                          }
                        >
                          <div className="aura-suggestion-icon">
                            <Icon
                              size={15}
                              strokeWidth={1.8}
                            />
                          </div>

                          <div className="aura-suggestion-copy">
                            {suggestion.label}
                            <span>
                              {
                                suggestion.detail
                              }
                            </span>
                          </div>

                          <ChevronRight
                            size={15}
                            className="aura-suggestion-arrow"
                          />
                        </button>
                      );
                    }
                  )}

                </div>

              </div>

            ) : (

              <div
                className="aura-messages-scroll"
                ref={scrollRef}
                onScroll={
                  handleMessagesScroll
                }
              >

                <div className="aura-messages">

                  {messages.map(
                    (message) => {

                      if (
                        message.role ===
                        "user"
                      ) {
                        return (
                          <div
                            key={message.id}
                            className="aura-message-row aura-message-row-user"
                          >
                            <div className="aura-message-bubble aura-user-message">
                              {
                                message.content
                              }
                            </div>
                          </div>
                        );
                      }

                      if (
                        message.status ===
                        "error"
                      ) {
                        return (
                          <div
                            key={message.id}
                            className="aura-error-row"
                          >
                            <AlertTriangle
                              size={15}
                            />

                            <span>
                              Não consegui
                              concluir essa
                              resposta.
                            </span>

                            <button
                              type="button"
                              className="aura-retry-btn"
                              onClick={
                                retryLastMessage
                              }
                            >
                              Tentar novamente
                            </button>
                          </div>
                        );
                      }

                      const isSpeaking =
                        speakingMessageId ===
                        message.id;

                      return (
                        <div
                          key={message.id}
                          className="aura-message-row"
                        >
                          <div className="aura-assistant-block">

                            <div className="aura-assistant-marker">
                              <span className="aura-assistant-marker-dot" />
                              <span className="aura-assistant-marker-label">
                                AURA
                              </span>
                            </div>

                            <div className="aura-assistant-content">
                              {renderAuraMarkdown(
                                message.content
                              )}
                            </div>

                            <div className="aura-message-actions">

                              <div className="aura-tooltip-wrap">
                                <button
                                  type="button"
                                  className="aura-msg-action-btn"
                                  data-tooltip="Copiar"
                                  onClick={() =>
                                    copyMessage(
                                      message
                                    )
                                  }
                                >
                                  <Copy size={12} />

                                  {copiedMessageId ===
                                    message.id && (
                                    <span className="aura-copy-toast">
                                      Copiado
                                    </span>
                                  )}
                                </button>
                              </div>

                              <div className="aura-tooltip-wrap">
                                <button
                                  type="button"
                                  className="aura-msg-action-btn"
                                  data-tooltip="Regenerar"
                                  onClick={() =>
                                    regenerate(
                                      message.id
                                    )
                                  }
                                >
                                  <RotateCcw
                                    size={12}
                                  />
                                </button>
                              </div>

                              <div className="aura-tooltip-wrap">
                                <button
                                  type="button"
                                  className="aura-msg-action-btn"
                                  data-tooltip={
                                    isSpeaking
                                      ? "Parar"
                                      : "Ouvir"
                                  }
                                  data-active={
                                    isSpeaking
                                  }
                                  onClick={() =>
                                    toggleSpeak(
                                      message
                                    )
                                  }
                                >
                                  {isSpeaking ? (
                                    <VolumeX
                                      size={12}
                                    />
                                  ) : (
                                    <Volume2
                                      size={12}
                                    />
                                  )}
                                </button>
                              </div>

                            </div>
                          </div>
                        </div>
                      );
                    }
                  )}

                  {auraState ===
                    "thinking" && (
                    <div className="aura-thinking-row">

                      <NeuralOrb
                        state="thinking"
                        size={22}
                      />

                      <span className="aura-thinking-label">
                        AURA está pensando
                      </span>

                      <span className="aura-thinking-dots">
                        <span />
                        <span />
                        <span />
                      </span>

                    </div>
                  )}

                </div>

                {showScrollToLatest && (
                  <button
                    type="button"
                    className="aura-scroll-latest"
                    onClick={
                      scrollToLatest
                    }
                  >
                    <ChevronDown
                      size={13}
                    />
                    Nova resposta
                  </button>
                )}

              </div>
            )}

            {/* ============================================= */}
            {/* COMPOSER                                       */}
            {/* ============================================= */}

            <div className="aura-input-area">

              {attachments.length > 0 && (
                <div className="aura-attachments-row">

                  {attachments.map(
                    (file) => (
                      <div
                        key={file.id}
                        className="aura-attachment-chip"
                      >
                        <Paperclip
                          size={12}
                        />

                        <span className="aura-attachment-name">
                          {file.name}
                        </span>

                        <span className="aura-attachment-size">
                          {formatBytes(
                            file.size
                          )}
                        </span>

                        <button
                          type="button"
                          className="aura-attachment-remove"
                          aria-label={`Remover ${file.name}`}
                          onClick={() =>
                            setAttachments(
                              (prev) =>
                                prev.filter(
                                  (f) =>
                                    f.id !==
                                    file.id
                                )
                            )
                          }
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )
                  )}

                </div>
              )}

              <div
                className="aura-input-wrapper"
                data-dragover={isDragOver}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() =>
                  setIsDragOver(false)
                }
                onDrop={handleDrop}
              >

                {isDragOver && (
                  <div className="aura-drop-overlay">
                    <Paperclip
                      size={15}
                    />
                    Solte para anexar
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  hidden
                  onChange={
                    handleFileInputChange
                  }
                />

                <div className="aura-tooltip-wrap">

                  <button
                    type="button"
                    className="aura-composer-btn"
                    data-tooltip="Anexar arquivo"
                    aria-label="Anexar arquivo"
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                  >
                    <Paperclip
                      size={16}
                      strokeWidth={1.8}
                    />
                  </button>

                </div>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) =>
                    setInput(
                      event.target.value
                    )
                  }
                  onKeyDown={handleKeyDown}
                  placeholder={
                    isOnline
                      ? "Pergunte, peça um resumo ou uma sequência didática..."
                      : "Sem conexão no momento..."
                  }
                  rows={1}
                  className="aura-textarea"
                  disabled={!isOnline}
                />

                <div className="aura-tooltip-wrap">

                  <button
                    type="button"
                    className={`aura-composer-btn ${
                      micActive
                        ? "aura-mic-listening"
                        : ""
                    }`}
                    data-tooltip={
                      micActive
                        ? "Parar escuta"
                        : "Falar com a AURA"
                    }
                    data-active={
                      micActive
                    }
                    aria-label="Ativar microfone"
                    onClick={toggleMic}
                  >
                    <Mic
                      size={16}
                      strokeWidth={1.8}
                    />
                  </button>

                </div>

                {isBusy ? (

                  <button
                    type="button"
                    className="aura-send-button"
                    data-mode="stop"
                    aria-label="Parar geração"
                    onClick={
                      handleStopGenerating
                    }
                  >
                    <Square
                      size={13}
                      fill="currentColor"
                    />
                  </button>

                ) : (

                  <button
                    type="button"
                    onClick={() =>
                      sendMessage(input)
                    }
                    disabled={
                      !input.trim() ||
                      !isOnline
                    }
                    className="aura-send-button"
                    aria-label="Enviar mensagem"
                  >
                    <Send
                      size={15}
                      strokeWidth={2}
                    />
                  </button>

                )}

              </div>

              <p className="aura-composer-meta">

                {isOnline ? (
                  <>
                    <ShieldCheck
                      size={11}
                      strokeWidth={2}
                    />

                    <span>AURA IA</span>

                    <span className="aura-composer-dot">
                      •
                    </span>

                    <span>
                      Educacube
                    </span>
                  </>
                ) : (
                  <span
                    className="aura-conn-indicator"
                    data-online="false"
                  >
                    <WifiOff size={11} />
                    Sem conexão — as
                    mensagens serão enviadas
                    ao reconectar.
                  </span>
                )}

              </p>

            </div>
          </section>
        </main>
      </div>
    </div>
  );
}



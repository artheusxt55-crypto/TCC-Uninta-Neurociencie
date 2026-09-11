import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type DragEvent,
  type KeyboardEvent,
  type ReactNode,
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
  Search,
  Pin,
  Pencil,
  Trash2,
  MoreHorizontal,
  Menu,
  X,
  Copy,
  Check,
  RotateCcw,
  ChevronDown,
  Volume2,
  VolumeX,
  ThumbsUp,
  ThumbsDown,
  ArrowDown,
  WifiOff,
  AlertTriangle,
} from "lucide-react";

import NeuralOrb, { type AuraState } from "../components/NeuralOrb";
import "../styles/aura-ai.css";

/* ================================================================
   TYPES
   ================================================================ */

interface NavItem {
  id: string;
  label: string;
  icon: typeof MessageCircle;
}

interface Suggestion {
  id: string;
  label: string;
  prompt: string;
}

interface AttachmentFile {
  id: string;
  name: string;
  size: number;
  type: string;
}

interface AuraMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: number;
}

interface ConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  updatedAt: number;
  pinned?: boolean;
}

/* ================================================================
   STATIC DATA
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
    label: "Explicar um conceito",
    prompt: "Explique Piaget de forma simples.",
  },
  {
    id: "exercicios",
    label: "Criar exercícios",
    prompt: "Crie 10 questões sobre a BNCC.",
  },
  {
    id: "resumir",
    label: "Resumir um artigo",
    prompt: "Resuma este artigo acadêmico para mim.",
  },
  {
    id: "plano",
    label: "Estruturar uma aula",
    prompt: "Transforme este texto em um plano de aula.",
  },
  {
    id: "comparar",
    label: "Comparar teorias",
    prompt: "Compare duas teorias pedagógicas.",
  },
  {
    id: "sequencia",
    label: "Sequência didática",
    prompt: "Crie uma sequência didática sobre frações.",
  },
];

const MOCK_CONVERSATIONS: ConversationSummary[] = [
  {
    id: "c1",
    title: "Plano de aula — frações",
    messageCount: 14,
    updatedAt: Date.now() - 1000 * 60 * 40,
    pinned: true,
  },
  {
    id: "c2",
    title: "Resumo de Vygotsky",
    messageCount: 6,
    updatedAt: Date.now() - 1000 * 60 * 60 * 3,
  },
  {
    id: "c3",
    title: "Exercícios sobre BNCC",
    messageCount: 22,
    updatedAt: Date.now() - 1000 * 60 * 60 * 26,
  },
  {
    id: "c4",
    title: "Comparação Piaget x Vygotsky",
    messageCount: 9,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 4,
  },
  {
    id: "c5",
    title: "Sequência didática — leitura",
    messageCount: 17,
    updatedAt: Date.now() - 1000 * 60 * 60 * 24 * 12,
  },
];

const PLACEHOLDER_RESPONSE = `**Conceito**
Aprendizagem significativa é quando um novo conteúdo se conecta ao que o estudante já sabe, em vez de ser memorizado isoladamente.

**Como funciona**
- O conhecimento prévio funciona como uma "âncora" para a nova informação.
- Quanto mais relações o estudante consegue construir, mais duradoura é a aprendizagem.
- O papel do professor é criar pontes entre o familiar e o novo.

**Aplicação pedagógica**
Antes de introduzir um conteúdo, pergunte o que a turma já sabe sobre o tema e parta desse repertório.

> "Se eu tivesse que reduzir toda a psicologia educacional a um único princípio, diria isto: o fator isolado mais importante que influencia a aprendizagem é aquilo que o aluno já sabe." — David Ausubel`;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupLabel(ts: number): string {
  const now = new Date();
  const date = new Date(ts);

  const startOfDay = (d: Date) =>
    new Date(
      d.getFullYear(),
      d.getMonth(),
      d.getDate()
    ).getTime();

  const diffDays = Math.round(
    (startOfDay(now) - startOfDay(date)) / 86400000
  );

  if (diffDays <= 0) return "Hoje";
  if (diffDays === 1) return "Ontem";
  if (diffDays <= 7) return "Últimos 7 dias";

  return "Anteriores";
}

const GROUP_ORDER = [
  "Hoje",
  "Ontem",
  "Últimos 7 dias",
  "Anteriores",
];

/* ================================================================
   LIGHTWEIGHT MARKDOWN RENDERING
   ================================================================ */

function renderInline(
  text: string,
  keyPrefix: string
): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern =
    /(\*\*.+?\*\*|`.+?`|\[.+?\]\(.+?\))/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(
        text.slice(lastIndex, match.index)
      );
    }

    const token = match[0];

    if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${keyPrefix}-b-${i}`}>
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={`${keyPrefix}-c-${i}`}
          className="aura-inline-code"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else {
      const linkMatch =
        /\[(.+?)\]\((.+?)\)/.exec(token);

      if (linkMatch) {
        nodes.push(
          <a
            key={`${keyPrefix}-l-${i}`}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="aura-inline-link"
          >
            {linkMatch[1]}
          </a>
        );
      }
    }

    lastIndex = match.index + token.length;
    i += 1;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

function renderMarkdown(content: string): ReactNode {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];

  let i = 0;
  let blockIndex = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim() === "") {
      i += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const code: string[] = [];

      i += 1;

      while (
        i < lines.length &&
        !lines[i].startsWith("```")
      ) {
        code.push(lines[i]);
        i += 1;
      }

      i += 1;

      blocks.push(
        <pre
          key={`b-${blockIndex++}`}
          className="aura-code-block"
        >
          <code>{code.join("\n")}</code>
        </pre>
      );

      continue;
    }

    if (/^#{1,3}\s/.test(line)) {
      const level =
        line.match(/^#{1,3}/)?.[0].length ?? 1;

      const text = line.replace(
        /^#{1,3}\s/,
        ""
      );

      const Tag = (
        level === 1
          ? "h3"
          : level === 2
            ? "h4"
            : "h5"
      ) as keyof JSX.IntrinsicElements;

      blocks.push(
        <Tag
          key={`b-${blockIndex++}`}
          className="aura-md-heading"
        >
          {renderInline(
            text,
            `h-${blockIndex}`
          )}
        </Tag>
      );

      i += 1;
      continue;
    }

    if (line.startsWith(">")) {
      const quote: string[] = [];

      while (
        i < lines.length &&
        lines[i].startsWith(">")
      ) {
        quote.push(
          lines[i].replace(/^>\s?/, "")
        );

        i += 1;
      }

      blocks.push(
        <blockquote
          key={`b-${blockIndex++}`}
          className="aura-md-quote"
        >
          {renderInline(
            quote.join(" "),
            `q-${blockIndex}`
          )}
        </blockquote>
      );

      continue;
    }

    if (/^[-*]\s/.test(line)) {
      const items: string[] = [];

      while (
        i < lines.length &&
        /^[-*]\s/.test(lines[i])
      ) {
        items.push(
          lines[i].replace(/^[-*]\s/, "")
        );

        i += 1;
      }

      blocks.push(
        <ul
          key={`b-${blockIndex++}`}
          className="aura-md-list"
        >
          {items.map((item, idx) => (
            <li key={idx}>
              {renderInline(
                item,
                `ul-${blockIndex}-${idx}`
              )}
            </li>
          ))}
        </ul>
      );

      continue;
    }

    if (/^\d+\.\s/.test(line)) {
      const items: string[] = [];

      while (
        i < lines.length &&
        /^\d+\.\s/.test(lines[i])
      ) {
        items.push(
          lines[i].replace(/^\d+\.\s/, "")
        );

        i += 1;
      }

      blocks.push(
        <ol
          key={`b-${blockIndex++}`}
          className="aura-md-list"
        >
          {items.map((item, idx) => (
            <li key={idx}>
              {renderInline(
                item,
                `ol-${blockIndex}-${idx}`
              )}
            </li>
          ))}
        </ol>
      );

      continue;
    }

    const paragraph: string[] = [line];

    i += 1;

    while (
      i < lines.length &&
      lines[i].trim() !== "" &&
      !/^(#{1,3}\s|[-*]\s|\d+\.\s|>|```)/.test(
        lines[i]
      )
    ) {
      paragraph.push(lines[i]);
      i += 1;
    }

    blocks.push(
      <p
        key={`b-${blockIndex++}`}
        className="aura-md-paragraph"
        style={{
          animationDelay: `${blockIndex * 45}ms`,
        }}
      >
        {renderInline(
          paragraph.join(" "),
          `p-${blockIndex}`
        )}
      </p>
    );
  }

  return blocks;
}

/* ================================================================
   COMPONENT
   ================================================================ */

export default function AuraEducacube() {
  const [activeNav, setActiveNav] = useState("chat");

  const [messages, setMessages] =
    useState<AuraMessage[]>([]);

  const [input, setInput] = useState("");

  const [attachments, setAttachments] =
    useState<AttachmentFile[]>([]);

  const [isDraggingFile, setIsDraggingFile] =
    useState(false);

  const [isMicActive, setIsMicActive] =
    useState(false);

  const [auraState, setAuraState] =
    useState<AuraState>("idle");

  const [connection, setConnection] =
    useState<"online" | "offline">("online");

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [historyQuery, setHistoryQuery] =
    useState("");

  const [conversations, setConversations] =
    useState<ConversationSummary[]>(
      MOCK_CONVERSATIONS
    );

  const [openMenuId, setOpenMenuId] =
    useState<string | null>(null);

  const [renamingId, setRenamingId] =
    useState<string | null>(null);

  const [renameValue, setRenameValue] =
    useState("");

  const [copiedId, setCopiedId] =
    useState<string | null>(null);

  const [isNearBottom, setIsNearBottom] =
    useState(true);

  const [speakingId, setSpeakingId] =
    useState<string | null>(null);

  const textareaRef =
    useRef<HTMLTextAreaElement>(null);

  const scrollRef =
    useRef<HTMLDivElement>(null);

  const generationTimeouts =
    useRef<number[]>([]);

  const hasConversation =
    messages.length > 0;

  const isBusy =
    auraState === "sending" ||
    auraState === "thinking" ||
    auraState === "generating";

  const canSend =
    (input.trim().length > 0 ||
      attachments.length > 0) &&
    !isBusy &&
    connection === "online";

  useEffect(() => {
    const el = textareaRef.current;

    if (!el) return;

    el.style.height = "auto";

    el.style.height = `${Math.min(
      el.scrollHeight,
      160
    )}px`;
  }, [input]);

  useEffect(() => {
    const container = scrollRef.current;

    if (!container) return;

    if (isNearBottom) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isNearBottom]);

  function handleScroll() {
    const container = scrollRef.current;

    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    setIsNearBottom(
      distanceFromBottom < 120
    );
  }

  useEffect(() => {
    document.body.style.overflow =
      sidebarOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    function onKeyDown(
      event: globalThis.KeyboardEvent
    ) {
      if (event.key === "Escape") {
        setSidebarOpen(false);
        setOpenMenuId(null);
      }

      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();

        setMessages([]);
        setInput("");
        setAttachments([]);
        setAuraState("idle");

        textareaRef.current?.focus();
      }
    }

    window.addEventListener(
      "keydown",
      onKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        onKeyDown
      );
  }, []);

  useEffect(() => {
    function handleOnline() {
      setConnection("online");
    }

    function handleOffline() {
      setConnection("offline");
    }

    window.addEventListener(
      "online",
      handleOnline
    );

    window.addEventListener(
      "offline",
      handleOffline
    );

    setConnection(
      navigator.onLine
        ? "online"
        : "offline"
    );

    return () => {
      window.removeEventListener(
        "online",
        handleOnline
      );

      window.removeEventListener(
        "offline",
        handleOffline
      );
    };
  }, []);

  useEffect(() => {
    return () => {
      generationTimeouts.current.forEach(
        (id) => window.clearTimeout(id)
      );
    };
  }, []);

  function sendMessage(text: string) {
    const trimmed = text.trim();

    if (
      !trimmed &&
      attachments.length === 0
    ) {
      return;
    }

    if (connection === "offline") {
      return;
    }

    const userMessage: AuraMessage = {
      id: generateId(),
      role: "user",
      content: trimmed,
      createdAt: Date.now(),
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setInput("");
    setAttachments([]);
    setIsNearBottom(true);
    setAuraState("sending");

    const t1 = window.setTimeout(
      () => setAuraState("thinking"),
      350
    );

    const t2 = window.setTimeout(
      () => setAuraState("generating"),
      1100
    );

    const t3 = window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content: PLACEHOLDER_RESPONSE,
          createdAt: Date.now(),
        },
      ]);

      setAuraState("complete");

      const t4 = window.setTimeout(
        () => setAuraState("idle"),
        900
      );

      generationTimeouts.current.push(t4);
    }, 2000);

    generationTimeouts.current.push(
      t1,
      t2,
      t3
    );
  }

  function cancelGeneration() {
    generationTimeouts.current.forEach(
      (id) => window.clearTimeout(id)
    );

    generationTimeouts.current = [];

    setAuraState("idle");
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

  function handleCopy(message: AuraMessage) {
    navigator.clipboard
      ?.writeText(message.content)
      .catch(() => undefined);

    setCopiedId(message.id);

    window.setTimeout(() => {
      setCopiedId((current) =>
        current === message.id
          ? null
          : current
      );
    }, 1600);
  }

  function handleRegenerate(
    messageId: string
  ) {
    setAuraState("thinking");

    const t = window.setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                content:
                  PLACEHOLDER_RESPONSE,
                createdAt: Date.now(),
              }
            : m
        )
      );

      setAuraState("idle");
    }, 900);

    generationTimeouts.current.push(t);
  }

  function handleContinue(
    messageId: string
  ) {
    setAuraState("generating");

    const t = window.setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? {
                ...m,
                content:
                  m.content +
                  "\n\n**Ponto-chave**\nConectar o novo conteúdo ao repertório da turma reduz o esquecimento e aumenta o engajamento.",
              }
            : m
        )
      );

      setAuraState("idle");
    }, 700);

    generationTimeouts.current.push(t);
  }

  function handleToggleSpeak(
    messageId: string
  ) {
    if (speakingId === messageId) {
      setSpeakingId(null);
      setAuraState("idle");
    } else {
      setSpeakingId(messageId);
      setAuraState("speaking");
    }
  }

  function handleToggleMic() {
    setIsMicActive((prev) => {
      const next = !prev;

      setAuraState(
        next ? "listening" : "idle"
      );

      return next;
    });
  }

  function handleFiles(
    fileList: FileList | null
  ) {
    if (!fileList) return;

    const next: AttachmentFile[] =
      Array.from(fileList).map((file) => ({
        id: generateId(),
        name: file.name,
        size: file.size,
        type: file.type || "arquivo",
      }));

    setAttachments((prev) => [
      ...prev,
      ...next,
    ]);
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setIsDraggingFile(false);

    handleFiles(
      event.dataTransfer.files
    );
  }

  const filteredConversations =
    useMemo(() => {
      const query =
        historyQuery
          .trim()
          .toLowerCase();

      const filtered = query
        ? conversations.filter((c) =>
            c.title
              .toLowerCase()
              .includes(query)
          )
        : conversations;

      return [...filtered].sort(
        (a, b) => {
          if (
            !!a.pinned !==
            !!b.pinned
          ) {
            return a.pinned ? -1 : 1;
          }

          return (
            b.updatedAt -
            a.updatedAt
          );
        }
      );
    }, [
      conversations,
      historyQuery,
    ]);

  const groupedConversations =
    useMemo(() => {
      const groups = new Map<
        string,
        ConversationSummary[]
      >();

      filteredConversations.forEach(
        (c) => {
          const label = c.pinned
            ? "Fixadas"
            : groupLabel(c.updatedAt);

          const list =
            groups.get(label) ?? [];

          list.push(c);
          groups.set(label, list);
        }
      );

      const order = [
        "Fixadas",
        ...GROUP_ORDER,
      ];

      return order
        .filter((label) =>
          groups.has(label)
        )
        .map((label) => ({
          label,
          items:
            groups.get(label) as ConversationSummary[],
        }));
    }, [
      filteredConversations,
    ]);

  function togglePin(id: string) {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              pinned: !c.pinned,
            }
          : c
      )
    );

    setOpenMenuId(null);
  }

  function deleteConversation(
    id: string
  ) {
    setConversations((prev) =>
      prev.filter(
        (c) => c.id !== id
      )
    );

    setOpenMenuId(null);
  }

  function startRename(
    conversation: ConversationSummary
  ) {
    setRenamingId(
      conversation.id
    );

    setRenameValue(
      conversation.title
    );

    setOpenMenuId(null);
  }

  function commitRename(
    id: string
  ) {
    const value =
      renameValue.trim();

    if (value) {
      setConversations((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                title: value,
              }
            : c
        )
      );
    }

    setRenamingId(null);
  }

  return (
    <div className="aura-page">
      {sidebarOpen && (
        <button
          type="button"
          className="aura-overlay"
          aria-label="Fechar menu"
          onClick={() =>
            setSidebarOpen(false)
          }
        />
      )}

      <div className="aura-layout">
        <aside
          className={`aura-sidebar ${
            sidebarOpen
              ? "aura-sidebar-open"
              : ""
          }`}
        >
          <div className="aura-brand">
            <div className="aura-brand-mark">
              <Box
                size={24}
                strokeWidth={1.6}
              />
            </div>

            <div className="aura-brand-name">
              Educa<span>cube</span>
            </div>

            <button
              type="button"
              className="aura-sidebar-close"
              aria-label="Fechar menu"
              onClick={() =>
                setSidebarOpen(false)
              }
            >
              <X
                size={18}
                strokeWidth={1.8}
              />
            </button>
          </div>

          <nav
            className="aura-nav"
            aria-label="Navegação principal"
          >
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeNav === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveNav(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`aura-nav-item ${
                    isActive
                      ? "aura-nav-item-active"
                      : ""
                  }`}
                  aria-current={
                    isActive
                      ? "page"
                      : undefined
                  }
                >
                  <Icon
                    size={17}
                    strokeWidth={1.8}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="aura-history">
            <div className="aura-history-search">
              <Search
                size={14}
                strokeWidth={1.9}
              />

              <input
                type="text"
                value={historyQuery}
                onChange={(event) =>
                  setHistoryQuery(
                    event.target.value
                  )
                }
                placeholder="Buscar conversas"
                aria-label="Buscar conversas"
              />
            </div>

            <div className="aura-history-scroll">
              {groupedConversations.length ===
                0 && (
                <p className="aura-history-empty">
                  Nenhuma conversa encontrada.
                </p>
              )}

              {groupedConversations.map(
                (group) => (
                  <div
                    key={group.label}
                    className="aura-history-group"
                  >
                    <span className="aura-history-group-label">
                      {group.label}
                    </span>

                    {group.items.map(
                      (conversation) => (
                        <div
                          key={conversation.id}
                          className="aura-history-item"
                        >
                          {renamingId ===
                          conversation.id ? (
                            <input
                              autoFocus
                              className="aura-history-rename-input"
                              value={renameValue}
                              onChange={(event) =>
                                setRenameValue(
                                  event.target
                                    .value
                                )
                              }
                              onBlur={() =>
                                commitRename(
                                  conversation.id
                                )
                              }
                              onKeyDown={(event) => {
                                if (
                                  event.key ===
                                  "Enter"
                                ) {
                                  commitRename(
                                    conversation.id
                                  );
                                }

                                if (
                                  event.key ===
                                  "Escape"
                                ) {
                                  setRenamingId(
                                    null
                                  );
                                }
                              }}
                            />
                          ) : (
                            <button
                              type="button"
                              className="aura-history-item-button"
                            >
                              <span className="aura-history-item-title">
                                {
                                  conversation.title
                                }
                              </span>

                              <span className="aura-history-item-meta">
                                {
                                  conversation.messageCount
                                }{" "}
                                mensagens ·{" "}
                                {formatTime(
                                  conversation.updatedAt
                                )}
                              </span>
                            </button>
                          )}

                          <div className="aura-history-item-actions">
                            <button
                              type="button"
                              className="aura-history-icon-button"
                              aria-label="Mais ações"
                              onClick={() =>
                                setOpenMenuId(
                                  (current) =>
                                    current ===
                                    conversation.id
                                      ? null
                                      : conversation.id
                                )
                              }
                            >
                              <MoreHorizontal
                                size={15}
                                strokeWidth={1.9}
                              />
                            </button>

                            {openMenuId ===
                              conversation.id && (
                              <div
                                className="aura-history-menu"
                                role="menu"
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    togglePin(
                                      conversation.id
                                    )
                                  }
                                >
                                  <Pin
                                    size={13}
                                    strokeWidth={1.9}
                                  />

                                  {conversation.pinned
                                    ? "Desafixar"
                                    : "Fixar"}
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    startRename(
                                      conversation
                                    )
                                  }
                                >
                                  <Pencil
                                    size={13}
                                    strokeWidth={1.9}
                                  />
                                  Renomear
                                </button>

                                <button
                                  type="button"
                                  className="aura-history-menu-danger"
                                  onClick={() =>
                                    deleteConversation(
                                      conversation.id
                                    )
                                  }
                                >
                                  <Trash2
                                    size={13}
                                    strokeWidth={1.9}
                                  />
                                  Excluir
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )
              )}
            </div>
          </div>

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
              size={16}
              className="aura-plan-chevron"
            />
          </button>

          <div className="aura-sidebar-divider" />

          <button
            type="button"
            className="aura-user-row"
          >
            <div className="aura-user-avatar">
              <User
                size={16}
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
              size={16}
              className="aura-user-chevron"
            />
          </button>
        </aside>

        <main className="aura-main">
          <header className="aura-header">
            <div className="aura-header-left">
              <button
                type="button"
                className="aura-menu-button"
                aria-label="Abrir menu"
                onClick={() =>
                  setSidebarOpen(true)
                }
              >
                <Menu
                  size={19}
                  strokeWidth={1.8}
                />
              </button>

              <div>
                <div className="aura-header-title-row">
                  <h1>AURA</h1>

                  <span className="aura-beta-badge">
                    Beta
                  </span>
                </div>

                <p className="aura-header-sub">
                  Inteligência educacional do
                  EducaCube
                </p>
              </div>
            </div>

            <div className="aura-header-right">
              {connection === "offline" ? (
                <span
                  className="aura-connection aura-connection-offline"
                  title="Sem conexão"
                >
                  <WifiOff
                    size={13}
                    strokeWidth={2}
                  />
                  Offline
                </span>
              ) : (
                <span
                  className="aura-connection"
                  aria-hidden="true"
                >
                  <NeuralOrb
                    state={auraState}
                    size={30}
                  />
                </span>
              )}
            </div>
          </header>

          <section className="aura-chat-section">
            {!hasConversation ? (
              <div className="aura-welcome">
                <div className="aura-welcome-grid">
                  <div className="aura-welcome-lead-col">
                    <div className="aura-welcome-mark">
                      <NeuralOrb
                        state="idle"
                        size={72}
                      />
                    </div>

                    <span className="aura-welcome-kicker">
                      AURA · EducaCube
                    </span>

                    <h2 className="aura-welcome-headline">
                      A inteligência do
                      EducaCube, pronta para
                      pensar com você.
                    </h2>

                    <p className="aura-welcome-sub">
                      Explique conceitos,
                      estruture aulas, crie
                      exercícios e organize
                      conhecimento pedagógico
                      — com a profundidade que a
                      educação exige.
                    </p>
                  </div>

                  <div
                    className="aura-welcome-commands"
                    role="list"
                    aria-label="Sugestões"
                  >
                    {SUGGESTIONS.map(
                      (suggestion) => (
                        <button
                          key={suggestion.id}
                          type="button"
                          role="listitem"
                          className="aura-command-row"
                          onClick={() =>
                            sendMessage(
                              suggestion.prompt
                            )
                          }
                        >
                          <span className="aura-command-label">
                            {suggestion.label}
                          </span>

                          <span className="aura-command-prompt">
                            {suggestion.prompt}
                          </span>

                          <ChevronRight
                            size={15}
                            className="aura-command-arrow"
                          />
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="aura-messages-scroll"
                ref={scrollRef}
                onScroll={handleScroll}
              >
                <div className="aura-messages">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`aura-message-row ${
                        message.role === "user"
                          ? "aura-message-row-user"
                          : ""
                      }`}
                    >
                      {message.role ===
                        "assistant" && (
                        <div className="aura-message-marker">
                          <span className="aura-message-marker-dot" />

                          <span className="aura-message-marker-label">
                            AURA
                          </span>

                          <span className="aura-message-marker-time">
                            {formatTime(
                              message.createdAt
                            )}
                          </span>
                        </div>
                      )}

                      <div
                        className={`aura-message-bubble ${
                          message.role === "user"
                            ? "aura-user-message"
                            : "aura-assistant-message"
                        }`}
                      >
                        {message.role ===
                        "assistant" ? (
                          <div className="aura-md">
                            {renderMarkdown(
                              message.content
                            )}
                          </div>
                        ) : (
                          message.content
                        )}
                      </div>

                      {message.role ===
                        "assistant" && (
                        <div className="aura-message-actions">
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(message)
                            }
                            title="Copiar"
                          >
                            {copiedId ===
                            message.id ? (
                              <>
                                <Check
                                  size={13}
                                  strokeWidth={2}
                                />
                                Copiado
                              </>
                            ) : (
                              <>
                                <Copy
                                  size={13}
                                  strokeWidth={1.9}
                                />
                                Copiar
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleRegenerate(
                                message.id
                              )
                            }
                            title="Regenerar resposta"
                          >
                            <RotateCcw
                              size={13}
                              strokeWidth={1.9}
                            />
                            Regenerar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleContinue(
                                message.id
                              )
                            }
                            title="Continuar resposta"
                          >
                            <ChevronDown
                              size={13}
                              strokeWidth={1.9}
                            />
                            Continuar
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleSpeak(
                                message.id
                              )
                            }
                            title={
                              speakingId ===
                              message.id
                                ? "Parar áudio"
                                : "Ouvir"
                            }
                          >
                            {speakingId ===
                            message.id ? (
                              <>
                                <VolumeX
                                  size={13}
                                  strokeWidth={1.9}
                                />
                                Parar
                              </>
                            ) : (
                              <>
                                <Volume2
                                  size={13}
                                  strokeWidth={1.9}
                                />
                                Ouvir
                              </>
                            )}
                          </button>

                          <span className="aura-message-actions-divider" />

                          <button
                            type="button"
                            aria-label="Resposta útil"
                            title="Resposta útil"
                          >
                            <ThumbsUp
                              size={13}
                              strokeWidth={1.9}
                            />
                          </button>

                          <button
                            type="button"
                            aria-label="Resposta não útil"
                            title="Resposta não útil"
                          >
                            <ThumbsDown
                              size={13}
                              strokeWidth={1.9}
                            />
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {auraState ===
                    "thinking" && (
                    <div className="aura-message-row">
                      <div className="aura-message-marker">
                        <span className="aura-message-marker-dot" />

                        <span className="aura-message-marker-label">
                          AURA
                        </span>
                      </div>

                      <div
                        className="aura-thinking-indicator"
                        aria-live="polite"
                      >
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                  )}

                  {auraState === "error" && (
                    <div className="aura-message-row">
                      <div className="aura-error-banner">
                        <AlertTriangle
                          size={14}
                          strokeWidth={2}
                        />

                        Não consegui concluir
                        essa resposta.

                        <button
                          type="button"
                          onClick={() =>
                            sendMessage(
                              messages[
                                messages.length - 1
                              ]?.content ?? ""
                            )
                          }
                        >
                          Tentar novamente
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {!isNearBottom && (
                  <button
                    type="button"
                    className="aura-scroll-jump"
                    onClick={() => {
                      setIsNearBottom(true);

                      scrollRef.current?.scrollTo({
                        top: scrollRef.current.scrollHeight,
                        behavior: "smooth",
                      });
                    }}
                  >
                    <ArrowDown
                      size={14}
                      strokeWidth={2}
                    />
                    Nova resposta
                  </button>
                )}
              </div>
            )}

            <div className="aura-input-area">
              {attachments.length > 0 && (
                <div className="aura-attachments">
                  {attachments.map((file) => (
                    <div
                      key={file.id}
                      className="aura-attachment-chip"
                    >
                      <Paperclip
                        size={12}
                        strokeWidth={1.9}
                      />

                      <span className="aura-attachment-name">
                        {file.name}
                      </span>

                      <span className="aura-attachment-size">
                        {formatBytes(file.size)}
                      </span>

                      <button
                        type="button"
                        aria-label={`Remover ${file.name}`}
                        onClick={() =>
                          setAttachments(
                            (prev) =>
                              prev.filter(
                                (f) =>
                                  f.id !== file.id
                              )
                          )
                        }
                      >
                        <X
                          size={12}
                          strokeWidth={2}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div
                className={`aura-input-wrapper ${
                  isDraggingFile
                    ? "aura-input-wrapper-dragging"
                    : ""
                }`}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDraggingFile(true);
                }}
                onDragLeave={() =>
                  setIsDraggingFile(false)
                }
                onDrop={handleDrop}
              >
                {isDraggingFile && (
                  <div className="aura-drop-zone">
                    <Paperclip
                      size={18}
                      strokeWidth={1.8}
                    />
                    Solte o arquivo para
                    anexar
                  </div>
                )}

                <label
                  className="aura-attach-button"
                  aria-label="Anexar arquivo"
                >
                  <Paperclip
                    size={18}
                    strokeWidth={1.8}
                  />

                  <input
                    type="file"
                    multiple
                    hidden
                    onChange={(event) =>
                      handleFiles(
                        event.target.files
                      )
                    }
                  />
                </label>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(event) =>
                    setInput(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Pergunte, peça um exercício ou envie um conteúdo para analisar..."
                  rows={1}
                  className="aura-textarea"
                  disabled={
                    connection === "offline"
                  }
                />

                <button
                  type="button"
                  onClick={handleToggleMic}
                  className={`aura-mic-button ${
                    isMicActive
                      ? "aura-mic-button-active"
                      : ""
                  }`}
                  aria-label={
                    isMicActive
                      ? "Parar gravação"
                      : "Ativar microfone"
                  }
                  aria-pressed={isMicActive}
                  title={
                    isMicActive
                      ? "Parar gravação"
                      : "Falar com a AURA"
                  }
                >
                  <Mic
                    size={16}
                    strokeWidth={1.9}
                  />
                </button>

                <button
                  type="button"
                  onClick={
                    isBusy
                      ? cancelGeneration
                      : () => sendMessage(input)
                  }
                  disabled={
                    !isBusy && !canSend
                  }
                  className="aura-send-button"
                  aria-label={
                    isBusy
                      ? "Parar geração"
                      : "Enviar mensagem"
                  }
                  title={
                    isBusy ? "Parar" : "Enviar"
                  }
                >
                  {isBusy ? (
                    <Square
                      size={14}
                      strokeWidth={2}
                    />
                  ) : (
                    <Send
                      size={16}
                      strokeWidth={2}
                    />
                  )}
                </button>
              </div>

              <p className="aura-footer-note">
                <span>Enter para enviar</span>

                <span className="aura-footer-dot">
                  •
                </span>

                <span>
                  Shift + Enter para nova linha
                </span>

                <span className="aura-footer-dot">
                  •
                </span>

                <span>
                  AURA IA · Educacube
                </span>
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

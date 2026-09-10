
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
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

interface AuraConversation {
  id: string;
  title: string;
  messages: AuraMessage[];
  updatedAt: number;
}

interface ConversationSummary {
  id: string;
  title: string;
  messageCount: number;
  updatedAt: number;
}

interface SpeechRecognitionResultEvent
  extends Event {
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent
  extends Event {
  error: string;
}

interface SpeechRecognitionInstance {
  lang: string;
  continuous: boolean;
  interimResults: boolean;

  start(): void;
  stop(): void;
  abort(): void;

  onstart:
    | (() => void)
    | null;

  onresult:
    | ((event: SpeechRecognitionResultEvent) => void)
    | null;

  onerror:
    | ((event: SpeechRecognitionErrorEvent) => void)
    | null;

  onend:
    | (() => void)
    | null;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionInstance;
}

interface WindowWithSpeechRecognition
  extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

/* ================================================================
   STATIC CONTENT
   ================================================================ */

const NAV_ITEMS: NavItem[] = [
  {
    id: "chat",
    label: "Chat IA",
    icon: MessageCircle,
  },
  {
    id: "estudos",
    label: "Meus Estudos",
    icon: FileText,
  },
  {
    id: "biblioteca",
    label: "Biblioteca",
    icon: BookOpen,
  },
  {
    id: "provas",
    label: "Provas e Exercícios",
    icon: FilePenLine,
  },
  {
    id: "materiais",
    label: "Materiais",
    icon: Folder,
  },
  {
    id: "config",
    label: "Configurações",
    icon: Settings,
  },
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
   STORAGE
   ================================================================ */

const STORAGE_KEY =
  "educacube_aura_conversations";

/* ================================================================
   HELPERS
   ================================================================ */

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

function generateId(): string {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 9)}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatRelativeTime(
  timestamp: number
): string {
  const diffMs =
    Math.max(0, Date.now() - timestamp);

  if (diffMs < HOUR) {
    return "agora há pouco";
  }

  const diffHours =
    Math.floor(diffMs / HOUR);

  if (diffHours < 24) {
    return `há ${diffHours}h`;
  }

  const diffDays =
    Math.floor(diffHours / 24);

  if (diffDays === 1) {
    return "ontem";
  }

  return `há ${diffDays}d`;
}

function groupHistory(
  items: ConversationSummary[]
) {
  const groups: {
    label: string;
    items: ConversationSummary[];
  }[] = [
    {
      label: "Hoje",
      items: [],
    },
    {
      label: "Ontem",
      items: [],
    },
    {
      label: "Últimos 7 dias",
      items: [],
    },
    {
      label: "Anteriores",
      items: [],
    },
  ];

  for (const item of items) {
    const diffDays = Math.floor(
      (Date.now() - item.updatedAt) /
        DAY
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

  return groups.filter(
    (group) => group.items.length > 0
  );
}

function createInitialHistory(): AuraConversation[] {
  const now = Date.now();

  return [
    {
      id: "c1",
      title:
        "Sequência didática sobre frações",
      messages: [],
      updatedAt: now - 2 * HOUR,
    },
    {
      id: "c2",
      title:
        "Resumo do capítulo 4 — Ecologia",
      messages: [],
      updatedAt: now - 5 * HOUR,
    },
    {
      id: "c3",
      title:
        "Questões de vestibular — Literatura",
      messages: [],
      updatedAt: now - 26 * HOUR,
    },
    {
      id: "c4",
      title:
        "Plano de aula — Revolução Industrial",
      messages: [],
      updatedAt: now - 3 * DAY,
    },
    {
      id: "c5",
      title:
        "Comparação Piaget x Vygotsky",
      messages: [],
      updatedAt: now - 6 * DAY,
    },
    {
      id: "c6",
      title:
        "Redação ENEM — estrutura dissertativa",
      messages: [],
      updatedAt: now - 20 * DAY,
    },
  ];
}

function loadStoredConversations(): AuraConversation[] {
  if (
    typeof window === "undefined"
  ) {
    return createInitialHistory();
  }

  try {
    const stored =
      window.localStorage.getItem(
        STORAGE_KEY
      );

    if (!stored) {
      return createInitialHistory();
    }

    const parsed = JSON.parse(
      stored
    ) as AuraConversation[];

    if (!Array.isArray(parsed)) {
      return createInitialHistory();
    }

    return parsed;
  } catch {
    return createInitialHistory();
  }
}

function saveConversations(
  conversations: AuraConversation[]
) {
  if (
    typeof window === "undefined"
  ) {
    return;
  }

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(conversations)
    );
  } catch {
    /* localStorage indisponível */
  }
}

function getConversationSummaries(
  conversations: AuraConversation[]
): ConversationSummary[] {
  return conversations
    .map((conversation) => ({
      id: conversation.id,
      title: conversation.title,
      messageCount:
        conversation.messages.length,
      updatedAt:
        conversation.updatedAt,
    }))
    .sort(
      (a, b) =>
        b.updatedAt - a.updatedAt
    );
}

function createConversationTitle(
  text: string
): string {
  const clean = text
    .replace(/\s+/g, " ")
    .trim();

  if (clean.length <= 48) {
    return clean;
  }

  return `${clean.slice(0, 48)}…`;
}

function stripMarkdown(
  text: string
): string {
  return text
    .replace(/```[\s\S]*?```/g, " código ")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/#{1,6}\s/g, "")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/[-•]\s/g, "")
    .replace(/\n+/g, " ")
    .trim();
}

const AURA_STATE_LABEL: Record<
  AuraState,
  string
> = {
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
   COMPONENT
   ================================================================ */

export default function AuraEducacube() {
  const [
    activeNav,
    setActiveNav,
  ] = useState("chat");

  const [
    sidebarOpen,
    setSidebarOpen,
  ] = useState(false);

  const [
    messages,
    setMessages,
  ] = useState<AuraMessage[]>([]);

  const [
    input,
    setInput,
  ] = useState("");

  const [
    attachments,
    setAttachments,
  ] = useState<Attachment[]>([]);

  const [
    isDragOver,
    setIsDragOver,
  ] = useState(false);

  const [
    auraState,
    setAuraState,
  ] =
    useState<AuraState>("idle");

  const [
    micActive,
    setMicActive,
  ] = useState(false);

  const [
    audioLevel,
    setAudioLevel,
  ] = useState(0);

  const [
    speakingMessageId,
    setSpeakingMessageId,
  ] = useState<string | null>(
    null
  );

  const [
    copiedMessageId,
    setCopiedMessageId,
  ] = useState<string | null>(
    null
  );

  const [
    historySearch,
    setHistorySearch,
  ] = useState("");

  const [
    conversations,
    setConversations,
  ] = useState<AuraConversation[]>(
    loadStoredConversations
  );

  const [
    activeConversationId,
    setActiveConversationId,
  ] = useState<string | null>(
    null
  );

  const [
    isOnline,
    setIsOnline,
  ] = useState(
    typeof navigator !== "undefined"
      ? navigator.onLine
      : true
  );

  const [
    showScrollToLatest,
    setShowScrollToLatest,
  ] = useState(false);

  const [
    editingConversationId,
    setEditingConversationId,
  ] = useState<string | null>(
    null
  );

  const [
    editingConversationTitle,
    setEditingConversationTitle,
  ] = useState("");

  const scrollRef =
    useRef<HTMLDivElement | null>(
      null
    );

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null
    );

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const thinkingTimeoutRef =
    useRef<number | null>(null);

  const generatingTimeoutRef =
    useRef<number | null>(null);

  const completeTimeoutRef =
    useRef<number | null>(null);

  const generationTokenRef =
    useRef(0);

  const speechRef =
    useRef<SpeechSynthesisUtterance | null>(
      null
    );

  const recognitionRef =
    useRef<SpeechRecognitionInstance | null>(
      null
    );

  const hasConversation =
    messages.length > 0;

  /* ================================================================
     PERSIST CONVERSATIONS
     ================================================================ */

  useEffect(() => {
    saveConversations(
      conversations
    );
  }, [conversations]);

  /* ================================================================
     ONLINE / OFFLINE
     ================================================================ */

  useEffect(() => {
    const goOnline = () => {
      setIsOnline(true);

      setAuraState((current) =>
        current === "offline"
          ? "idle"
          : current
      );
    };

    const goOffline = () => {
      setIsOnline(false);
      setAuraState("offline");
    };

    window.addEventListener(
      "online",
      goOnline
    );

    window.addEventListener(
      "offline",
      goOffline
    );

    return () => {
      window.removeEventListener(
        "online",
        goOnline
      );

      window.removeEventListener(
        "offline",
        goOffline
      );
    };
  }, []);

  /* ================================================================
     TEXTAREA AUTO SIZE
     ================================================================ */

  useEffect(() => {
    const element =
      textareaRef.current;

    if (!element) return;

    element.style.height = "auto";

    element.style.height = `${Math.min(
      element.scrollHeight,
      180
    )}px`;
  }, [input]);

  /* ================================================================
     MICROPHONE VISUALIZER
     ================================================================ */

  useEffect(() => {
    if (!micActive) {
      setAudioLevel(0);
      return;
    }

    const interval =
      window.setInterval(() => {
        setAudioLevel(
          0.25 +
            Math.random() * 0.75
        );
      }, 120);

    return () =>
      window.clearInterval(
        interval
      );
  }, [micActive]);

  /* ================================================================
     CLEANUP
     ================================================================ */

  useEffect(() => {
    return () => {
      if (
        thinkingTimeoutRef.current
      ) {
        window.clearTimeout(
          thinkingTimeoutRef.current
        );
      }

      if (
        generatingTimeoutRef.current
      ) {
        window.clearTimeout(
          generatingTimeoutRef.current
        );
      }

      if (
        completeTimeoutRef.current
      ) {
        window.clearTimeout(
          completeTimeoutRef.current
        );
      }

      recognitionRef.current?.abort();

      if (
        typeof window !== "undefined" &&
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  /* ================================================================
     SCROLL
     ================================================================ */

  function isNearBottom(
    element: HTMLDivElement
  ) {
    return (
      element.scrollHeight -
        element.scrollTop -
        element.clientHeight <
      120
    );
  }

  useEffect(() => {
    const element =
      scrollRef.current;

    if (!element) return;

    if (isNearBottom(element)) {
      element.scrollTop =
        element.scrollHeight;

      setShowScrollToLatest(false);
    } else {
      setShowScrollToLatest(true);
    }
  }, [messages, auraState]);

  function handleMessagesScroll() {
    const element =
      scrollRef.current;

    if (!element) return;

    setShowScrollToLatest(
      !isNearBottom(element)
    );
  }

  function scrollToLatest() {
    const element =
      scrollRef.current;

    if (!element) return;

    element.scrollTo({
      top: element.scrollHeight,
      behavior: "smooth",
    });

    setShowScrollToLatest(false);
  }

  /* ================================================================
     GENERATION CONTROL
     ================================================================ */

  function clearGenerationTimers() {
    generationTokenRef.current += 1;

    if (
      thinkingTimeoutRef.current
    ) {
      window.clearTimeout(
        thinkingTimeoutRef.current
      );

      thinkingTimeoutRef.current = null;
    }

    if (
      generatingTimeoutRef.current
    ) {
      window.clearTimeout(
        generatingTimeoutRef.current
      );

      generatingTimeoutRef.current = null;
    }

    if (
      completeTimeoutRef.current
    ) {
      window.clearTimeout(
        completeTimeoutRef.current
      );

      completeTimeoutRef.current = null;
    }
  }

  function updateConversationMessages(
    conversationId: string,
    nextMessages: AuraMessage[]
  ) {
    setConversations((previous) =>
      previous.map(
        (conversation) =>
          conversation.id ===
          conversationId
            ? {
                ...conversation,
                messages:
                  nextMessages,
                messageCount:
                  nextMessages.length,
                updatedAt:
                  Date.now(),
              }
            : conversation
      )
    );
  }

  function ensureConversation(
    firstMessage: string
  ): string {
    if (activeConversationId) {
      const existing =
        conversations.find(
          (conversation) =>
            conversation.id ===
            activeConversationId
        );

      if (existing) {
        return existing.id;
      }
    }

    const id = generateId();

    const conversation: AuraConversation =
      {
        id,
        title:
          createConversationTitle(
            firstMessage
          ),
        messages: [],
        updatedAt: Date.now(),
      };

    setConversations(
      (previous) => [
        conversation,
        ...previous,
      ]
    );

    setActiveConversationId(id);

    return id;
  }

  function appendAssistantResponse(
    conversationId: string,
    token: number
  ) {
    if (
      token !==
      generationTokenRef.current
    ) {
      return;
    }

    setAuraState("generating");

    generatingTimeoutRef.current =
      window.setTimeout(() => {
        if (
          token !==
          generationTokenRef.current
        ) {
          return;
        }

        const assistantMessage: AuraMessage =
          {
            id: generateId(),
            role: "assistant",
            content: DEMO_RESPONSE,
            status: "complete",
            createdAt: Date.now(),
          };

        setMessages((previous) => {
          const next = [
            ...previous,
            assistantMessage,
          ];

          updateConversationMessages(
            conversationId,
            next
          );

          return next;
        });

        setAuraState("complete");

        completeTimeoutRef.current =
          window.setTimeout(() => {
            if (
              token !==
              generationTokenRef.current
            ) {
              return;
            }

            setAuraState(
              isOnline
                ? "idle"
                : "offline"
            );
          }, 900);
      }, 1100);
  }

  function startDemoGeneration(
    conversationId: string
  ) {
    clearGenerationTimers();

    const token =
      generationTokenRef.current;

    setAuraState("thinking");

    thinkingTimeoutRef.current =
      window.setTimeout(() => {
        if (
          token !==
          generationTokenRef.current
        ) {
          return;
        }

        appendAssistantResponse(
          conversationId,
          token
        );
      }, 700);
  }

  /* ================================================================
     SEND MESSAGE
     ================================================================ */

  function sendMessage(text: string) {
    const trimmed =
      text.trim();

    if (
      !trimmed ||
      !isOnline
    ) {
      return;
    }

    clearGenerationTimers();

    if (micActive) {
      stopMicrophone();
    }

    const conversationId =
      ensureConversation(
        trimmed
      );

    const userMessage: AuraMessage =
      {
        id: generateId(),
        role: "user",
        content: trimmed,
        createdAt: Date.now(),
      };

    setMessages((previous) => {
      const next = [
        ...previous,
        userMessage,
      ];

      updateConversationMessages(
        conversationId,
        next
      );

      return next;
    });

    setInput("");
    setAttachments([]);

    startDemoGeneration(
      conversationId
    );
  }

  /* ================================================================
     KEYBOARD
     ================================================================ */

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
      event.key === "Escape"
    ) {
      if (sidebarOpen) {
        setSidebarOpen(false);
      }

      if (micActive) {
        stopMicrophone();
      }
    }
  }

  /* ================================================================
     STOP GENERATION
     ================================================================ */

  function handleStopGenerating() {
    clearGenerationTimers();

    setAuraState(
      isOnline ? "idle" : "offline"
    );
  }

  /* ================================================================
     FILES
     ================================================================ */

  function addFiles(
    fileList: FileList | null
  ) {
    if (!fileList) return;

    const files =
      Array.from(fileList).map(
        (file) => ({
          id: generateId(),
          name: file.name,
          size: file.size,
          type: file.type,
        })
      );

    setAttachments(
      (previous) => [
        ...previous,
        ...files,
      ]
    );
  }

  function handleFileInputChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    addFiles(
      event.target.files
    );

    event.target.value = "";
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();

    setIsDragOver(false);

    addFiles(
      event.dataTransfer.files
    );
  }

  function handleDragOver(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setIsDragOver(true);
  }

  function handleDragLeave(
    event: DragEvent<HTMLDivElement>
  ) {
    event.preventDefault();
    setIsDragOver(false);
  }

  function removeAttachment(
    id: string
  ) {
    setAttachments(
      (previous) =>
        previous.filter(
          (file) =>
            file.id !== id
        )
    );
  }

  /* ================================================================
     MICROPHONE / SPEECH RECOGNITION
     ================================================================ */

  function stopMicrophone() {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* reconhecimento já encerrado */
    }

    recognitionRef.current = null;

    setMicActive(false);
    setAudioLevel(0);

    setAuraState(
      isOnline ? "idle" : "offline"
    );
  }

  function startMicrophone() {
    if (!isOnline) {
      return;
    }

    const speechWindow =
      window as WindowWithSpeechRecognition;

    const Recognition =
      speechWindow.SpeechRecognition ||
      speechWindow.webkitSpeechRecognition;

    if (!Recognition) {
      window.alert(
        "Seu navegador não oferece reconhecimento de voz. Tente usar o Google Chrome ou Opera."
      );

      return;
    }

    if (
      recognitionRef.current
    ) {
      stopMicrophone();
      return;
    }

    const recognition =
      new Recognition();

    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      recognitionRef.current =
        recognition;

      setMicActive(true);
      setAuraState("listening");
    };

    recognition.onresult = (
      event
    ) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i += 1
      ) {
        transcript +=
          event.results[i][0]
            .transcript;
      }

      const cleanTranscript =
        transcript.trim();

      if (!cleanTranscript) {
        return;
      }

      setInput(
        (previous) => {
          const separator =
            previous.trim()
              ? " "
              : "";

          return `${previous}${separator}${cleanTranscript}`;
        }
      );
    };

    recognition.onerror = () => {
      recognitionRef.current =
        null;

      setMicActive(false);
      setAudioLevel(0);

      setAuraState(
        isOnline
          ? "idle"
          : "offline"
      );
    };

    recognition.onend = () => {
      recognitionRef.current =
        null;

      setMicActive(false);
      setAudioLevel(0);

      setAuraState(
        isOnline
          ? "idle"
          : "offline"
      );
    };

    recognitionRef.current =
      recognition;

    try {
      recognition.start();
    } catch {
      recognitionRef.current =
        null;

      setMicActive(false);
      setAuraState("idle");
    }
  }

  function toggleMic() {
    if (micActive) {
      stopMicrophone();
    } else {
      startMicrophone();
    }
  }

  /* ================================================================
     SPEECH SYNTHESIS
     ================================================================ */

  function toggleSpeak(
    message: AuraMessage
  ) {
    if (
      typeof window ===
        "undefined" ||
      !(
        "speechSynthesis" in
        window
      )
    ) {
      window.alert(
        "Seu navegador não oferece leitura de voz."
      );

      return;
    }

    if (
      speakingMessageId ===
      message.id
    ) {
      window.speechSynthesis.cancel();

      speechRef.current = null;

      setSpeakingMessageId(
        null
      );

      setAuraState(
        isOnline ? "idle" : "offline"
      );

      return;
    }

    window.speechSynthesis.cancel();

    const utterance =
      new SpeechSynthesisUtterance(
        stripMarkdown(
          message.content
        )
      );

    utterance.lang = "pt-BR";
    utterance.rate = 0.95;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setSpeakingMessageId(
        message.id
      );

      setAuraState("speaking");
    };

    utterance.onend = () => {
      setSpeakingMessageId(
        null
      );

      speechRef.current = null;

      setAuraState(
        isOnline ? "idle" : "offline"
      );
    };

    utterance.onerror = () => {
      setSpeakingMessageId(
        null
      );

      speechRef.current = null;

      setAuraState(
        isOnline ? "idle" : "offline"
      );
    };

    speechRef.current =
      utterance;

    window.speechSynthesis.speak(
      utterance
    );
  }

  /* ================================================================
     COPY
     ================================================================ */

  async function copyMessage(
    message: AuraMessage
  ) {
    try {
      await navigator.clipboard.writeText(
        message.content
      );

      setCopiedMessageId(
        message.id
      );

      window.setTimeout(() => {
        setCopiedMessageId(
          (current) =>
            current ===
            message.id
              ? null
              : current
        );
      }, 1600);
    } catch {
      try {
        const textarea =
          document.createElement(
            "textarea"
          );

        textarea.value =
          message.content;

        textarea.style.position =
          "fixed";
        textarea.style.opacity =
          "0";

        document.body.appendChild(
          textarea
        );

        textarea.select();

        document.execCommand(
          "copy"
        );

        textarea.remove();

        setCopiedMessageId(
          message.id
        );

        window.setTimeout(() => {
          setCopiedMessageId(
            null
          );
        }, 1600);
      } catch {
        /* cópia indisponível */
      }
    }
  }

  /* ================================================================
     REGENERATE
     ================================================================ */

  function regenerate(
    messageId: string
  ) {
    const index =
      messages.findIndex(
        (message) =>
          message.id ===
          messageId
      );

    if (index === -1) {
      return;
    }

    const previousUser =
      [...messages]
        .slice(0, index)
        .reverse()
        .find(
          (message) =>
            message.role ===
            "user"
        );

    if (!previousUser) {
      return;
    }

    if (
      !activeConversationId
    ) {
      return;
    }

    clearGenerationTimers();

    const updatedMessages =
      messages.filter(
        (message) =>
          message.id !==
          messageId
      );

    setMessages(
      updatedMessages
    );

    updateConversationMessages(
      activeConversationId,
      updatedMessages
    );

    const token =
      generationTokenRef.current;

    setAuraState("thinking");

    thinkingTimeoutRef.current =
      window.setTimeout(() => {
        if (
          token !==
          generationTokenRef.current
        ) {
          return;
        }

        appendAssistantResponse(
          activeConversationId,
          token
        );
      }, 600);
  }

  /* ================================================================
     RETRY
     ================================================================ */

  function retryLastMessage() {
    const lastUserMessage =
      [...messages]
        .reverse()
        .find(
          (message) =>
            message.role ===
            "user"
        );

    if (
      !lastUserMessage ||
      !activeConversationId
    ) {
      return;
    }

    clearGenerationTimers();

    setAuraState("thinking");

    const token =
      generationTokenRef.current;

    thinkingTimeoutRef.current =
      window.setTimeout(() => {
        if (
          token !==
          generationTokenRef.current
        ) {
          return;
        }

        appendAssistantResponse(
          activeConversationId,
          token
        );
      }, 600);
  }

  /* ================================================================
     NEW CONVERSATION
     ================================================================ */

  function startNewConversation() {
    clearGenerationTimers();

    stopMicrophone();

    if (
      typeof window !==
        "undefined" &&
      "speechSynthesis" in
        window
    ) {
      window.speechSynthesis.cancel();
    }

    speechRef.current = null;

    setMessages([]);
    setInput([]);
    setAttachments([]);
    setActiveConversationId(
      null
    );
    setSpeakingMessageId(
      null
    );
    setCopiedMessageId(null);
    setEditingConversationId(
      null
    );
    setEditingConversationTitle(
      ""
    );

    setAuraState(
      isOnline ? "idle" : "offline"
    );

    setSidebarOpen(false);
  }

  /* ================================================================
     OPEN CONVERSATION
     ================================================================ */

  function openConversation(
    id: string
  ) {
    clearGenerationTimers();

    const conversation =
      conversations.find(
        (item) =>
          item.id === id
      );

    if (!conversation) {
      return;
    }

    if (
      typeof window !==
        "undefined" &&
      "speechSynthesis" in
        window
    ) {
      window.speechSynthesis.cancel();
    }

    setActiveConversationId(
      id
    );

    setMessages(
      conversation.messages
    );

    setInput("");
    setAttachments([]);
    setSpeakingMessageId(
      null
    );
    setCopiedMessageId(null);

    setAuraState(
      isOnline ? "idle" : "offline"
    );

    setSidebarOpen(false);
  }

  /* ================================================================
     RENAME CONVERSATION
     ================================================================ */

  function startRenameConversation(
    event: MouseEvent,
    conversation: ConversationSummary
  ) {
    event.stopPropagation();

    setEditingConversationId(
      conversation.id
    );

    setEditingConversationTitle(
      conversation.title
    );
  }

  function cancelRename() {
    setEditingConversationId(
      null
    );

    setEditingConversationTitle(
      ""
    );
  }

  function saveRenameConversation(
    id: string
  ) {
    const title =
      editingConversationTitle.trim();

    if (!title) {
      cancelRename();
      return;
    }

    setConversations(
      (previous) =>
        previous.map(
          (conversation) =>
            conversation.id === id
              ? {
                  ...conversation,
                  title,
                  updatedAt:
                    Date.now(),
                }
              : conversation
        )
    );

    cancelRename();
  }

  function handleRenameKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
    id: string
  ) {
    if (
      event.key === "Enter"
    ) {
      event.preventDefault();

      saveRenameConversation(id);
    }

    if (
      event.key === "Escape"
    ) {
      cancelRename();
    }
  }

  /* ================================================================
     DELETE CONVERSATION
     ================================================================ */

  function deleteConversation(
    event: MouseEvent,
    id: string
  ) {
    event.stopPropagation();

    const conversation =
      conversations.find(
        (item) =>
          item.id === id
      );

    if (!conversation) {
      return;
    }

    const confirmed =
      window.confirm(
        `Excluir a conversa "${conversation.title}"?`
      );

    if (!confirmed) {
      return;
    }

    setConversations(
      (previous) =>
        previous.filter(
          (item) =>
            item.id !== id
        )
    );

    if (
      activeConversationId ===
      id
    ) {
      clearGenerationTimers();

      setActiveConversationId(
        null
      );

      setMessages([]);

      setAuraState(
        isOnline
          ? "idle"
          : "offline"
      );
    }
  }

  /* ================================================================
     NAVIGATION
     ================================================================ */

  function handleNavigation(
    id: string
  ) {
    setActiveNav(id);

    if (
      window.innerWidth <= 900
    ) {
      setSidebarOpen(false);
    }

    /*
      O Chat IA continua sendo
      o módulo funcional da AURA.

      Os outros módulos permanecem
      preparados para receber suas
      páginas/rotas reais do EducaCube.
    */
  }

  /* ================================================================
     DERIVED DATA
     ================================================================ */

  const history =
    useMemo(
      () =>
        getConversationSummaries(
          conversations
        ),
      [conversations]
    );

  const filteredHistory =
    useMemo(() => {
      const query =
        historySearch
          .trim()
          .toLowerCase();

      if (!query) {
        return history;
      }

      return history.filter(
        (conversation) =>
          conversation.title
            .toLowerCase()
            .includes(query)
      );
    }, [
      history,
      historySearch,
    ]);

  const historyGroups =
    useMemo(
      () =>
        groupHistory(
          filteredHistory
        ),
      [filteredHistory]
    );

  const isBusy =
    auraState === "thinking" ||
    auraState === "generating";

  /* ================================================================
     RENDER
     ================================================================ */

  return (
    <div
      className="aura-page"
      onKeyDown={
        handleGlobalKeyDown
      }
    >
      <div className="aura-layout">

        {/* ==========================================================
            MOBILE OVERLAY
            ========================================================== */}

        {sidebarOpen && (
          <div
            className="aura-mobile-overlay"
            onClick={() =>
              setSidebarOpen(false)
            }
          />
        )}

        {/* ==========================================================
            SIDEBAR
            ========================================================== */}

        <aside
          className={`aura-sidebar ${
            sidebarOpen
              ? "open"
              : ""
          }`}
        >
          <div className="aura-sidebar-top">

            <div className="aura-brand">
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

          <div className="aura-sidebar-top">

            <button
              type="button"
              className="aura-new-chat"
              onClick={
                startNewConversation
              }
            >
              <Plus size={15} />

              <span>
                Nova conversa
              </span>
            </button>

          </div>

          <nav className="aura-navigation">

            {NAV_ITEMS.map(
              (item) => {
                const Icon =
                  item.icon;

                const active =
                  activeNav ===
                  item.id;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`aura-nav-item ${
                      active
                        ? "active"
                        : ""
                    }`}
                    onClick={() =>
                      handleNavigation(
                        item.id
                      )
                    }
                  >
                    <Icon
                      size={17}
                      strokeWidth={1.8}
                    />

                    <span>
                      {item.label}
                    </span>
                  </button>
                );
              }
            )}

          </nav>

          {/* ========================================================
              HISTORY
              ======================================================== */}

          <div className="aura-history">

            <div className="aura-history-search">

              <Search size={13} />

              <input
                value={historySearch}
                onChange={(
                  event
                ) =>
                  setHistorySearch(
                    event.target
                      .value
                  )
                }
                placeholder="Buscar conversas"
                aria-label="Buscar conversas"
              />

            </div>

            {historyGroups.length ===
              0 && (
              <p className="aura-history-empty">
                Nenhuma conversa encontrada.
              </p>
            )}

            {historyGroups.map(
              (group) => (
                <div
                  key={
                    group.label
                  }
                >

                  <div className="aura-history-title">
                    {group.label}
                  </div>

                  <div className="aura-history-list">

                    {group.items.map(
                      (
                        conversation
                      ) => {
                        const isEditing =
                          editingConversationId ===
                          conversation.id;

                        return (
                          <div
                            key={
                              conversation.id
                            }
                            className={`aura-history-item ${
                              activeConversationId ===
                              conversation.id
                                ? "active"
                                : ""
                            }`}
                            onClick={() =>
                              openConversation(
                                conversation.id
                              )
                            }
                            role="button"
                            tabIndex={0}
                            onKeyDown={(
                              event
                            ) => {
                              if (
                                event.key ===
                                  "Enter" ||
                                event.key ===
                                  " "
                              ) {
                                event.preventDefault();

                                openConversation(
                                  conversation.id
                                );
                              }
                            }}
                          >

                            {isEditing ? (
                              <input
                                autoFocus
                                className="aura-history-rename-input"
                                value={
                                  editingConversationTitle
                                }
                                onChange={(
                                  event
                                ) =>
                                  setEditingConversationTitle(
                                    event
                                      .target
                                      .value
                                  )
                                }
                                onKeyDown={(
                                  event
                                ) =>
                                  handleRenameKeyDown(
                                    event,
                                    conversation.id
                                  )
                                }
                                onBlur={() =>
                                  saveRenameConversation(
                                    conversation.id
                                  )
                                }
                                onClick={(
                                  event
                                ) =>
                                  event.stopPropagation()
                                }
                              />
                            ) : (
                              <>

                                <div className="aura-history-item-title">
                                  {
                                    conversation.title
                                  }
                                </div>

                                <div className="aura-history-item-actions">

                                  <button
                                    type="button"
                                    className="aura-history-action"
                                    aria-label="Renomear conversa"
                                    onClick={(
                                      event
                                    ) =>
                                      startRenameConversation(
                                        event,
                                        conversation
                                      )
                                    }
                                  >
                                    <Pencil
                                      size={
                                        14
                                      }
                                    />
                                  </button>

                                  <button
                                    type="button"
                                    className="aura-history-action"
                                    aria-label="Excluir conversa"
                                    onClick={(
                                      event
                                    ) =>
                                      deleteConversation(
                                        event,
                                        conversation.id
                                      )
                                    }
                                  >
                                    <Trash2
                                      size={
                                        14
                                      }
                                    />
                                  </button>

                                </div>

                              </>
                            )}

                          </div>
                        );
                      }
                    )}

                  </div>
                </div>
              )
            )}

          </div>

          {/* ========================================================
              SIDEBAR BOTTOM
              ======================================================== */}

          <div className="aura-sidebar-bottom">

            <div className="aura-sidebar-user">

              <div className="aura-sidebar-user-avatar">
                <Crown
                  size={14}
                  strokeWidth={2}
                />
              </div>

              <div className="aura-sidebar-user-info">

                <div className="aura-sidebar-user-name">
                  Plano Estudante
                </div>

                <div className="aura-sidebar-user-status">
                  EducaCube AURA
                </div>

              </div>

            </div>

            <div className="aura-sidebar-user">

              <div className="aura-sidebar-user-avatar">
                <User
                  size={14}
                  strokeWidth={2}
                />
              </div>

              <div className="aura-sidebar-user-info">

                <div className="aura-sidebar-user-name">
                  Aluno(a)
                </div>

                <div className="aura-sidebar-user-status">
                  @educacube
                </div>

              </div>

            </div>

          </div>

        </aside>

        {/* ==========================================================
            MAIN
            ========================================================== */}

        <main className="aura-main">

          {/* ========================================================
              HEADER
              ======================================================== */}

          <header className="aura-header">

            <div className="aura-header-left">

              <button
                type="button"
                className="aura-mobile-menu-button"
                onClick={() =>
                  setSidebarOpen(true)
                }
                aria-label="Abrir menu"
              >
                <Menu size={18} />
              </button>

              {/* ====================================================
                  LOGO DA AURA
                  NÃO ALTERAR
                  ==================================================== */}

              <div className="aura-header-logo-slot">
                <img
                  src="/LogoIA.png"
                  alt="AURA"
                  className="aura-header-logo"
                />
              </div>

              <div className="aura-header-title-group">

                <div className="aura-header-title">
                  AURA
                </div>

                <div className="aura-header-status">

                  <span className="aura-header-status-dot" />

                  <span>
                    {
                      AURA_STATE_LABEL[
                        auraState
                      ]
                    }
                  </span>

                </div>

              </div>

            </div>

            <div>

              <button
                type="button"
                className="aura-message-action"
                aria-label="Nova conversa"
                onClick={
                  startNewConversation
                }
              >
                <Plus size={16} />
              </button>

            </div>

          </header>

          {/* ========================================================
              CHAT
              ======================================================== */}

          <section className="aura-chat-section">

            {!hasConversation ? (

              <div className="aura-chat-scroll">

                <div className="aura-chat-content">

                  <div className="aura-welcome">

                    <div className="aura-orb-slot">

                      <NeuralOrb
                        state={
                          auraState
                        }
                        size={68}
                        audioLevel={
                          audioLevel
                        }
                      />

                    </div>

                    <div className="aura-welcome-title">
                      A inteligência
                      educacional
                      <br />
                      do{" "}
                      <em>
                        EducaCube
                      </em>
                      , à sua
                      disposição.
                    </div>

                    <p className="aura-welcome-subtitle">
                      Explique conceitos,
                      construa exercícios,
                      estruture aulas e
                      organize pesquisas
                      — com a profundidade
                      que o estudo
                      pedagógico exige.
                    </p>

                    <div className="aura-suggestions">

                      {SUGGESTIONS.map(
                        (
                          suggestion
                        ) => {
                          const Icon =
                            suggestion.icon;

                          return (
                            <button
                              key={
                                suggestion.id
                              }
                              type="button"
                              className="aura-suggestion"
                              onClick={() =>
                                sendMessage(
                                  suggestion.prompt
                                )
                              }
                            >

                              <div className="aura-suggestion-title">

                                <Icon
                                  size={14}
                                  style={{
                                    display:
                                      "inline-block",
                                    marginRight:
                                      7,
                                    verticalAlign:
                                      "middle",
                                  }}
                                />

                                {
                                  suggestion.label
                                }

                              </div>

                              <div className="aura-suggestion-description">
                                {
                                  suggestion.detail
                                }
                              </div>

                            </button>
                          );
                        }
                      )}

                    </div>

                  </div>

                </div>

              </div>

            ) : (

              <div
                className="aura-chat-scroll"
                ref={scrollRef}
                onScroll={
                  handleMessagesScroll
                }
              >

                <div className="aura-chat-content">

                  <div className="aura-messages">

                    {messages.map(
                      (message) => {

                        /* USER */

                        if (
                          message.role ===
                          "user"
                        ) {
                          return (
                            <div
                              key={
                                message.id
                              }
                              className="aura-message user"
                            >
                              <div className="aura-user-message">
                                {
                                  message.content
                                }
                              </div>
                            </div>
                          );
                        }

                        /* ERROR */

                        if (
                          message.status ===
                          "error"
                        ) {
                          return (
                            <div
                              key={
                                message.id
                              }
                              className="aura-error"
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
                                className="aura-message-action"
                                onClick={
                                  retryLastMessage
                                }
                              >
                                Tentar novamente
                              </button>

                            </div>
                          );
                        }

                        /* ASSISTANT */

                        const isSpeaking =
                          speakingMessageId ===
                          message.id;

                        return (
                          <div
                            key={
                              message.id
                            }
                            className="aura-message assistant"
                          >

                            <div className="aura-assistant-message">

                              <div className="aura-assistant-avatar">
                                <Box
                                  size={16}
                                  strokeWidth={
                                    1.7
                                  }
                                />
                              </div>

                              <div className="aura-assistant-content">

                                <div className="aura-assistant-name">
                                  AURA
                                </div>

                                <div className="aura-markdown">
                                  {renderAuraMarkdown(
                                    message.content
                                  )}
                                </div>

                                <div className="aura-message-actions">

                                  {/* COPY */}

                                  <div className="aura-tooltip-trigger">

                                    <button
                                      type="button"
                                      className="aura-message-action"
                                      onClick={() =>
                                        copyMessage(
                                          message
                                        )
                                      }
                                      aria-label="Copiar resposta"
                                    >
                                      <Copy
                                        size={
                                          14
                                        }
                                      />
                                    </button>

                                    {copiedMessageId ===
                                      message.id && (
                                      <span className="aura-tooltip">
                                        Copiado
                                      </span>
                                    )}

                                  </div>

                                  {/* REGENERATE */}

                                  <div className="aura-tooltip-trigger">

                                    <button
                                      type="button"
                                      className="aura-message-action"
                                      onClick={() =>
                                        regenerate(
                                          message.id
                                        )
                                      }
                                      aria-label="Regenerar resposta"
                                    >
                                      <RotateCcw
                                        size={
                                          14
                                        }
                                      />
                                    </button>

                                    <span className="aura-tooltip">
                                      Regenerar
                                    </span>

                                  </div>

                                  {/* SPEAK */}

                                  <div className="aura-tooltip-trigger">

                                    <button
                                      type="button"
                                      className="aura-message-action"
                                      onClick={() =>
                                        toggleSpeak(
                                          message
                                        )
                                      }
                                      aria-label={
                                        isSpeaking
                                          ? "Parar áudio"
                                          : "Ouvir resposta"
                                      }
                                    >
                                      {isSpeaking ? (
                                        <VolumeX
                                          size={
                                            14
                                          }
                                        />
                                      ) : (
                                        <Volume2
                                          size={
                                            14
                                          }
                                        />
                                      )}
                                    </button>

                                    <span className="aura-tooltip">
                                      {isSpeaking
                                        ? "Parar"
                                        : "Ouvir"}
                                    </span>

                                  </div>

                                </div>

                              </div>

                            </div>

                          </div>
                        );
                      }
                    )}

                    {/* THINKING */}

                    {auraState ===
                      "thinking" && (
                      <div className="aura-thinking">

                        <NeuralOrb
                          state="thinking"
                          size={22}
                        />

                        <span>
                          AURA está pensando
                        </span>

                        <span className="aura-thinking-dots">

                          <span className="aura-thinking-dot" />
                          <span className="aura-thinking-dot" />
                          <span className="aura-thinking-dot" />

                        </span>

                      </div>
                    )}

                  </div>

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
                      size={16}
                    />

                    <span>
                      Nova resposta
                    </span>
                  </button>
                )}

              </div>
            )}

            {/* ========================================================
                COMPOSER
                ======================================================== */}

            <div className="aura-composer-area">

              <div className="aura-composer">

                <div className="aura-composer-box">

                  {/* ATTACHMENTS */}

                  {attachments.length >
                    0 && (
                    <div className="aura-attachments">

                      {attachments.map(
                        (file) => (
                          <div
                            key={
                              file.id
                            }
                            className="aura-attachment-chip"
                          >

                            <Paperclip
                              size={14}
                            />

                            <span>
                              {
                                file.name
                              }
                            </span>

                            <span>
                              {formatBytes(
                                file.size
                              )}
                            </span>

                            <button
                              type="button"
                              className="aura-attachment-remove"
                              aria-label={`Remover ${file.name}`}
                              onClick={() =>
                                removeAttachment(
                                  file.id
                                )
                              }
                            >
                              <X
                                size={
                                  12
                                }
                              />
                            </button>

                          </div>
                        )
                      )}

                    </div>
                  )}

                  {/* INPUT */}

                  <div
                    className="aura-input-wrapper"
                    data-dragover={
                      isDragOver
                    }
                    onDragOver={
                      handleDragOver
                    }
                    onDragLeave={
                      handleDragLeave
                    }
                    onDrop={handleDrop}
                  >

                    {isDragOver && (
                      <div className="aura-drop-overlay">
                        <Paperclip
                          size={15}
                        />

                        <span>
                          Solte para anexar
                        </span>
                      </div>
                    )}

                    {/* FILE INPUT */}

                    <input
                      ref={
                        fileInputRef
                      }
                      type="file"
                      multiple
                      hidden
                      onChange={
                        handleFileInputChange
                      }
                    />

                    {/* ATTACH */}

                    <div className="aura-tooltip-trigger">

                      <button
                        type="button"
                        className="aura-composer-button"
                        aria-label="Anexar arquivo"
                        onClick={() =>
                          fileInputRef.current?.click()
                        }
                      >
                        <Paperclip
                          size={17}
                        />
                      </button>

                      <span className="aura-tooltip">
                        Anexar arquivo
                      </span>

                    </div>

                    {/* TEXTAREA */}

                    <textarea
                      ref={
                        textareaRef
                      }
                      value={input}
                      onChange={(
                        event
                      ) =>
                        setInput(
                          event.target
                            .value
                        )
                      }
                      onKeyDown={
                        handleKeyDown
                      }
                      placeholder={
                        isOnline
                          ? "Pergunte, peça um resumo ou uma sequência didática..."
                          : "Sem conexão no momento..."
                      }
                      rows={1}
                      className="aura-textarea"
                      disabled={!isOnline}
                    />

                    {/* MICROPHONE */}

                    <div className="aura-tooltip-trigger">

                      <button
                        type="button"
                        className={`aura-microphone-button ${
                          micActive
                            ? "active"
                            : ""
                        }`}
                        aria-label={
                          micActive
                            ? "Parar escuta"
                            : "Falar com a AURA"
                        }
                        onClick={
                          toggleMic
                        }
                      >
                        <Mic
                          size={17}
                        />
                      </button>

                      <span className="aura-tooltip">
                        {micActive
                          ? "Parar escuta"
                          : "Falar com a AURA"}
                      </span>

                    </div>

                    {/* SEND / STOP */}

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
                        className="aura-send-button"
                        aria-label="Enviar mensagem"
                        disabled={
                          !input.trim() ||
                          !isOnline
                        }
                        onClick={() =>
                          sendMessage(
                            input
                          )
                        }
                      >
                        <Send
                          size={16}
                        />
                      </button>
                    )}

                  </div>

                </div>

                {/* COMPOSER META */}

                <div className="aura-composer-meta">

                  {isOnline ? (
                    <>
                      <span className="aura-composer-hint">
                        Enter para enviar
                        · Shift + Enter
                        para nova linha
                      </span>

                      <span className="aura-composer-model">
                        AURA IA · EDUCACUBE
                      </span>
                    </>
                  ) : (
                    <span className="aura-composer-hint">
                      <WifiOff
                        size={11}
                        style={{
                          display:
                            "inline",
                          marginRight:
                            5,
                        }}
                      />

                      Sem conexão
                    </span>
                  )}

                </div>

              </div>

            </div>

          </section>
        </main>
      </div>
    </div>
  );
}


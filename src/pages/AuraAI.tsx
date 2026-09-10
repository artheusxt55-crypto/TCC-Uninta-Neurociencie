import { useState, type KeyboardEvent } from "react";

import {
  Box,
  MessageCircle,
  FileText,
  BookOpen,
  FilePenLine,
  Folder,
  Settings,
  Sun,
  Paperclip,
  Send,
  ChevronRight,
  Crown,
  User,
  Lightbulb,
  ShieldCheck,
} from "lucide-react";

import "./aura-educacube.css";

interface NavItem {
  id: string;
  label: string;
  icon: typeof MessageCircle;
}

interface Suggestion {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof BookOpen;
  prompt: string;
}

interface AuraMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

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
    title: "Explicar um conteúdo",
    subtitle: "Tire suas dúvidas de forma simples.",
    icon: BookOpen,
    prompt: "Pode me explicar um conteúdo?",
  },
  {
    id: "exercicios",
    title: "Criar exercícios",
    subtitle: "Gere questões personalizadas.",
    icon: FileText,
    prompt: "Crie exercícios personalizados para mim.",
  },
  {
    id: "resumir",
    title: "Resumir um texto",
    subtitle: "Entenda o essencial rapidinho.",
    icon: FileText,
    prompt: "Resuma este texto para mim.",
  },
  {
    id: "ideias",
    title: "Me dar ideias",
    subtitle: "Sugestões para seus estudos.",
    icon: Lightbulb,
    prompt: "Me dê ideias para meus estudos.",
  },
];

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function AuraEducacube() {
  const [activeNav, setActiveNav] = useState("chat");
  const [messages, setMessages] = useState<AuraMessage[]>([]);
  const [input, setInput] = useState("");

  const hasConversation = messages.length > 0;

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMessage: AuraMessage = {
      id: generateId(),
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: generateId(),
          role: "assistant",
          content:
            "Entendi! Essa é uma resposta de exemplo da Aura IA — conecte seu backend para respostas reais.",
        },
      ]);
    }, 500);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="aura-page">
      <div className="aura-layout">
        {/* ================================================= */}
        {/* SIDEBAR                                            */}
        {/* ================================================= */}

        <aside className="aura-sidebar">
          <div className="aura-brand">
            <div className="aura-brand-mark">
              <Box size={26} strokeWidth={1.75} />
            </div>
            <div className="aura-brand-name">
              Educa<span>cube</span>
            </div>
          </div>

          <nav className="aura-nav">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveNav(item.id)}
                  className={`aura-nav-item ${
                    isActive ? "aura-nav-item-active" : ""
                  }`}
                >
                  <Icon size={17} strokeWidth={1.9} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="aura-sidebar-spacer" />

          <button type="button" className="aura-plan-card">
            <div className="aura-plan-icon">
              <Crown size={14} strokeWidth={2} />
            </div>
            <div className="aura-plan-text">
              <div className="aura-plan-title">Plano Estudante</div>
              <div className="aura-plan-sub">
                Mais recursos para o seu aprendizado.
              </div>
            </div>
            <ChevronRight size={16} className="aura-plan-chevron" />
          </button>

          <div className="aura-sidebar-divider" />

          <button type="button" className="aura-user-row">
            <div className="aura-user-avatar">
              <User size={17} strokeWidth={2} />
            </div>
            <div className="aura-user-info">
              <div className="aura-user-name">Aluno(a)</div>
              <div className="aura-user-handle">@educacube</div>
            </div>
            <ChevronRight size={16} className="aura-user-chevron" />
          </button>
        </aside>

        {/* ================================================= */}
        {/* MAIN                                               */}
        {/* ================================================= */}

        <main className="aura-main">
          <header className="aura-header">
            <div>
              <div className="aura-header-title-row">
                <h1>Aura IA</h1>
                <span className="aura-beta-badge">Beta</span>
              </div>
              <p className="aura-header-sub">
                Seu assistente inteligente para aprender melhor.
              </p>
            </div>

            <button
              type="button"
              className="aura-theme-toggle"
              aria-label="Alternar tema"
            >
              <Sun size={18} strokeWidth={1.9} />
            </button>
          </header>

          <section className="aura-chat-section">
            {!hasConversation ? (
              <div className="aura-welcome">
                <div className="aura-logo-mark">
                  <svg
                    width="56"
                    height="56"
                    viewBox="0 0 64 64"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M32 10 L54 50 H10 Z"
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="5.5"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>

                <h2>
                  Olá, <span>Aluno(a)!</span>
                </h2>

                <p className="aura-welcome-lead">
                  Eu sou a <strong>Aura IA</strong>, seu assistente da
                  Educacube.
                </p>
                <p className="aura-welcome-sub">
                  Estou aqui para te ajudar com seus estudos, tirar dúvidas,
                  criar atividades, resumir conteúdos e muito mais!
                </p>

                <div className="aura-suggestions">
                  {SUGGESTIONS.map((suggestion) => {
                    const Icon = suggestion.icon;

                    return (
                      <button
                        key={suggestion.id}
                        type="button"
                        className="aura-suggestion-card"
                        onClick={() => sendMessage(suggestion.prompt)}
                      >
                        <div className="aura-suggestion-icon">
                          <Icon size={18} strokeWidth={1.8} />
                        </div>
                        <div className="aura-suggestion-text">
                          <div className="aura-suggestion-title">
                            {suggestion.title}
                          </div>
                          <div className="aura-suggestion-sub">
                            {suggestion.subtitle}
                          </div>
                        </div>
                        <ChevronRight
                          size={17}
                          className="aura-suggestion-arrow"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="aura-messages-scroll">
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
                      <div
                        className={`aura-message-bubble ${
                          message.role === "user"
                            ? "aura-user-message"
                            : "aura-assistant-message"
                        }`}
                      >
                        {message.content}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================= */}
            {/* INPUT                                          */}
            {/* ============================================= */}

            <div className="aura-input-area">
              <div className="aura-input-wrapper">
                <button
                  type="button"
                  className="aura-attach-button"
                  aria-label="Anexar arquivo"
                >
                  <Paperclip size={18} strokeWidth={1.8} />
                </button>

                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Digite sua mensagem..."
                  rows={1}
                  className="aura-textarea"
                />

                <button
                  type="button"
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim()}
                  className="aura-send-button"
                  aria-label="Enviar mensagem"
                >
                  <Send size={16} strokeWidth={2} />
                </button>
              </div>

              <p className="aura-footer-note">
                <ShieldCheck size={12} strokeWidth={2} />
                <span>Aura IA</span>
                <span className="aura-footer-dot">•</span>
                <span>Educacube</span>
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

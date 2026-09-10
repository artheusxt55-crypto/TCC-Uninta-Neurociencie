import {
  Clock,
  MessageSquare,
  Plus,
  Waypoints,
  X,
} from "lucide-react";

import "../styles/chat-sidebar.css";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  type?: "text" | "wiki" | "scientific" | "research";
  source?: string;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt?: Date;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConvId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  isOpen: boolean;
  onClose: () => void;
}

function formatDate(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diff < minute) {
    return "Agora";
  }

  if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes} min`;
  }

  if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours}h`;
  }

  if (diff < 2 * day) {
    return "Ontem";
  }

  if (diff < 7 * day) {
    const days = Math.floor(diff / day);
    return `${days} dias`;
  }

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });
}

function SidebarContent({
  conversations,
  activeConvId,
  onSelect,
  onNew,
  onClose,
  mobile = false,
}: {
  conversations: Conversation[];
  activeConvId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  onClose?: () => void;
  mobile?: boolean;
}) {
  return (
    <div className="aura-sidebar">
      <div className="aura-sidebar-header">
        <div className="aura-sidebar-brand">
          <div className="aura-sidebar-logo">
            <Waypoints size={17} strokeWidth={1.7} />
          </div>

          <div className="aura-sidebar-brand-text">
            <span className="aura-sidebar-brand-name">AURA</span>
            <span className="aura-sidebar-brand-context">
              EducaCube
            </span>
          </div>
        </div>

        {mobile && onClose && (
          <button
            type="button"
            className="aura-sidebar-close"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X size={18} strokeWidth={1.7} />
          </button>
        )}
      </div>

      <div className="aura-sidebar-content">
        <button
          type="button"
          className="aura-new-conversation"
          onClick={onNew}
        >
          <span className="aura-new-conversation-icon">
            <Plus size={16} strokeWidth={1.8} />
          </span>

          <span>Nova conversa</span>

          <span className="aura-new-conversation-key">
            N
          </span>
        </button>

        <div className="aura-sidebar-section">
          <div className="aura-sidebar-section-title">
            <span>Conversas</span>

            {conversations.length > 0 && (
              <span className="aura-sidebar-count">
                {conversations.length}
              </span>
            )}
          </div>

          {conversations.length === 0 ? (
            <div className="aura-empty-conversations">
              <div className="aura-empty-icon">
                <MessageSquare
                  size={18}
                  strokeWidth={1.5}
                />
              </div>

              <div className="aura-empty-title">
                Nenhuma conversa
              </div>

              <div className="aura-empty-description">
                Suas conversas aparecerão aqui.
              </div>
            </div>
          ) : (
            <div className="aura-conversation-list">
              {conversations.map((conversation) => {
                const isActive =
                  conversation.id === activeConvId;

                const messageCount =
                  conversation.messages?.length ?? 0;

                const lastActivity =
                  conversation.updatedAt ??
                  conversation.createdAt;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    className={`aura-conversation ${
                      isActive
                        ? "aura-conversation-active"
                        : ""
                    }`}
                    onClick={() => {
                      onSelect(conversation.id);

                      if (mobile && onClose) {
                        onClose();
                      }
                    }}
                  >
                    {isActive && (
                      <span
                        className="aura-active-line"
                        aria-hidden="true"
                      />
                    )}

                    <span
                      className={`aura-conversation-icon ${
                        isActive
                          ? "aura-conversation-icon-active"
                          : ""
                      }`}
                    >
                      <MessageSquare
                        size={14}
                        strokeWidth={
                          isActive ? 1.9 : 1.5
                        }
                      />
                    </span>

                    <span className="aura-conversation-content">
                      <span
                        className={`aura-conversation-title ${
                          isActive
                            ? "aura-conversation-title-active"
                            : ""
                        }`}
                        title={conversation.title}
                      >
                        {conversation.title ||
                          "Nova conversa"}
                      </span>

                      <span className="aura-conversation-meta">
                        <Clock
                          size={10}
                          strokeWidth={1.5}
                        />

                        <span>
                          {formatDate(lastActivity)}
                        </span>

                        {messageCount > 0 && (
                          <>
                            <span className="aura-meta-dot">
                              ·
                            </span>

                            <span>
                              {messageCount}
                            </span>
                          </>
                        )}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="aura-sidebar-footer">
        <div className="aura-system-status">
          <span className="aura-system-status-dot" />

          <div className="aura-system-status-content">
            <span className="aura-system-status-text">
              Sistema operacional
            </span>

            <span className="aura-system-status-subtext">
              Núcleo AURA
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChatSidebar({
  conversations,
  activeConvId,
  onSelect,
  onNew,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  return (
    <>
      <div className="aura-sidebar-desktop-inner">
        <SidebarContent
          conversations={conversations}
          activeConvId={activeConvId}
          onSelect={onSelect}
          onNew={onNew}
          mobile={false}
        />
      </div>

      {isOpen && (
        <div className="aura-mobile-overlay">
          <button
            type="button"
            className="aura-mobile-backdrop"
            onClick={onClose}
            aria-label="Fechar menu"
          />

          <aside
            className="aura-mobile-sidebar"
            aria-label="Histórico de conversas"
          >
            <SidebarContent
              conversations={conversations}
              activeConvId={activeConvId}
              onSelect={onSelect}
              onNew={onNew}
              onClose={onClose}
              mobile
            />
          </aside>
        </div>
      )}
    </>
  );
}

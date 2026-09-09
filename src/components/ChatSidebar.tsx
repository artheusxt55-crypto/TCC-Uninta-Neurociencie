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

  const diff =
    now.getTime() -
    date.getTime();

  const minutes = Math.floor(
    diff / 60000
  );

  const hours = Math.floor(
    diff / 3600000
  );

  const days = Math.floor(
    diff / 86400000
  );

  if (minutes < 1) {
    return "Agora";
  }

  if (minutes < 60) {
    return `${minutes} min`;
  }

  if (hours < 24) {
    return `${hours} h`;
  }

  if (days === 1) {
    return "Ontem";
  }

  if (days < 7) {
    return `${days} dias`;
  }

  return date.toLocaleDateString(
    "pt-BR",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }
  );
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
  onClose: () => void;
  mobile?: boolean;
}) {
  return (
    <div className="aura-sidebar">

      {/* HEADER */}

      <div className="aura-sidebar-header">

        <div className="aura-sidebar-brand">

          <div className="aura-sidebar-logo">
            <Waypoints size={17} strokeWidth={1.75} />
          </div>

          <div className="aura-sidebar-brand-text">
            <h2>AURA</h2>
            <p>EducaCube</p>
          </div>

        </div>

        {mobile && (
          <button
            type="button"
            className="aura-sidebar-close"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        )}

      </div>

      {/* NOVA CONVERSA */}

      <div className="aura-sidebar-new">

        <button
          type="button"
          className="aura-new-conversation"
          onClick={() => {
            onNew();

            if (mobile) {
              onClose();
            }
          }}
        >
          <Plus size={16} strokeWidth={2} />

          <span>
            Nova conversa
          </span>
        </button>

      </div>

      {/* LABEL */}

      <div className="aura-sidebar-section-title">
        <span>Conversas</span>

        {conversations.length > 0 && (
          <span className="aura-sidebar-count">
            {conversations.length}
          </span>
        )}
      </div>

      {/* CONVERSAS */}

      <div className="aura-sidebar-conversations">

        {conversations.length === 0 ? (

          <div className="aura-empty-conversations">

            <div className="aura-empty-icon">
              <MessageSquare size={19} strokeWidth={1.75} />
            </div>

            <strong>
              Nenhuma conversa
            </strong>

            <p>
              Suas conversas aparecerão aqui.
            </p>

          </div>

        ) : (

          <div className="aura-conversation-list">

            {conversations.map(
              (conversation) => {

                const active =
                  conversation.id ===
                  activeConvId;

                return (
                  <button
                    key={conversation.id}
                    type="button"
                    onClick={() => {
                      onSelect(
                        conversation.id
                      );

                      if (mobile) {
                        onClose();
                      }
                    }}
                    className={`aura-conversation ${
                      active
                        ? "aura-conversation-active"
                        : ""
                    }`}
                  >

                    {active && (
                      <span className="aura-active-line" />
                    )}

                    <div
                      className={`aura-conversation-icon ${
                        active
                          ? "aura-conversation-icon-active"
                          : ""
                      }`}
                    >
                      <MessageSquare size={14} strokeWidth={1.75} />
                    </div>

                    <div className="aura-conversation-content">

                      <p
                        className={`aura-conversation-title ${
                          active
                            ? "aura-conversation-title-active"
                            : ""
                        }`}
                      >
                        {conversation.title}
                      </p>

                      <div className="aura-conversation-meta">

                        <Clock size={10} strokeWidth={1.75} />

                        <span>
                          {formatDate(
                            conversation.createdAt
                          )}
                        </span>

                        <span className="aura-meta-dot">
                          •
                        </span>

                        <span>
                          {conversation.messages.length}
                          {" "}
                          {conversation.messages.length === 1
                            ? "msg"
                            : "msgs"}
                        </span>

                      </div>

                    </div>

                  </button>
                );
              }
            )}

          </div>
        )}

      </div>

      {/* FOOTER */}

      <div className="aura-sidebar-footer">

        <div className="aura-system-status">

          <span className="aura-system-status-dot" />

          <div className="aura-system-status-text">

            <p>
              Sistema online
            </p>

            <span>
              núcleo neural da AURA
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
      {/* DESKTOP */}

      <div className="aura-sidebar-desktop-inner">
        <SidebarContent
          conversations={
            conversations
          }
          activeConvId={
            activeConvId
          }
          onSelect={onSelect}
          onNew={onNew}
          onClose={onClose}
        />
      </div>

      {/* MOBILE */}

      {isOpen && (
        <div className="aura-sidebar-mobile">
          <SidebarContent
            conversations={
              conversations
            }
            activeConvId={
              activeConvId
            }
            onSelect={onSelect}
            onNew={onNew}
            onClose={onClose}
            mobile
          />
        </div>
      )}
    </>
  );
}

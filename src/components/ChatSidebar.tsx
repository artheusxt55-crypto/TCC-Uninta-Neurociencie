import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Plus,
  X,
  Clock,
  Sparkles,
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
}

interface ChatSidebarProps {
  conversations: Conversation[];
  activeConvId: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatSidebar({
  conversations,
  activeConvId,
  onSelect,
  onNew,
  isOpen,
  onClose,
}: ChatSidebarProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

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

    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <>
      {/* =====================================================
          SIDEBAR DESKTOP
      ====================================================== */}

      <aside className="aura-sidebar aura-sidebar-desktop">
        {/* Header / Logo */}
        <div className="aura-sidebar-header">
          <div className="aura-sidebar-brand">
            <div className="aura-sidebar-logo">
              <Sparkles size={20} />

              <div className="aura-sidebar-logo-glow" />
            </div>

            <div className="aura-sidebar-brand-text">
              <h2>AURA AI</h2>

              <p>NEURAL LAB</p>
            </div>
          </div>
        </div>

        {/* Nova conversa */}
        <div className="aura-sidebar-new">
          <button
            type="button"
            onClick={onNew}
            className="aura-new-conversation"
          >
            <Plus size={18} />

            <span>Nova conversa</span>
          </button>
        </div>

        {/* Lista de conversas */}
        <div className="aura-sidebar-conversations">
          {conversations.length === 0 ? (
            <div className="aura-empty-conversations">
              <MessageSquare size={32} />

              <p>Nenhuma conversa</p>
            </div>
          ) : (
            <div className="aura-conversation-list">
              {conversations.map((conversation) => {
                const active =
                  conversation.id === activeConvId;

                return (
                  <motion.button
                    key={conversation.id}
                    type="button"
                    onClick={() =>
                      onSelect(conversation.id)
                    }
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`aura-conversation ${
                      active
                        ? "aura-conversation-active"
                        : ""
                    }`}
                  >
                    {/* Ícone */}
                    <div
                      className={`aura-conversation-icon ${
                        active
                          ? "aura-conversation-icon-active"
                          : ""
                      }`}
                    >
                      <MessageSquare size={16} />
                    </div>

                    {/* Conteúdo */}
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
                        <Clock size={11} />

                        <span>
                          {formatDate(
                            conversation.createdAt
                          )}
                        </span>

                        {conversation.messages.length >
                          0 && (
                          <>
                            <span className="aura-meta-dot">
                              •
                            </span>

                            <span>
                              {
                                conversation.messages
                                  .length
                              }{" "}
                              msgs
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="aura-sidebar-footer">
          <div className="aura-system-status">
            <div className="aura-status-dot" />

            <div className="aura-system-status-text">
              <p>Sistema online</p>

              <span>AURA PROTOCOL 7.0</span>
            </div>
          </div>
        </div>
      </aside>

      {/* =====================================================
          SIDEBAR MOBILE
      ====================================================== */}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="aura-sidebar-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
            />

            {/* Sidebar */}
            <motion.aside
              initial={{
                x: -320,
                opacity: 0,
              }}
              animate={{
                x: 0,
                opacity: 1,
              }}
              exit={{
                x: -320,
                opacity: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
              }}
              className="aura-sidebar aura-sidebar-mobile"
            >
              {/* Mobile Header */}
              <div className="aura-mobile-header">
                <div className="aura-sidebar-brand">
                  <div className="aura-sidebar-logo">
                    <Sparkles size={20} />
                  </div>

                  <div className="aura-sidebar-brand-text">
                    <h2>AURA AI</h2>

                    <p>NEURAL LAB</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="aura-close-button"
                  aria-label="Fechar menu"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Nova conversa mobile */}
              <div className="aura-sidebar-new">
                <button
                  type="button"
                  onClick={() => {
                    onNew();
                    onClose();
                  }}
                  className="aura-new-conversation"
                >
                  <Plus size={18} />

                  <span>Nova conversa</span>
                </button>
              </div>

              {/* Conversas mobile */}
              <div className="aura-sidebar-conversations">
                {conversations.length === 0 ? (
                  <div className="aura-empty-conversations">
                    <MessageSquare size={32} />

                    <p>Nenhuma conversa</p>
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

                              onClose();
                            }}
                            className={`aura-conversation ${
                              active
                                ? "aura-conversation-active"
                                : ""
                            }`}
                          >
                            {/* Ícone */}
                            <div
                              className={`aura-conversation-icon ${
                                active
                                  ? "aura-conversation-icon-active"
                                  : ""
                              }`}
                            >
                              <MessageSquare size={16} />
                            </div>

                            {/* Conteúdo */}
                            <div className="aura-conversation-content">
                              <p
                                className={`aura-conversation-title ${
                                  active
                                    ? "aura-conversation-title-active"
                                    : ""
                                }`}
                              >
                                {
                                  conversation.title
                                }
                              </p>

                              <p className="aura-mobile-message-count">
                                {
                                  conversation.messages
                                    .length
                                }{" "}
                                mensagens
                              </p>
                            </div>
                          </button>
                        );
                      }
                    )}
                  </div>
                )}
              </div>

              {/* Footer mobile */}
              <div className="aura-sidebar-footer">
                <div className="aura-system-status">
                  <div className="aura-status-dot" />

                  <div className="aura-system-status-text">
                    <p>Sistema online</p>

                    <span>
                      AURA PROTOCOL 7.0
                    </span>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Plus,
  X,
  Trash2,
  Clock,
  Sparkles,
} from "lucide-react";

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
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 z-30 w-72 flex-col bg-slate-950/95 backdrop-blur-2xl border-r border-white/10">
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />

              <div className="absolute inset-0 rounded-2xl bg-blue-400/20 animate-pulse" />
            </div>

            <div>
              <h2 className="text-sm font-bold text-white">
                AURA AI
              </h2>

              <p className="text-[10px] text-gray-500 font-mono tracking-wider">
                NEURAL LAB
              </p>
            </div>
          </div>
        </div>

        {/* New Conversation */}
        <div className="p-4">
          <button
            onClick={onNew}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <Plus size={18} />
            Nova conversa
          </button>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto px-3 pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center px-5 py-10 text-gray-500">
              <MessageSquare className="w-8 h-8 mb-3 opacity-40" />

              <p className="text-sm">
                Nenhuma conversa
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => {
                const active =
                  conversation.id === activeConvId;

                return (
                  <motion.button
                    key={conversation.id}
                    onClick={() =>
                      onSelect(conversation.id)
                    }
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full text-left p-3 rounded-2xl transition-all border ${
                      active
                        ? "bg-white/10 border-white/20 shadow-lg"
                        : "bg-transparent border-transparent hover:bg-white/5 hover:border-white/10"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                          active
                            ? "bg-gradient-to-br from-blue-500 to-purple-600"
                            : "bg-white/5"
                        }`}
                      >
                        <MessageSquare
                          size={16}
                          className={
                            active
                              ? "text-white"
                              : "text-gray-500"
                          }
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <p
                          className={`text-sm font-medium truncate ${
                            active
                              ? "text-white"
                              : "text-gray-300"
                          }`}
                        >
                          {conversation.title}
                        </p>

                        <div className="flex items-center gap-1 mt-1">
                          <Clock
                            size={11}
                            className="text-gray-600"
                          />

                          <span className="text-[10px] text-gray-500 font-mono">
                            {formatDate(
                              conversation.createdAt
                            )}
                          </span>

                          {conversation.messages.length >
                            0 && (
                            <>
                              <span className="text-gray-700">
                                •
                              </span>

                              <span className="text-[10px] text-gray-500">
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
                    </div>
                  </motion.button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/5 border border-white/5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" />

            <div className="flex-1">
              <p className="text-[11px] text-gray-300 font-medium">
                Sistema online
              </p>

              <p className="text-[9px] text-gray-600 font-mono">
                AURA PROTOCOL 7.0
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {isOpen && (
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
            className="fixed left-0 top-0 bottom-0 z-50 w-80 max-w-[85vw] flex flex-col bg-slate-950/98 backdrop-blur-2xl border-r border-white/10 shadow-2xl lg:hidden"
          >
            {/* Mobile Header */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>

                <div>
                  <h2 className="text-sm font-bold text-white">
                    AURA AI
                  </h2>

                  <p className="text-[10px] text-gray-500 font-mono">
                    NEURAL LAB
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                aria-label="Fechar menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile New Conversation */}
            <div className="p-4">
              <button
                onClick={() => {
                  onNew();
                  onClose();
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold text-sm shadow-lg"
              >
                <Plus size={18} />
                Nova conversa
              </button>
            </div>

            {/* Mobile Conversations */}
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              <div className="space-y-2">
                {conversations.map(
                  (conversation) => {
                    const active =
                      conversation.id ===
                      activeConvId;

                    return (
                      <button
                        key={conversation.id}
                        onClick={() => {
                          onSelect(
                            conversation.id
                          );
                          onClose();
                        }}
                        className={`w-full text-left p-3 rounded-2xl transition-all border ${
                          active
                            ? "bg-white/10 border-white/20"
                            : "border-transparent hover:bg-white/5"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${
                              active
                                ? "bg-gradient-to-br from-blue-500 to-purple-600"
                                : "bg-white/5"
                            }`}
                          >
                            <MessageSquare
                              size={16}
                              className={
                                active
                                  ? "text-white"
                                  : "text-gray-500"
                              }
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-white truncate">
                              {
                                conversation.title
                              }
                            </p>

                            <p className="text-[10px] text-gray-500 mt-1">
                              {
                                conversation
                                  .messages
                                  .length
                              }{" "}
                              mensagens
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>

            {/* Mobile Footer */}
            <div className="p-4 border-t border-white/10">
              <div className="flex items-center gap-3 px-3 py-3 rounded-2xl bg-white/5">
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50 animate-pulse" />

                <div>
                  <p className="text-[11px] text-gray-300">
                    Sistema online
                  </p>

                  <p className="text-[9px] text-gray-600 font-mono">
                    AURA PROTOCOL 7.0
                  </p>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}

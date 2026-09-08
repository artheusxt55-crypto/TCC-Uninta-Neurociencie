import { useState } from "react";
import { Send, Bot, User } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function AuraAI() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  async function enviarMensagem() {
    const texto = input.trim();

    if (!texto || loading) return;

    const novaMensagem: Message = {
      role: "user",
      content: texto,
    };

    setMessages((prev) => [...prev, novaMensagem]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: texto,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao conversar com a AURA.");
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.resposta || "Não consegui gerar uma resposta.",
        },
      ]);
    } catch (error) {
      console.error(error);

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "⚠️ Não consegui me conectar à AURA. Tente novamente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      enviarMensagem();
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Cabeçalho */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-600/20 flex items-center justify-center">
            <Bot className="w-6 h-6 text-red-500" />
          </div>

          <div>
            <h1 className="text-xl font-semibold">AURA</h1>
            <p className="text-xs text-white/50">
              Inteligência Artificial • UNINTA
            </p>
          </div>
        </div>
      </header>

      {/* Conversa */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8">
        {messages.length === 0 ? (
          <div className="h-full min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-red-600/10 flex items-center justify-center">
                <Bot className="w-9 h-9 text-red-500" />
              </div>

              <h2 className="text-3xl font-bold mb-3">
                Olá, eu sou a AURA.
              </h2>

              <p className="text-white/50 max-w-md">
                Assistente de Inteligência Artificial do ecossistema
                Neuro-UNINTA.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-3 ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-red-600/20 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-red-500" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.role === "user"
                      ? "bg-red-600 text-white"
                      : "bg-white/5 border border-white/10"
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </p>
                </div>

                {message.role === "user" && (
                  <div className="w-9 h-9 shrink-0 rounded-lg bg-white/10 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-3 items-center">
                <div className="w-9 h-9 rounded-lg bg-red-600/20 flex items-center justify-center">
                  <Bot className="w-5 h-5 text-red-500" />
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3">
                  <span className="text-white/50">
                    AURA está pensando...
                  </span>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Campo de mensagem */}
      <footer className="border-t border-white/10 p-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end gap-2 bg-white/5 border border-white/10 rounded-2xl p-2">
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pergunte alguma coisa para a AURA..."
              rows={1}
              className="flex-1 bg-transparent resize-none outline-none px-3 py-3 text-sm placeholder:text-white/30"
            />

            <button
              onClick={enviarMensagem}
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>

          <p className="text-center text-xs text-white/20 mt-2">
            AURA pode cometer erros. Verifique informações importantes.
          </p>
        </div>
      </footer>
    </div>
  );
}

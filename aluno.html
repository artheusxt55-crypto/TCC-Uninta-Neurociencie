import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, Plus, Menu, Loader2, Zap, FileText } from "lucide-react";
import ReactMarkdown from "react-markdown";
import NeuralOrb from "@/components/NeuralOrb";
import { useAudioAnalyzer } from "@/hooks/useAudioAnalyzer";
import ChatSidebar from "@/components/ChatSidebar";
import { analisarComGroq, salvarNoRedis, buscarDoRedis, falarTexto } from "@/lib/aura-engine";
import { jsPDF } from "jspdf";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

function TypingIndicator() {
  return (
    <div className="flex gap-1 items-center px-1 py-2">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-primary/60"
          animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export default function Index() {
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: "1", title: "Nova conversa", messages: [], createdAt: new Date() },
  ]);
  const [activeConvId, setActiveConvId] = useState("1");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showVoiceOrb, setShowVoiceOrb] = useState(false);
  const [userId, setUserId] = useState<string>(""); // Estado para o ID do Untbot

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioAnalyzer = useAudioAnalyzer();

  // RECUPERAR IDENTIDADE DO LABORATÓRIO
  useEffect(() => {
    const savedId = localStorage.getItem('untbot_last_id');
    if (savedId) setUserId(savedId);
  }, []);

  const activeConversation = conversations.find((c) => c.id === activeConvId) || conversations[0];
  const messages = activeConversation.messages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  // FUNÇÃO DE PDF (ESTILO V5 UNINTA)
  const exportarParaPDF = (texto: string) => {
    const doc = new jsPDF();
    doc.setFillColor(227, 6, 19);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("UNINTA - RELATÓRIO DE SINAPSE NEURAL", 15, 16);
    doc.setFontSize(8);
    doc.text(`ID OPERADOR: ${userId.toUpperCase()} | DATA: ${new Date().toLocaleDateString()}`, 140, 16);
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    const splitText = doc.splitTextToSize(texto.replace(/[*#]/g, ''), 180);
    doc.text(splitText, 15, 40);
    doc.save(`sinapse_${userId}_${Date.now()}.pdf`);
  };

  const addMessage = (role: "user" | "assistant", content: string) => {
    const msg: Message = { id: Date.now().toString() + Math.random(), role, content, timestamp: new Date() };
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id !== activeConvId) return c;
        const updated = { ...c, messages: [...c.messages, msg] };
        if (role === "user" && c.messages.length === 0) {
          updated.title = content.slice(0, 40) + (content.length > 40 ? "..." : "");
        }
        return updated;
      })
    );
  };

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg = input.trim();

    // LÓGICA DE IDENTIFICAÇÃO (Login do Lab)
    if (!userId) {
      const newId = userMsg.toLowerCase();
      setUserId(newId);
      localStorage.setItem('untbot_last_id', newId);
      setInput("");
      return;
    }

    addMessage("user", userMsg);
    setInput("");
    setIsTyping(true);

    try {
      const historico = await buscarDoRedis(userId);
      const contexto = `Você é a Aura AI do Lab Neuro-UNINTA. Mestre: Matheus. Operador: ${userId}. Responda de forma técnica e futurista. Histórico: ${historico.join(" | ")}`;
      const resposta = await analisarComGroq(userMsg, contexto);
      
      await salvarNoRedis(userId, `U: ${userMsg} | B: ${resposta}`);
      addMessage("assistant", resposta);
      falarTexto(resposta);
    } catch (error) {
      addMessage("assistant", "⚠️ Erro de conexão neural.");
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoice = () => {
    if (audioAnalyzer.isActive) {
      audioAnalyzer.stop();
      setShowVoiceOrb(false);
    } else {
      audioAnalyzer.start();
      setShowVoiceOrb(true);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans relative selection:bg-primary/30">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <ChatSidebar
        conversations={conversations}
        activeConvId={activeConvId}
        onSelect={(id) => { setActiveConvId(id); setSidebarOpen(false); }}
        onNew={() => {
          const id = Date.now().toString();
          setConversations(prev => [{ id, title: "Nova conversa", messages: [], createdAt: new Date() }, ...prev]);
          setActiveConvId(id);
        }}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[40] lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`flex-1 flex flex-col min-w-0 relative z-10 transition-all duration-500 ${sidebarOpen ? "blur-md scale-[0.98] pointer-events-none lg:blur-none lg:scale-100 lg:pointer-events-auto" : ""}`}>
        <header className="flex items-center gap-3 px-6 py-4 border-b border-white/5 bg-background/40 backdrop-blur-xl">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg hover:bg-white/5 text-muted-foreground"><Menu size={20} /></button>
          <div className="flex items-center gap-3 flex-1">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]"></span>
            </div>
            <h1 className="text-xs font-bold font-mono tracking-[0.2em] text-primary uppercase text-glow">
                UNINTA // {userId || "AGUARDANDO_ID"}
            </h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto chat-scrollbar relative scroll-smooth px-4 bg-gradient-to-b from-transparent to-black/20">
          {!userId ? (
             <div className="flex flex-col items-center justify-center h-full text-center">
                <Zap className="text-primary mb-4 animate-pulse" size={40} />
                <h2 className="text-2xl font-bold tracking-tight">IDENTIFIQUE-SE</h2>
                <p className="text-xs font-mono text-muted-foreground mt-2 uppercase tracking-widest">Digite seu ID de Operador no terminal abaixo</p>
             </div>
          ) : !messages.length ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-8 opacity-80 scale-90 drop-shadow-2xl">
                <NeuralOrb isActive={audioAnalyzer.isActive} volume={audioAnalyzer.volume} frequency={audioAnalyzer.frequency} isProcessing={audioAnalyzer.isProcessing} size="md" />
              </motion.div>
              <h2 className="text-3xl font-semibold tracking-tight text-white/90">Olá, {userId.toUpperCase()}</h2>
              <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-muted-foreground/40 mt-3 italic">Lab Neuro-UNINTA // Online</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full py-10 space-y-8">
              <AnimatePresence mode="popLayout">
                {messages.map((msg) => (
                  <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                        <Zap size={14} className="text-primary animate-pulse" />
                      </div>
                    )}
                    <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed backdrop-blur-md border shadow-2xl ${msg.role === "user" ? "bg-primary/90 text-primary-foreground border-primary/20" : "bg-white/5 border-white/10 text-white/90"}`}>
                      <ReactMarkdown className="prose prose-invert prose-sm max-w-none">{msg.content}</ReactMarkdown>
                      
                      {msg.role === 'assistant' && (
                        <button 
                          onClick={() => exportarParaPDF(msg.content)} 
                          className="mt-3 flex items-center gap-2 text-[10px] bg-white/10 hover:bg-primary/20 p-2 rounded transition-all uppercase font-bold"
                        >
                          <FileText size={12} /> PDF RELATÓRIO
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isTyping && <div className="flex gap-4 mb-8"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center"><div className="w-2 h-2 rounded-full bg-primary animate-pulse" /></div><TypingIndicator /></div>}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        <footer className="p-6 bg-gradient-to-t from-background to-transparent relative">
          <div className="max-w-3xl mx-auto relative h-auto">
            <div className="relative z-10 flex items-end gap-2 bg-black/80 border border-white/10 rounded-[1.5rem] p-2.5 transition-all duration-300 backdrop-blur-[40px] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
              <button onClick={toggleVoice} className={`p-2.5 rounded-xl transition-all ${audioAnalyzer.isActive ? "bg-primary text-primary-foreground shadow-[0_0_15px_rgba(var(--primary),0.5)]" : "text-muted-foreground hover:bg-white/5"}`}>
                {audioAnalyzer.isActive ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              
              <textarea 
                ref={textareaRef} 
                value={input} 
                onChange={(e) => setInput(e.target.value)} 
                onKeyDown={handleKeyDown} 
                placeholder={userId ? "Injete um comando..." : "Digite seu nome/ID para acessar..."} 
                rows={1} 
                autoComplete="off"
                spellCheck="false"
                style={{ border: 'none', boxShadow: 'none', outline: 'none', background: 'transparent' }}
                className="flex-1 bg-transparent border-0 focus:border-0 focus:ring-0 focus:outline-none resize-none text-sm py-2.5 placeholder:text-muted-foreground/30 font-sans chat-scrollbar overflow-y-auto shadow-none outline-none appearance-none text-white" 
              />
              
              <button onClick={handleSend} disabled={!input.trim() || isTyping} className="p-2.5 bg-primary text-primary-foreground rounded-xl disabled:opacity-20 shadow-lg active:scale-95 transition-all group">
                {isTyping ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} className="group-hover:translate-x-0.5 transition-transform" />}
              </button>
            </div>
            <p className="text-center text-[8px] text-muted-foreground/20 mt-4 font-mono uppercase tracking-[0.5em] animate-pulse">Neural Lab // Protocol 6.0</p>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {showVoiceOrb && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center">
            <NeuralOrb isActive={audioAnalyzer.isActive} volume={audioAnalyzer.volume} frequency={audioAnalyzer.frequency} isProcessing={audioAnalyzer.isProcessing} />
            <button onClick={toggleVoice} className="mt-12 p-5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive hover:text-white transition-all shadow-[0_0_30px_rgba(var(--destructive),0.2)]"><MicOff size={24} /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

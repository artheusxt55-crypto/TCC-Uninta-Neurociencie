import React, { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';

export const ChatInterface = () => {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Olá, Untbot! Sou a Aura Neural AI. Como posso ajudar no laboratório hoje?' }
  ]);

  return (
    <div className="flex flex-col h-screen bg-[#0a0a0a] text-white font-sans">
      {/* Header com o Orbe */}
      <div className="p-6 border-b border-white/10 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500 animate-pulse shadow-[0_0_15px_rgba(168,85,247,0.5)]"></div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">AURA NEURAL AI</h1>
          <p className="text-xs text-purple-400 uppercase tracking-widest">Lab Assistant Mode</p>
        </div>
      </div>

      {/* Área de Chat */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-purple-600' : 'bg-white/5 border border-white/10'}`}>
              <p className="text-sm">{msg.content}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="p-6 bg-white/5 border-t border-white/10">
        <div className="relative flex items-center">
          <input 
            type="text" 
            placeholder="Digite sua mensagem..." 
            className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 focus:outline-none focus:border-purple-500 transition-all"
          />
          <button className="absolute right-2 p-2 bg-purple-600 rounded-full hover:bg-purple-500 transition-colors">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

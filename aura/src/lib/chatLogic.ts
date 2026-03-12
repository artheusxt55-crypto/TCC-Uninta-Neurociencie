export async function sendMessageToAI(messages: any[]) {
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      Authorization: `Bearer ${import.meta.env.VITE_AI_API_KEY}` 
    },
    body: JSON.stringify({ 
      model: "gpt-4o-mini", 
      messages: messages.map(m => ({ role: m.role, content: m.content })) 
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "Erro na conexão.";
}

export const createMessage = (role: any, content: string) => ({ 
  id: Math.random().toString(36), role, content, timestamp: Date.now() 
});

export const createConversation = () => ({ 
  id: Math.random().toString(36), title: "Nova conversa", messages: [], updatedAt: Date.now() 
});

export async function saveConversation(conv: any) { 
  localStorage.setItem(`c_${conv.id}`, JSON.stringify(conv)); 
}

export async function loadAllConversations() { 
  return Object.keys(localStorage)
    .filter(k => k.startsWith("c_"))
    .map(k => JSON.parse(localStorage.getItem(k)!)); 
}

export async function deleteConversation(id: string) { 
  localStorage.removeItem(`c_${id}`); 
}

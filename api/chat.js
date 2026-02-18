import { createClient } from '@supabase/supabase-js';

// Conecta ao seu Supabase usando as variáveis que você salvou na Vercel
const supabase = createClient(
  process.env.SUPABASE_URL, 
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  // Só aceita requisições do tipo POST (envio de mensagem)
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { mensagem, usuario_id } = req.body;

  try {
    // 1. BUSCA A MEMÓRIA: O que a IA já sabe sobre o Matheus?
    const { data: memoria } = await supabase
      .from('memoria_ia')
      .select('perfil_usuario')
      .eq('usuario_id', usuario_id)
      .single();

    // Se não tiver nada salvo, usa um perfil padrão
    const perfil = memoria?.perfil_usuario || "Estudante interessado em Neurociência, TDAH e instituições como USP e UFRGS.";

    // 2. CHAMADA AO GROQ: Manda a pergunta + a memória
    const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Modelo rápido e grátis
        messages: [
          { 
            role: "system", 
            content: `Você é o Mentor da NeuroLib. Seu aluno é o Matheus. 
                      Contexto de aprendizado dele: ${perfil}. 
                      Responda de forma motivadora e técnica.` 
          },
          { role: "user", content: mensagem }
        ]
      })
    });

    const data = await groqResponse.json();
    const respostaIA = data.choices[0].message.content;

    // 3. SALVAR INTERAÇÃO: Atualiza o banco para a IA "não esquecer"
    await supabase.from('memoria_ia').upsert({ 
      usuario_id: usuario_id, 
      ultima_conversa: mensagem,
      perfil_usuario: perfil // Aqui você pode evoluir para a IA atualizar os gostos depois
    }, { onConflict: 'usuario_id' });

    // Envia a resposta de volta para o seu site
    return res.status(200).json({ resposta: respostaIA });

  } catch (error) {
    console.error("Erro na API:", error);
    return res.status(500).json({ error: "Erro ao processar sua mensagem." });
  }
}

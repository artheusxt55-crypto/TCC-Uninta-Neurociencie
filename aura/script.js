const sendBtn = document.getElementById('send-btn');
const userInput = document.getElementById('user-input');
const messagesDiv = document.getElementById('messages');
const emptyState = document.getElementById('empty-state');
const chatWindow = document.getElementById('chat-window');

const demoResponses = [
    "Olá! Sou a **Neural AI**. Como assistente do laboratório, estou pronta para ajudar com seus estudos em **Psicofarmacologia** e **Neurociências**. O que vamos analisar hoje?",
    "Interessante! Baseado no que discutimos sobre o TDAH e as diretrizes da **USP**, recomendo focar na neuroimagem aplicada.",
    "Com certeza. O protocolo para pacientes com TEA envolve uma análise profunda das vias neurais. Quer que eu detalhe mais?"
];
let rIdx = 0;

function addMessage(role, text) {
    emptyState.style.display = 'none';
    messagesDiv.classList.remove('hidden');
    messagesDiv.classList.add('flex', 'flex-col');

    const div = document.createElement('div');
    div.className = role === 'user' ? 'msg-user ml-auto max-w-[85%]' : 'msg-ai mr-auto max-w-[90%]';
    
    const formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    div.innerHTML = `<div class="text-sm leading-relaxed text-gray-200">${formattedText}</div>`;
    
    messagesDiv.appendChild(div);
    
    setTimeout(() => {
        chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
    }, 100);
}

function handleSend() {
    const text = userInput.value.trim();
    if (!text) return;

    addMessage('user', text);
    userInput.value = '';
    userInput.style.height = 'auto';

    setTimeout(() => {
        const response = demoResponses[rIdx % demoResponses.length];
        addMessage('assistant', response);
        rIdx++;
    }, 1200);
}

sendBtn.onclick = handleSend;
userInput.onkeydown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
};

userInput.oninput = function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
};

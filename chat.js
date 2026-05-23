// chat.js - VERSIÓN FINAL SIN PROMPT
const barberId = sessionStorage.getItem('chatBarberId');
const barberName = sessionStorage.getItem('chatBarberName') || 'Barbería';

if (!barberId) {
  window.location.href = 'perfil-cliente.html';
}

document.getElementById('chat-title').textContent = `💬 Chat con ${barberName}`;

const msgInput = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');
const chatBox = document.getElementById('chat-messages');

let currentUser = null;
let userName = '';

// 🔥 1. OBTENER USUARIO AUTENTICADO (SIN PROMPT)
async function initChat() {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  
  if (error || !user) {
    alert('Debes iniciar sesión');
    window.location.href = 'auth.html';
    return;
  }
  
  currentUser = user;
  userName = user.user_metadata?.nombre || user.email?.split('@')[0] || 'Cliente';
  
  loadMessages();
  setInterval(loadMessages, 3000);
}

async function loadMessages() {
  if (!chatBox) return;
  
  const { data, error } = await supabaseClient
    .from('messages')
    .select('*')
    .eq('barber_id', barberId)
    .order('created_at', { ascending: true });

  if (error) return;
  chatBox.innerHTML = '';
  
  if (!data?.length) {
    chatBox.innerHTML = '<p style="text-align:center; color:#666; margin-top:50px;">💬 Inicia la conversación</p>';
    return;
  }

  data.forEach(msg => {
    const isMe = msg.user_id === currentUser?.id; // ✅ Compara por ID
    const div = document.createElement('div');
    div.className = `msg ${isMe ? 'client' : 'barber'}`;
    const time = new Date(msg.created_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
    
    div.innerHTML = `
      <div style="white-space:pre-wrap;">${escapeHtml(msg.message)}</div>
      <span style="font-size:0.65rem; opacity:0.6; margin-top:4px; display:block; text-align:right;">
        ${isMe ? 'Tú' : escapeHtml(msg.user_name)} • ${time}
      </span>`;
    chatBox.appendChild(div);
  });
  
  chatBox.scrollTop = chatBox.scrollHeight;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

async function sendMessage() {
  const text = msgInput?.value.trim();
  if (!text || !currentUser) return;
  
  const { error } = await supabaseClient.from('messages').insert([{
    barber_id: barberId,
    user_id: currentUser.id, // ✅ GUARDA USER_ID REAL
    user_name: userName,
    message: text,
    created_at: new Date().toISOString()
  }]);

  if (error) {
    alert('Error: ' + error.message);
    return;
  }
  
  msgInput.value = '';
  loadMessages();
}

// 🔥 2. BOTÓN CON type="button" Y preventDefault
if (sendBtn) sendBtn.onclick = sendMessage;

if (msgInput) {
  msgInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // ✅ EVITA RESET
      sendMessage();
    }
  });
  msgInput.focus();
}

initChat();

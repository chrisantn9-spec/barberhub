// chat.js - CORREGIDO: Sin reset, con usuario autenticado
const barberId = sessionStorage.getItem('chatBarberId');
const barberName = sessionStorage.getItem('chatBarberName') || 'Barbería';

if (!barberId || barberId === 'undefined' || barberId === 'null') {
  window.location.href = 'perfil-cliente.html';
}

document.getElementById('chat-title').textContent = `💬 Chat con ${barberName}`;

const msgInput = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');
const chatBox = document.getElementById('chat-messages');

let currentUser = null;
let userName = '';

// 🔥 1. VALIDAR SESIÓN ANTES DE HACER NADA
async function initChat() {
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error || !user) {
      alert('Debes iniciar sesión para chatear');
      window.location.href = 'auth.html';
      return;
    }
    currentUser = user;
    // Usa el nombre guardado en el registro, NUNCA prompt()
    userName = user.user_metadata?.nombre || user.email.split('@')[0] || 'Cliente';
    
    loadMessages();
    setInterval(loadMessages, 3000); // Polling seguro
  } catch (err) {
    console.error('Error init:', err);
    window.location.href = 'auth.html';
  }
}

async function loadMessages() {
  if (!chatBox || !currentUser) return;
  try {
    const { data, error } = await supabaseClient
      .from('messages')
      .select('*')
      .eq('barber_id', barberId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    chatBox.innerHTML = '';
    
    if (!data?.length) {
      chatBox.innerHTML = '<p style="text-align:center; color:#666; margin-top:50px;">💬 Inicia la conversación</p>';
      return;
    }

    data.forEach(msg => {
      const isMe = msg.user_id === currentUser.id;
      const div = document.createElement('div');
      div.className = `msg ${isMe ? 'client' : 'barber'}`;
      const time = new Date(msg.created_at).toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' });
      
      div.innerHTML = `
        <div style="white-space:pre-wrap; word-wrap:break-word;">${escapeHtml(msg.message)}</div>
        <span style="font-size:0.65rem; opacity:0.6; margin-top:4px; display:block; text-align:right;">
          ${isMe ? 'Tú' : escapeHtml(msg.user_name)} • ${time}
        </span>`;
      chatBox.appendChild(div);
    });
    chatBox.scrollTop = chatBox.scrollHeight;
  } catch (err) { console.error(err); }
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
  
  try {
    const { error } = await supabaseClient.from('messages').insert([{
      barber_id: barberId,
      user_id: currentUser.id, //  Guarda ID real
      user_name: userName,
      message: text,
      created_at: new Date().toISOString()
    }]);
    if (error) throw error;
    msgInput.value = '';
    loadMessages();
  } catch (err) {
    alert('❌ Error: ' + err.message);
  }
}

//  2. EVENTOS SEGUROS (Sin reset)
if (sendBtn) sendBtn.onclick = sendMessage;

if (msgInput) {
  msgInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); //  EVITA EL RESET AL PULSAR ENTER
      sendMessage();
    }
  });
  msgInput.focus();
}

initChat();

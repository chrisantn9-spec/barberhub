// chat.js - VERSIÓN CORREGIDA
const barberId = sessionStorage.getItem('chatBarberId');
let barberName = sessionStorage.getItem('chatBarberName') || 'Barbería';

if (!barberId || barberId === 'undefined' || barberId === 'null') {
  console.warn('No hay barbería seleccionada, redirigiendo...');
  window.location.href = 'perfil-cliente.html';
}

const chatTitle = document.getElementById('chat-title');
if (chatTitle) {
  chatTitle.textContent = `💬 Chat con ${barberName}`;
}

const msgInput = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');
const chatBox = document.getElementById('chat-messages');

// 🔥 OBTENER USUARIO AUTENTICADO
let currentUser = null;
let userName = '';

async function initChat() {
  try {
    const { data: { user }, error } = await supabaseClient.auth.getUser();
    if (error || !user) {
      alert('❌ Debes iniciar sesión para chatear');
      window.location.href = 'auth.html';
      return;
    }
    
    currentUser = user;
    userName = user.user_metadata?.nombre || user.email?.split('@')[0] || 'Cliente';
    
    // Cargar mensajes
    loadMessages();
    
    // Polling cada 3 segundos
    setInterval(loadMessages, 3000);
    
  } catch (err) {
    console.error('Error inicializando chat:', err);
    window.location.href = 'auth.html';
  }
}

// 📥 Cargar mensajes desde Supabase
async function loadMessages() {
  if (!chatBox || !currentUser) return;
  
  try {
    const { data, error } = await supabaseClient
      .from('messages')
      .select('*')
      .eq('barber_id', barberId)
      .or(`user_id.eq.${currentUser.id},barber_owner_id.eq.${currentUser.id}`)
      .order('created_at', { ascending: true });

    if (error) throw error;

    chatBox.innerHTML = '';
    
    if (!data || data.length === 0) {
      chatBox.innerHTML = '<p style="text-align:center; color:#666; margin-top:50px; font-size:0.9rem;">💬 Inicia la conversación</p>';
      return;
    }

    data.forEach(msg => {
      const isMe = msg.user_id === currentUser.id;
      const div = document.createElement('div');
      div.className = `msg ${isMe ? 'client' : 'barber'}`;
      
      const time = new Date(msg.created_at).toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      div.innerHTML = `
        <div style="white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(msg.message)}</div>
        <span class="meta" style="font-size:0.65rem; opacity:0.6; margin-top:4px; display:block; text-align:right;">
          ${isMe ? 'Tú' : escapeHtml(msg.user_name || 'Barbería')} • ${time}
        </span>
      `;
      chatBox.appendChild(div);
    });
    
    chatBox.scrollTop = chatBox.scrollHeight;
    
  } catch (err) {
    console.error('Error cargando mensajes:', err);
  }
}

// 🔒 Escapar HTML
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 📤 Enviar mensaje
async function sendMessage() {
  const text = msgInput?.value.trim();
  if (!text || !currentUser) return;
  
  try {
    const { error } = await supabaseClient
      .from('messages')
      .insert([{
        barber_id: barberId,
        user_id: currentUser.id, // 🔥 AHORA SÍ GUARDAMOS EL USER_ID
        user_name: userName,
        message: text,
        created_at: new Date().toISOString()
      }]);

    if (error) throw error;

    if (msgInput) msgInput.value = '';
    loadMessages();
    
  } catch (err) {
    console.error('Error enviando mensaje:', err);
    alert('❌ No se pudo enviar: ' + err.message);
  }
}

// Event listeners
if (sendBtn) {
  sendBtn.onclick = sendMessage;
}

if (msgInput) {
  msgInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
  });
  msgInput.focus();
}

// Inicializar
if (chatBox) {
  initChat();
}

// Manejar offline/online
window.addEventListener('offline', () => {
  if (chatBox) {
    const notice = document.createElement('p');
    notice.style.cssText = 'text-align:center; color:#ff6666; font-size:0.8rem; padding:10px;';
    notice.textContent = '⚠️ Sin conexión.';
    chatBox.appendChild(notice);
  }
});

window.addEventListener('online', () => {
  loadMessages();
});

// chat.js - Versión limpia sin CORS errors

// Obtener datos del chat desde sessionStorage
const barberId = sessionStorage.getItem('chatBarberId');
let barberName = sessionStorage.getItem('chatBarberName') || 'Barbería';

// Validar que tengamos un ID válido de barbería
if (!barberId || barberId === 'undefined' || barberId === 'null') {
    console.warn('No hay barbería seleccionada, redirigiendo...');
    window.location.href = 'index.html';
}

// Actualizar título del chat
const chatTitle = document.getElementById('chat-title');
if (chatTitle) {
    chatTitle.textContent = `💬 Chat con ${barberName}`;
}

// Referencias al DOM
const msgInput = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');
const chatBox = document.getElementById('chat-messages');

// Obtener o pedir nombre del usuario
let userName = sessionStorage.getItem('chatUserName');
if (!userName) {
    userName = prompt("¿Cómo te llamas?") || "Cliente";
    sessionStorage.setItem('chatUserName', userName);
}

// 📥 FUNCIÓN: Cargar mensajes desde Supabase
async function loadMessages() {
    if (!chatBox) return;
    
    try {
        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('barber_id', barberId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error cargando mensajes:', error);
            return;
        }

        chatBox.innerHTML = '';
        
        if (!data || data.length === 0) {
            chatBox.innerHTML = '<p style="text-align:center; color:#666; margin-top:50px; font-size:0.9rem;">💬 Inicia la conversación</p>';
            return;
        }

        data.forEach(msg => {
            const isMe = msg.user_name === userName;
            const div = document.createElement('div');
            div.className = `msg ${isMe ? 'client' : 'barber'}`;
            
            // Formatear hora
            const time = new Date(msg.created_at).toLocaleTimeString([], { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            
            div.innerHTML = `
                <div style="white-space: pre-wrap; word-wrap: break-word;">${escapeHtml(msg.message)}</div>
                <span class="meta" style="font-size:0.65rem; opacity:0.6; margin-top:4px; display:block; text-align:right;">
                    ${escapeHtml(msg.user_name)} • ${time}
                </span>
            `;
            chatBox.appendChild(div);
        });
        
        // Scroll al fondo
        chatBox.scrollTop = chatBox.scrollHeight;
        
    } catch (err) {
        console.error('Error en loadMessages:', err);
    }
}

// 🔒 FUNCIÓN: Escapar HTML para prevenir XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 📤 FUNCIÓN: Enviar mensaje a Supabase
async function sendMessage() {
    const text = msgInput?.value.trim();
    if (!text) return;

    try {
        const { error } = await supabaseClient
            .from('messages')
            .insert([{
                barber_id: barberId,
                user_name: userName,
                message: text,
                created_at: new Date().toISOString()
            }]);

        if (error) throw error;

        // Limpiar input y recargar
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
    
    // Auto-focus en el input al cargar
    msgInput.focus();
}

// Cargar mensajes al iniciar
if (chatBox) {
    loadMessages();
    
    // Polling cada 3 segundos para nuevos mensajes
    const pollInterval = setInterval(loadMessages, 3000);
    
    // Limpiar intervalo si se sale de la página
    window.addEventListener('beforeunload', () => {
        clearInterval(pollInterval);
    });
}

// Manejar error de red de forma elegante
window.addEventListener('offline', () => {
    if (chatBox) {
        const notice = document.createElement('p');
        notice.style.cssText = 'text-align:center; color:#ff6666; font-size:0.8rem; padding:10px;';
        notice.textContent = '⚠️ Sin conexión. Los mensajes se enviarán cuando recuperes la señal.';
        chatBox.appendChild(notice);
    }
});

window.addEventListener('online', () => {
    loadMessages();
});

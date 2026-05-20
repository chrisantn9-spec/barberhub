// chat.js
const barberId = sessionStorage.getItem('chatBarberId');
const barberName = sessionStorage.getItem('chatBarberName');

if (!barberId) window.location.href = 'index.html';

document.getElementById('chat-title').textContent = `💬 Chat con ${barberName}`;

const msgInput = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');
const chatBox = document.getElementById('chat-messages');

// Pedir nombre al usuario si no está logueado (simple)
let userName = sessionStorage.getItem('chatUserName');
if (!userName) {
    userName = prompt("¿Cómo te llamas?") || "Cliente Anónimo";
    sessionStorage.setItem('chatUserName', userName);
}

//  Cargar mensajes
async function loadMessages() {
    const { data, error } = await supabaseClient
        .from('messages')
        .select('*')
        .eq('barber_id', barberId)
        .order('created_at', { ascending: true });

    if (error) return;

    chatBox.innerHTML = '';
    data.forEach(msg => {
        const div = document.createElement('div');
        // Si el nombre coincide con el nuestro, lo ponemos a la derecha (cliente)
        const isMe = msg.user_name === userName;
        div.className = `msg ${isMe ? 'client' : 'barber'}`;
        div.innerHTML = `
            ${msg.message}
            <span class="meta">${msg.user_name} • ${new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        `;
        chatBox.appendChild(div);
    });
    // Auto-scroll al fondo
    chatBox.scrollTop = chatBox.scrollHeight;
}

//  Enviar mensaje
async function sendMessage() {
    const text = msgInput.value.trim();
    if (!text) return;

    const { error } = await supabaseClient.from('messages').insert([{
        barber_id: barberId,
        user_name: userName,
        message: text
    }]);

    if (!error) {
        msgInput.value = '';
        loadMessages();
    }
}

// Eventos
sendBtn.onclick = sendMessage;
msgInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// Inicializar y actualizar cada 3 segundos
loadMessages();
setInterval(loadMessages, 3000);
// Marcar mensajes como leídos cuando se abre el chat
async function markMessagesAsRead() {
    const barberId = sessionStorage.getItem('chatBarberId');
    if (!barberId) return;

    await supabaseClient
        .from('messages')
        .update({ is_read: true })
        .eq('barber_id', barberId)
        .eq('is_read', false);
}

// Llamar esta función cuando se carga el chat
document.addEventListener('DOMContentLoaded', () => {
    loadMessages();
    markMessagesAsRead(); // <-- Agregar esto
    setInterval(loadMessages, 3000);
});

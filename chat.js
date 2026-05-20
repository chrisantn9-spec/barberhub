// chat.js
const barberId = sessionStorage.getItem('chatBarberId');
let barberName = sessionStorage.getItem('chatBarberName') || 'Barbería';

if (!barberId) {
    window.location.href = 'index.html';
}

// ✅ ACTUALIZAR TÍTULO
document.getElementById('chat-title').textContent = `💬 Chat con ${barberName}`;

const msgInput = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');
const chatBox = document.getElementById('chat-messages');

let userName = sessionStorage.getItem('chatUserName');
if (!userName) {
    userName = prompt("¿Cómo te llamas?") || "Cliente";
    sessionStorage.setItem('chatUserName', userName);
}

// 📥 CARGAR MENSAJES
async function loadMessages() {
    try {
        const { data, error } = await supabaseClient
            .from('messages')
            .select('*')
            .eq('barber_id', barberId)
            .order('created_at', { ascending: true });

        if (error) throw error;

        chatBox.innerHTML = '';
        data.forEach(msg => {
            const isMe = msg.user_name === userName;
            const div = document.createElement('div');
            div.className = `msg ${isMe ? 'client' : 'barber'}`;
            div.innerHTML = `
                ${msg.message}
                <span class="meta">${msg.user_name} • ${new Date(msg.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
            `;
            chatBox.appendChild(div);
        });
        chatBox.scrollTop = chatBox.scrollHeight;
    } catch (err) {
        console.error("Error cargando mensajes:", err);
    }
}

// 📤 ENVIAR MENSAJE
async function sendMessage() {
    const text = msgInput.value.trim();
    if (!text) return;

    try {
        const { error } = await supabaseClient.from('messages').insert([{
            barber_id: barberId,
            user_name: userName,
            message: text
        }]);

        if (error) throw error;

        msgInput.value = '';
        loadMessages();
    } catch (err) {
        console.error("Error enviando:", err);
        alert("❌ No se pudo enviar: " + err.message);
    }
}

sendBtn.onclick = sendMessage;
msgInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendMessage(); });

loadMessages();
setInterval(loadMessages, 3000);

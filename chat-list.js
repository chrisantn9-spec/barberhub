// chat-list.js - CORREGIDO: Solo muestra TUS chats
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user } } = await supabaseClient.auth.getUser();
  if (!user) { window.location.href = 'auth.html'; return; }
  loadChatList(user.id);
});

async function loadChatList(currentUserId) {
  const container = document.getElementById('chat-list');
  try {
    // 🔥 Filtra SOLO mensajes donde TÚ eres el remitente
    const { data: messages, error } = await supabaseClient
      .from('messages')
      .select('barber_id, created_at, message')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!messages?.length) {
      container.innerHTML = '<p style="text-align:center; color:#888; padding:40px;">📭 No tienes conversaciones aún.</p>';
      return;
    }

    const chatMap = new Map();
    messages.forEach(m => {
      if (!chatMap.has(m.barber_id)) chatMap.set(m.barber_id, { last: m.message, time: m.created_at });
    });

    const { data: barbers } = await supabaseClient
      .from('barbers')
      .select('id, name, photos')
      .in('id', Array.from(chatMap.keys()));

    container.innerHTML = '';
    if (!barbers) return;

    barbers.sort((a,b) => new Date(chatMap.get(b.id).time) - new Date(chatMap.get(a.id).time));

    barbers.forEach(b => {
      const c = chatMap.get(b.id);
      const div = document.createElement('div');
      div.className = 'chat-item';
      div.onclick = () => { 
        sessionStorage.setItem('chatBarberId', b.id); 
        sessionStorage.setItem('chatBarberName', b.name); 
        window.location.href = 'chat.html'; 
      };
      
      let img = b.photos ? JSON.parse(b.photos)[0] : null;
      div.innerHTML = `
        ${img ? `<img src="${img}" style="width:45px;height:45px;border-radius:50%;object-fit:cover;">` : `<div class="chat-avatar">${b.name[0]}</div>`}
        <div class="chat-info">
          <div class="chat-name">${b.name}</div>
          <div class="chat-preview">${c.last}</div>
        </div>
        <div class="chat-time">${new Date(c.time).toLocaleDateString()}</div>`;
      container.appendChild(div);
    });
  } catch (err) { 
    console.error(err);
    container.innerHTML = '<p style="color:#ff3333; text-align:center;">Error cargando chats.</p>'; 
  }
}

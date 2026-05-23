// chat-list.js - FILTRA POR TU USUARIO AUTENTICADO
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
  if (authError || !user) {
    window.location.href = 'auth.html';
    return;
  }
  loadChatList(user.id);
});

async function loadChatList(currentUserId) {
  const container = document.getElementById('chat-list');
  try {
    // Obtener SOLO tus mensajes
    const { data: messages, error } = await supabaseClient
      .from('messages')
      .select('barber_id, created_at, message')
      .eq('user_id', currentUserId)
      .order('created_at', { ascending: false });

    if (error || !messages || messages.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:#888; padding:40px;">📭 No tienes conversaciones aún.</p>';
      return;
    }

    const chatMap = new Map();
    messages.forEach(m => {
      if (!chatMap.has(m.barber_id)) {
        chatMap.set(m.barber_id, { last: m.message, time: m.created_at });
      }
    });

    const barberIds = Array.from(chatMap.keys());
    const { data: barbers } = await supabaseClient
      .from('barbers')
      .select('id, name, photos')
      .in('id', barberIds);

    container.innerHTML = '';
    if (!barbers || barbers.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:#888;">No se encontraron barberías.</p>';
      return;
    }

    barbers.sort((a, b) => new Date(chatMap.get(b.id).time) - new Date(chatMap.get(a.id).time));

    barbers.forEach(barber => {
      const chatData = chatMap.get(barber.id);
      const div = document.createElement('div');
      div.className = 'chat-item';
      div.onclick = () => {
        sessionStorage.setItem('chatBarberId', barber.id);
        sessionStorage.setItem('chatBarberName', barber.name);
        window.location.href = 'chat.html';
      };

      let avatarHtml;
      try {
        const photos = barber.photos ? JSON.parse(barber.photos) : [];
        avatarHtml = photos[0] 
          ? `<img src="${photos[0]}" style="width:50px;height:50px;border-radius:50%;object-fit:cover;border:2px solid var(--neon-cyan);">`
          : `<div class="chat-avatar">${barber.name.charAt(0).toUpperCase()}</div>`;
      } catch {
        avatarHtml = `<div class="chat-avatar">${barber.name.charAt(0).toUpperCase()}</div>`;
      }

      div.innerHTML = `
        ${avatarHtml}
        <div class="chat-info">
          <div class="chat-name">${barber.name}</div>
          <div class="chat-preview">${chatData.last}</div>
        </div>
        <div class="chat-time">${new Date(chatData.time).toLocaleDateString()}</div>
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error('Error cargando chats:', err);
    container.innerHTML = '<p style="text-align:center; color:#ff3333;">Error cargando conversaciones.</p>';
  }
}

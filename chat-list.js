// chat-list.js - CORREGIDO: Usa usuario autenticado
document.addEventListener('DOMContentLoaded', async () => {
  const { data: { user }, error } = await supabaseClient.auth.getUser();
  
  if (error || !user) {
    window.location.href = 'auth.html';
    return;
  }
  
  loadChatList(user);
});

async function loadChatList(currentUser) {
  const container = document.getElementById('chat-list');
  
  try {
    // 🔥 Filtrar por user_id del usuario autenticado
    const { data: messages, error } = await supabaseClient
      .from('messages')
      .select('barber_id, created_at, message, user_name')
      .eq('user_id', currentUser.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!messages || messages.length === 0) {
      container.innerHTML = '<p style="text-align:center; color:#888; padding:40px;">📭 No tienes conversaciones aún.</p>';
      return;
    }

    // Agrupar por barbería
    const chatMap = new Map();
    messages.forEach(msg => {
      if (!chatMap.has(msg.barber_id)) {
        chatMap.set(msg.barber_id, { 
          last_message: msg.message, 
          last_time: msg.created_at 
        });
      }
    });

    const barberIds = Array.from(chatMap.keys());
    
    const { data: barbers } = await supabaseClient
      .from('barbers')
      .select('id, name, photos')
      .in('id', barberIds);

    container.innerHTML = '';
    
    if (!barbers) { 
      container.innerHTML = '<p style="text-align:center; color:#888;">No se encontraron barberías.</p>'; 
      return; 
    }

    barbers.sort((a, b) => 
      new Date(chatMap.get(b.id).last_time) - new Date(chatMap.get(a.id).last_time)
    );

    barbers.forEach(barber => {
      const chatData = chatMap.get(barber.id);
      const div = document.createElement('div');
      div.className = 'chat-item';
      div.onclick = () => { 
        sessionStorage.setItem('chatBarberId', barber.id); 
        sessionStorage.setItem('chatBarberName', barber.name); 
        window.location.href = 'chat.html'; 
      };

      const initial = barber.name.charAt(0).toUpperCase();
      let avatarHtml = `<div class="chat-avatar">${initial}</div>`;
      
      if (barber.photos) { 
        try { 
          const photos = JSON.parse(barber.photos); 
          if (photos[0]) {
            avatarHtml = `<img src="${photos[0]}" style="width:50px; height:50px; border-radius:50%; object-fit:cover; border:2px solid var(--neon-cyan);">`; 
          }
        } catch(e) {} 
      }

      div.innerHTML = `${avatarHtml}
        <div class="chat-info">
          <div class="chat-name">${barber.name}</div>
          <div class="chat-preview">${chatData.last_message}</div>
        </div>
        <div class="chat-time">${new Date(chatData.last_time).toLocaleDateString()}</div>
      `;
      
      container.appendChild(div);
    });
    
  } catch (err) { 
    console.error('Error:', err);
    container.innerHTML = '<p style="text-align:center; color:#ff3333;">Error cargando chats.</p>'; 
  }
}

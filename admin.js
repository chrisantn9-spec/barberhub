// Verificar sesión al inicio
supabaseClient.auth.getSession().then(async ({ data: { session } }) => {
    if (!session) {
        window.location.href = 'auth.html';
        return;
    }
    
    // Inicializar fecha en "HOY"
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('filter-date').value = today;
    
    // Cargar turnos de hoy
    await loadBookings(today);
});

async function loadBookings(selectedDate) {
    const list = document.getElementById('bookings-list');
    const summary = document.getElementById('summary-stats');
    
    if(!selectedDate) return; // Si no hay fecha, no hace nada
    
    list.innerHTML = '<p class="loading">Cargando turnos...</p>';
    summary.textContent = "⏳ Cargando...";

    const { data: { session } } = await supabaseClient.auth.getSession();
    const userId = session.user.id;

    // 1. Buscar ID de la barbería del usuario
    const { data: barbers } = await supabaseClient
        .from('barbers')
        .select('id, name')
        .eq('owner_id', userId)
        .limit(1);

    if (!barbers || barbers.length === 0) {
        list.innerHTML = `<p class="error">⚠️ No tienes perfil de barbería. <a href="registro-barbero.html" style="color:var(--neon-cyan)">Crear perfil</a></p>`;
        return;
    }

    const barberId = barbers[0].id;
    summary.textContent = `📍 ${barbers[0].name} | 📅 ${selectedDate}`;

    // 2. Buscar turnos para esa FECHA específica
    const { data, error } = await supabaseClient
        .from('bookings')
        .select('*')
        .eq('barber_id', barberId)
        .eq('booking_date', selectedDate) // <--- FILTRO POR FECHA
        .order('booking_time', { ascending: true });

    if (error) {
        list.innerHTML = `<p class="error">❌ Error: ${error.message}</p>`;
        return;
    }

    list.innerHTML = ""; // Limpiar lista

    if (data.length === 0) {
        list.innerHTML = `<div style="text-align:center; padding:40px; color:#888;">
            <h2 style="font-size:3rem; margin-bottom:10px;"></h2>
            <p>No hay turnos para este día.</p>
        </div>`;
        summary.textContent += " | (0 turnos)";
        return;
    }

    // Contadores
    let confirmedCount = 0;
    let pendingCount = 0;

    data.forEach(b => {
        if(b.status === 'confirmed') confirmedCount++;
        else pendingCount++;

        const card = document.createElement('div');
        card.className = 'barber-card';
        
        const sc = b.status === 'confirmed' ? 'confirmed' : b.status === 'cancelled' ? 'cancelled' : '';
        
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                <span style="font-size:1.2rem; font-weight:bold; color:var(--neon-cyan);">${b.booking_time}</span>
                <span class="status ${sc}">${b.status.toUpperCase()}</span>
            </div>
            <p>👤 ${b.client_name}</p>
            <p>📞 ${b.client_phone}</p>
            <div class="action-btns">
                ${b.status === 'pending' ? `
                    <button class="btn-confirm" onclick="updateStatus('${b.id}','confirmed')">✅ Confirmar</button>
                    <button class="btn-cancel" onclick="updateStatus('${b.id}','cancelled')">❌ Cancelar</button>
                ` : ''}
                <button class="btn-wa" onclick="sendWhatsApp('${b.client_phone}','${b.booking_date}','${b.booking_time}','${b.status}')">💬 WhatsApp</button>
            </div>
        `;
        list.appendChild(card);
    });

    summary.textContent += ` | ✅ ${confirmedCount} Confirmados | ⏳ ${pendingCount} Pendientes`;
}

async function updateStatus(id, s) {
    if(!confirm('¿Cambiar estado?')) return;
    const { error } = await supabaseClient.from('bookings').update({ status: s }).eq('id', id);
    if(error) alert("❌ "+error.message); 
    else loadBookings(document.getElementById('filter-date').value);
}

function sendWhatsApp(phone, date, time, status) {
    const c = phone.replace(/[^0-9]/g,"");
    const text = `Hola! 👋 Tu turno está ${status}.\n ${date} a las ${time}.\n¡Te esperamos! 💈`;
    window.open(`https://wa.me/${c}?text=${encodeURIComponent(text)}`, "_blank");
}

async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = 'auth.html';
}

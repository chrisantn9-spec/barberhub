// Esperar a que el DOM esté listo
document.addEventListener("DOMContentLoaded", async () => {
    await initAdmin();
});

async function initAdmin() {
    const list = document.getElementById('bookings-list');
    
    // 1. Verificar sesión
    const { data: { session }, error: sessionError } = await supabaseClient.auth.getSession();
    
    if (sessionError || !session) {
        console.log("🔐 No hay sesión activa, redirigiendo a login...");
        window.location.href = 'auth.html';
        return;
    }
    
    const userId = session.user.id;
    console.log("✅ Usuario autenticado:", userId);
    
    // 2. Inicializar fecha en HOY
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('filter-date');
    if (dateInput) {
        dateInput.value = today;
    }
    
    // 3. Cargar turnos
    await loadBookings(today);
}

async function loadBookings(selectedDate) {
    const list = document.getElementById('bookings-list');
    const summary = document.getElementById('summary-stats');
    
    if (!selectedDate) return;
    
    list.innerHTML = '<p class="loading">Cargando turnos...</p>';
    if (summary) summary.textContent = "⏳ Buscando tu barbería...";

    const { data: { session } } = await supabaseClient.auth.getSession();
    const userId = session.user.id;

    // 4. Buscar la barbería vinculada a este usuario
    const { data: barbers, error: barberError } = await supabaseClient
        .from('barbers')
        .select('id, name, location')
        .eq('owner_id', userId)
        .limit(1);

    if (barberError || !barbers || barbers.length === 0) {
        list.innerHTML = `
            <div style="text-align:center; padding:40px; background:var(--glass-bg); border-radius:12px;">
                <p style="font-size:3rem; margin-bottom:10px;">⚠️</p>
                <p style="margin-bottom:15px;">No tienes una barbería registrada.</p>
                <a href="registro-barbero.html" style="
                    background:var(--neon-cyan); 
                    color:#000; 
                    padding:10px 20px; 
                    border-radius:6px; 
                    text-decoration:none; 
                    font-weight:700;
                ">Crear mi barbería ahora</a>
            </div>`;
        if (summary) summary.textContent = "";
        return;
    }

    const barberId = barbers[0].id;
    const barberName = barbers[0].name;
    
    if (summary) {
        summary.textContent = `📍 ${barberName} | 📅 ${selectedDate}`;
    }

    // 5. Buscar turnos para esa fecha y barbería
    const { data, error } = await supabaseClient
        .from('bookings')
        .select('*')
        .eq('barber_id', barberId)
        .eq('booking_date', selectedDate)
        .order('booking_time', { ascending: true });

    if (error) {
        list.innerHTML = `<p class="error">❌ Error: ${error.message}</p>`;
        return;
    }

    list.innerHTML = ""; // Limpiar

    if (!data || data.length === 0) {
        list.innerHTML = `
            <div style="text-align:center; padding:40px; color:#888;">
                <p style="font-size:4rem; margin-bottom:10px;">📭</p>
                <p>No hay turnos para este día.</p>
                <p style="font-size:0.9rem; margin-top:10px;">Selecciona otra fecha o espera nuevas reservas.</p>
            </div>`;
        if (summary) summary.textContent += " | (0 turnos)";
        return;
    }

    // Contadores
    let confirmedCount = 0;
    let pendingCount = 0;

    data.forEach(b => {
        if (b.status === 'confirmed') confirmedCount++;
        else if (b.status === 'pending') pendingCount++;

        const card = document.createElement('div');
        card.className = 'barber-card';
        
        const statusClass = b.status === 'confirmed' ? 'confirmed' : b.status === 'cancelled' ? 'cancelled' : 'pending';
        
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid var(--glass-border); padding-bottom:8px;">
                <span style="font-size:1.3rem; font-weight:bold; color:var(--neon-cyan); font-family:'Orbitron', sans-serif;">${b.booking_time}</span>
                <span class="status ${statusClass}" style="padding:4px 10px; border-radius:4px; font-size:0.8rem; font-weight:700;">${b.status.toUpperCase()}</span>
            </div>
            <p style="margin:5px 0;"><strong>👤</strong> ${b.client_name}</p>
            <p style="margin:5px 0;"><strong>📞</strong> ${b.client_phone}</p>
            <p style="margin:5px 0; color:#888;"><strong>📅</strong> ${b.booking_date}</p>
            <div class="action-btns" style="margin-top:15px; display:flex; gap:8px; flex-wrap:wrap;">
                ${b.status === 'pending' ? `
                    <button class="btn-confirm" onclick="updateStatus('${b.id}','confirmed')" style="flex:1; background:#00ff88; color:#000; border:none; padding:8px; border-radius:5px; cursor:pointer; font-weight:700;">✅ Confirmar</button>
                    <button class="btn-cancel" onclick="updateStatus('${b.id}','cancelled')" style="flex:1; background:#ff3333; color:#fff; border:none; padding:8px; border-radius:5px; cursor:pointer; font-weight:700;">❌ Cancelar</button>
                ` : ''}
                <button class="btn-wa" onclick="sendWhatsApp('${b.client_phone}','${b.booking_date}','${b.booking_time}','${b.status}')" style="flex:1; background:#25D366; color:#fff; border:none; padding:8px; border-radius:5px; cursor:pointer; font-weight:700;">💬 WhatsApp</button>
            </div>
        `;
        list.appendChild(card);
    });

    if (summary) {
        summary.textContent += ` | ✅ ${confirmedCount} Confirmados | ⏳ ${pendingCount} Pendientes`;
    }
}

async function updateStatus(id, newStatus) {
    if (!confirm(`¿Cambiar estado a ${newStatus === 'confirmed' ? 'CONFIRMADO' : 'CANCELADO'}?`)) return;
    
    const { error } = await supabaseClient
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', id);
    
    if (error) {
        alert("❌ Error: " + error.message);
    } else {
        // Recargar con la fecha actual
        const date = document.getElementById('filter-date').value;
        await loadBookings(date);
    }
}

function sendWhatsApp(phone, date, time, status) {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    const text = `Hola! 👋 Tu turno está ${status}.\n📅 ${date} a las ${time}.\n¡Te esperamos! 💈`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
}

async function logout() {
    await supabaseClient.auth.signOut();
    window.location.href = 'auth.html';
}

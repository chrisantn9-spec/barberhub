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

let isLoading = false; //  Evita ejecuciones simultáneas

async function loadBookings(selectedDate) {
    if (isLoading || !selectedDate) return;
    isLoading = true;

    const list = document.getElementById('bookings-list');
    const summary = document.getElementById('summary-stats');
    
    list.innerHTML = '<p class="loading">⏳ Cargando turnos...</p>';
    if (summary) summary.textContent = "🔍 Preparando agenda...";

    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) { window.location.href = 'auth.html'; return; }

        // 1. Obtener ID de la barbería (cacheado en memoria si es posible)
        const { data: barbers } = await supabaseClient
            .from('barbers')
            .select('id, name')
            .eq('owner_id', session.user.id)
            .limit(1)
            .single();

        if (!barbers) throw new Error("No se encontró tu perfil de barbería");

        if (summary) summary.textContent = `📍 ${barbers.name} | 📅 ${selectedDate}`;

        // 2. Consulta optimizada: solo columnas necesarias + límite de seguridad
        const { data, error } = await supabaseClient
            .from('bookings')
            .select('id, client_name, client_phone, booking_date, booking_time, status, created_at')
            .eq('barber_id', barbers.id)
            .eq('booking_date', selectedDate)
            .order('booking_time', { ascending: true })
            .limit(50); // 🛡️ Protección contra carga masiva

        if (error) throw error;

        list.innerHTML = ""; // Limpiar loading

        if (!data || data.length === 0) {
            list.innerHTML = `<div style="text-align:center; padding:40px; color:#888;">
                <p style="font-size:3rem;">📭</p><p>No hay turnos para este día.</p>
            </div>`;
            if (summary) summary.textContent += " | (0 turnos)";
            return;
        }

        // 3. Renderizado optimizado (DocumentFragment evita repaints múltiples)
        const fragment = document.createDocumentFragment();
        let confirmed = 0, pending = 0;

        data.forEach(b => {
            if (b.status === 'confirmed') confirmed++;
            else if (b.status === 'pending') pending++;

            const card = document.createElement('div');
            card.className = 'barber-card';
            const statusClass = b.status === 'confirmed' ? 'confirmed' : b.status === 'cancelled' ? 'cancelled' : 'pending';
            const cleanPhone = b.client_phone.replace(/[^0-9]/g, "");

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; border-bottom:1px solid var(--glass-border); padding-bottom:8px;">
                    <span style="font-size:1.3rem; font-weight:bold; color:var(--neon-cyan); font-family:'Orbitron', sans-serif;">${b.booking_time}</span>
                    <span class="status ${statusClass}">${b.status.toUpperCase()}</span>
                </div>
                <p>👤 ${b.client_name}</p>
                <p>📞 ${b.client_phone}</p>
                <div class="action-btns" style="margin-top:12px; display:flex; gap:8px; flex-wrap:wrap;">
                    ${b.status === 'pending' ? `
                        <button class="btn-confirm" onclick="confirmBooking('${b.id}','${cleanPhone}','${b.client_name}','${b.booking_date}','${b.booking_time}')">✅ CONFIRMAR</button>
                        <button class="btn-cancel" onclick="updateStatus('${b.id}','cancelled')">❌ CANCELAR</button>
                    ` : ''}
                    <button class="btn-wa" onclick="sendWhatsApp('${cleanPhone}','${b.booking_date}','${b.booking_time}','${b.status}')">💬 WhatsApp</button>
                </div>`;
            fragment.appendChild(card);
        });

        list.appendChild(fragment); // ⚡ Renderizado en 1 solo paso
        if (summary) summary.textContent += ` | ✅ ${confirmed} | ⏳ ${pending}`;

    } catch (err) {
        console.error(err);
        list.innerHTML = `<p class="error">❌ ${err.message}</p>`;
    } finally {
        isLoading = false; // 🔓 Liberar bloqueo
    }
}

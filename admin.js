// ============================================
// BARBERHUB - admin.js (Versión Optimizada)
// ============================================

document.addEventListener("DOMContentLoaded", async () => {
    await initAdmin();
});

async function initAdmin() {
    const list = document.getElementById('bookings-list');
if (!list) {
    console.error('❌ No se encontró el elemento #bookings-list');
    return;
}
    
    // Verificar sesión
    try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        
        if (error || !session) {
            console.log("🔐 Sin sesión, redirigiendo a login...");
            window.location.replace('auth.html');
            return;
        }
    } catch (err) {
        console.error("Error verificando sesión:", err);
        window.location.replace('auth.html');
        return;
    }
    
    // Fecha por defecto: HOY
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('filter-date');
    if (dateInput) dateInput.value = today;
    
    // Cargar turnos
    await loadBookings(today);
}

// Flag para evitar doble carga
let isLoading = false;

async function loadBookings(selectedDate) {
    if (isLoading || !selectedDate) return;
    isLoading = true;

    const list = document.getElementById('bookings-list');
    const summary = document.getElementById('summary-stats');
    
    list.innerHTML = '<p class="loading">⏳ Cargando turnos...</p>';
    if (summary) summary.textContent = "🔍 Preparando agenda...";

    try {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) { window.location.replace('auth.html'); return; }

        // Obtener barbería del usuario
        const { data: barbers, error: barberError } = await supabaseClient
            .from('barbers')
            .select('id, name')
            .eq('owner_id', session.user.id)
            .limit(1)
            .single();

        if (barberError || !barbers) {
            list.innerHTML = `<div style="text-align:center; padding:40px; background:var(--glass-bg); border-radius:12px;">
                <p>⚠️ No tienes perfil de barbería.</p>
                <a href="registro-barbero.html" style="color:var(--neon-cyan)">Crear perfil</a>
            </div>`;
            return;
        }

        if (summary) summary.textContent = `📍 ${barbers.name} | 📅 ${selectedDate}`;

        // Consulta optimizada de turnos
        const { data, error } = await supabaseClient
            .from('bookings')
            .select('id, client_name, client_phone, booking_date, booking_time, status, created_at')
            .eq('barber_id', barbers.id)
            .eq('booking_date', selectedDate)
            .order('booking_time', { ascending: true })
            .limit(50);

        if (error) throw error;

        list.innerHTML = "";

        if (!data || data.length === 0) {
            list.innerHTML = `<div style="text-align:center; padding:40px; color:#888;">
                <p style="font-size:3rem;">📭</p><p>No hay turnos para este día.</p>
            </div>`;
            if (summary) summary.textContent += " | (0 turnos)";
            return;
        }

        // Renderizado optimizado con DocumentFragment
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

        list.appendChild(fragment);
        if (summary) summary.textContent += ` | ✅ ${confirmed} | ⏳ ${pending}`;

    } catch (err) {
        console.error("Error cargando turnos:", err);
        list.innerHTML = `<p class="error">❌ ${err.message}</p>`;
    } finally {
        isLoading = false;
    }
}

// ✅ CONFIRMAR + ABRIR WHATSAPP
async function confirmBooking(id, phone, name, date, time) {
    if (!confirm(`¿Confirmar turno para ${name}? Se abrirá WhatsApp para avisarle.`)) return;

    try {
        const { error } = await supabaseClient
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', id);

        if (error) throw error;

        // Preparar y abrir WhatsApp
        const message = `Hola ${name} 👋, tu turno en BarberHub ha sido CONFIRMADO ✅.\n📅 Fecha: ${date}\n⏰ Hora: ${time}\n¡Te esperamos! 💈`;
        const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
        
        // Recargar lista
        await loadBookings(document.getElementById('filter-date').value);
        
    } catch (err) {
        console.error(err);
        alert("❌ Error al confirmar: " + err.message);
    }
}

// Actualizar estado (cancelar, etc.)
async function updateStatus(id, newStatus) {
    if (!confirm(`¿Cambiar estado a ${newStatus}?`)) return;
    
    try {
        const { error } = await supabaseClient
            .from('bookings')
            .update({ status: newStatus })
            .eq('id', id);
            
        if (error) throw error;
        await loadBookings(document.getElementById('filter-date').value);
        
    } catch (err) {
        alert("❌ " + err.message);
    }
}

// Enviar WhatsApp manual
function sendWhatsApp(phone, date, time, status) {
    const text = `Hola! 👋 Recordatorio de tu turno en BarberHub.\n📅 ${date} a las ${time}.\nEstado: ${status}\n💈`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank");
}

// 🔐 LOGOUT ROBUSTO Y A PRUEBA DE FALLOS
async function logout() {
    console.log("🚪 Cerrando sesión...");
    
    try {
        // 1. Cerrar sesión en Supabase
        await supabaseClient.auth.signOut();
        
        // 2. Limpiar almacenamiento local
        localStorage.clear();
        sessionStorage.clear();
        
        // 3. Forzar redirección limpia (replace evita que "atrás" regrese al panel)
        console.log("✅ Sesión cerrada, redirigiendo...");
        window.location.replace("auth.html");
        
    } catch (error) {
        console.error("❌ Error al cerrar sesión:", error);
        // Incluso si hay error, forzamos la redirección
        window.location.replace("auth.html?loggedout=true");
    }
}

// 🌍 EXPOSICIÓN GLOBAL DE FUNCIONES (para onclick en HTML)
window.logout = logout;
window.loadBookings = loadBookings;
window.confirmBooking = confirmBooking;
window.updateStatus = updateStatus;
window.sendWhatsApp = sendWhatsApp;
window.initAdmin = initAdmin;

console.log("✅ admin.js inicializado correctamente");

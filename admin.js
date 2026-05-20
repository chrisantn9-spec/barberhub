let currentBarber = null;

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { window.location.href = 'auth.html'; return; }

    // 1. Obtener datos del barbero logueado
    const { data: barberData } = await supabaseClient.from('barbers').select('*').eq('owner_id', user.id).single();
    if (!barberData) {
        alert("No se encontró tu perfil de barbero.");
        return;
    }
    currentBarber = barberData;
    document.getElementById('barber-name').textContent = barberData.name;

    // 2. Cargar datos
    loadBookings();
    loadServices();
});

// 📅 CARGAR CITAS
async function loadBookings() {
    const { data, error } = await supabaseClient
        .from('bookings')
        .select('*, services(name, price)')
        .eq('barber_id', currentBarber.id)
        .order('booked_at', { ascending: true });

    const list = document.getElementById('bookings-list');
    if (!data || data.length === 0) {
        list.innerHTML = '<p style="text-align:center;">No hay citas aún.</p>';
        return;
    }

    list.innerHTML = '';
    let pending = 0;
    let confirmed = 0;

    data.forEach(booking => {
        if (booking.status === 'pending') pending++;
        if (booking.status === 'confirmed') confirmed++;

        const item = document.createElement('div');
        item.style.cssText = 'background:rgba(255,255,255,0.05); padding:10px; margin:5px 0; border-radius:5px; display:flex; justify-content:space-between; align-items:center; border-left: 3px solid ' + (booking.status === 'confirmed' ? '#00ff88' : '#ffaa00');
        item.innerHTML = `
            <div>
                <strong style="color:#fff;">${booking.client_name || booking.client_email}</strong><br>
                <span style="font-size:0.8rem; color:#aaa;">${booking.services?.name || 'Sin servicio'} - $${booking.services?.price}</span><br>
                <span style="font-size:0.75rem; color:var(--neon-cyan);"> ${new Date(booking.booked_at).toLocaleString()}</span>
            </div>
            <button onclick="confirmBooking('${booking.id}')" style="background:${booking.status === 'confirmed' ? '#333' : 'var(--neon-cyan)'}; color:${booking.status === 'confirmed' ? '#666' : '#000'}; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-weight:bold;">${booking.status === 'confirmed' ? '✔ Listo' : '✅ Confirmar'}</button>
        `;
        list.appendChild(item);
    });

    document.getElementById('stat-pending').textContent = pending;
    document.getElementById('stat-confirmed').textContent = confirmed;
}

// ✅ CONFIRMAR CITA
window.confirmBooking = async (id) => {
    await supabaseClient.from('bookings').update({ status: 'confirmed' }).eq('id', id);
    loadBookings();
};

// ✂️ CARGAR Y AGREGAR SERVICIOS
async function loadServices() {
    const { data } = await supabaseClient.from('services').select('*').eq('barber_id', currentBarber.id);
    const list = document.getElementById('services-list');
    list.innerHTML = '';
    data.forEach(s => {
        list.innerHTML += `<span style="background:#222; padding:5px 10px; margin:2px; border-radius:4px; font-size:0.85rem;">${s.name} ($${s.price}) </span>`;
    });
}

window.addService = async () => {
    const name = document.getElementById('new-service-name').value;
    const price = document.getElementById('new-service-price').value;
    if (!name || !price) return alert('Llena los campos');

    await supabaseClient.from('services').insert({ barber_id: currentBarber.id, name, price });
    document.getElementById('new-service-name').value = '';
    document.getElementById('new-service-price').value = '';
    loadServices();
};

function logout() { supabaseClient.auth.signOut().then(() => window.location.href = 'index.html'); }

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { window.location.href = 'auth.html'; return; }

    const { data, error } = await supabaseClient
        .from('bookings')
        .select('*, services(name, price)')
        .eq('client_email', user.email)
        .order('booked_at', { ascending: true });

    const list = document.getElementById('bookings-list');
    list.innerHTML = '';
    if (!data || data.length === 0) {
        list.innerHTML = '<p style="text-align:center; color:#888;">No tienes citas aún.</p>';
        return;
    }

    data.forEach(b => {
        const statusClass = b.status === 'confirmed' ? 'status-confirmed' : b.status === 'cancelled' ? 'status-cancelled' : 'status-pending';
        const div = document.createElement('div');
        div.className = 'booking-card';
        div.innerHTML = `
            <div>
                <strong style="color:#fff;">${b.services?.name || 'Servicio'}</strong><br>
                <span style="font-size:0.85rem; color:#aaa;">📅 ${new Date(b.booked_at).toLocaleString()}</span>
                <span class="status-badge ${statusClass}" style="margin-left:10px;">${b.status.toUpperCase()}</span>
            </div>
            ${b.status === 'pending' ? `<button class="btn-cancel" onclick="cancelBooking('${b.id}')">Cancelar</button>` : ''}
        `;
        list.appendChild(div);
    });
});

window.cancelBooking = async (id) => {
    if (!confirm('¿Seguro que quieres cancelar esta cita?')) return;
    await supabaseClient.from('bookings').update({ status: 'cancelled' }).eq('id', id);
    location.reload();
};

async function checkMyBookings() {
    const phoneInput = document.getElementById("client-phone-input").value.trim();
    const listDiv = document.getElementById("my-bookings-list");
    const stepLogin = document.getElementById("step-login");
    const stepList = document.getElementById("step-list");
    const displayPhone = document.getElementById("user-phone-display");

    if (!phoneInput) {
        alert("Por favor ingresa tu número de teléfono");
        return;
    }

    // Limpiar formato para buscar (quitar espacios, guiones, etc.)
    const cleanPhone = phoneInput.replace(/[^0-9]/g, "");

    // UI Loading
    stepLogin.style.display = "none";
    stepList.style.display = "block";
    listDiv.innerHTML = '<p class="loading">🔍 Buscando tus citas...</p>';
    displayPhone.textContent = `📱 ${phoneInput}`;

    try {
        // Buscar citas donde el teléfono coincida (parcialmente o exacto)
        // Usamos 'like' para ser flexibles si el usuario puso el código de país o no
        const { data, error } = await supabaseClient
            .from('bookings')
            .select(`
                *,
                barbers (name, location, phone)
            `)
            .ilike('client_phone', `%${cleanPhone.slice(-8)}%`) // Busca los últimos 8 dígitos para mayor precisión
            .order('booking_date', { ascending: false });

        if (error) throw error;

        listDiv.innerHTML = "";

        if (!data || data.length === 0) {
            listDiv.innerHTML = `
                <div style="text-align:center; padding:40px; color:#888;">
                    <p style="font-size:3rem;">📭</p>
                    <p>No encontramos citas para este número.</p>
                    <p style="font-size:0.8rem; margin-top:10px;">Verifica que hayas escrito bien el número con el que reservaste.</p>
                </div>
            `;
            return;
        }

        // Mostrar citas
        data.forEach(booking => {
            const card = document.createElement('div');
            card.className = 'barber-card';
            
            const statusColor = booking.status === 'confirmed' ? '#00ff88' : booking.status === 'cancelled' ? '#ff3333' : '#ffaa00';
            const barberName = booking.barbers ? booking.barbers.name : 'Barbería';

            card.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <span style="font-weight:bold; color:var(--neon-cyan);">${barberName}</span>
                    <span style="background:${statusColor}; color:#000; padding:4px 8px; border-radius:4px; font-size:0.8rem; font-weight:700;">${booking.status.toUpperCase()}</span>
                </div>
                <p>📅 ${booking.booking_date} | ⏰ ${booking.booking_time}</p>
                <p style="font-size:0.9rem; color:#aaa;">Reservado el: ${new Date(booking.created_at).toLocaleDateString()}</p>
                
                ${booking.status === 'pending' ? `
                    <button onclick="cancelBooking('${booking.id}')" style="margin-top:10px; width:100%; background:#ff3333; color:#fff; border:none; padding:10px; border-radius:6px; cursor:pointer; font-weight:700;">
                        ❌ CANCELAR CITA
                    </button>
                ` : ''}
            `;
            listDiv.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        listDiv.innerHTML = `<p class="error">❌ Error al buscar: ${err.message}</p>`;
    }
}

async function cancelBooking(id) {
    if(!confirm("¿Estás seguro de cancelar esta cita?")) return;

    const { error } = await supabaseClient
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', id);

    if (error) {
        alert("Error al cancelar: " + error.message);
    } else {
        alert("✅ Cita cancelada correctamente.");
        checkMyBookings(); // Recargar lista
    }
}

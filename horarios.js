const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
let currentBarber = null;

document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { window.location.href = 'auth.html'; return; }
    
    const { data } = await supabaseClient.from('barbers').select('id').eq('owner_id', user.id).single();
    if (!data) { alert("Perfil no encontrado"); return; }
    currentBarber = data;

    const container = document.getElementById('days-container');
    container.innerHTML = '';
    days.forEach((day, i) => {
        container.innerHTML += `
            <div style="background:rgba(20,20,30,0.6); padding:10px; margin:5px 0; border-radius:6px; display:flex; align-items:center; gap:10px;">
                <input type="checkbox" id="active-${i}" checked style="width:20px; height:20px;">
                <span style="flex:1; font-weight:bold;">${day}</span>
                <input type="time" id="start-${i}" value="09:00" style="background:#111; border:1px solid #444; color:#fff; padding:5px; border-radius:4px;">
                <span>-</span>
                <input type="time" id="end-${i}" value="18:00" style="background:#111; border:1px solid #444; color:#fff; padding:5px; border-radius:4px;">
            </div>
        `;
    });
});

window.saveAvailability = async () => {
    const rows = [];
    days.forEach((_, i) => {
        const active = document.getElementById(`active-${i}`).checked;
        const start = document.getElementById(`start-${i}`).value;
        const end = document.getElementById(`end-${i}`).value;
        rows.push({ barber_id: currentBarber.id, day_of_week: i, start_time: start, end_time: end, is_active: active });
    });

    // Borrar viejos y guardar nuevos
    await supabaseClient.from('availability').delete().eq('barber_id', currentBarber.id);
    const { error } = await supabaseClient.from('availability').insert(rows);
    if (error) alert('Error: ' + error.message);
    else alert('✅ Horarios guardados');
};

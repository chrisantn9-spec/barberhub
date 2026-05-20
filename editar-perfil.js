let barberId = null;
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { window.location.href = 'auth.html'; return; }
    
    const { data } = await supabaseClient.from('barbers').select('*').eq('owner_id', user.id).single();
    if (!data) { alert("Perfil no encontrado"); return; }
    
    barberId = data.id;
    document.getElementById('edit-name').value = data.name;
    document.getElementById('edit-location').value = data.location;
    document.getElementById('edit-phone').value = data.phone;
    document.getElementById('edit-bio').value = data.bio || '';
});

document.getElementById('edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const updates = {
        name: document.getElementById('edit-name').value,
        location: document.getElementById('edit-location').value,
        phone: document.getElementById('edit-phone').value,
        bio: document.getElementById('edit-bio').value
    };
    const { error } = await supabaseClient.from('barbers').update(updates).eq('id', barberId);
    if (error) alert('Error: ' + error.message);
    else { alert('✅ Perfil actualizado'); window.location.href = 'admin.html'; }
});

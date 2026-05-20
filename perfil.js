// perfil.js
document.addEventListener('DOMContentLoaded', async () => {
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) { window.location.href = 'auth.html'; return; }

    // 1. Cargar datos del cliente
    document.getElementById('client-name').textContent = user.user_metadata?.nombre || 'Cliente';
    document.getElementById('client-email').textContent = user.email;
    if (user.user_metadata?.avatar) {
        document.getElementById('client-avatar').src = user.user_metadata.avatar;
    }

    // 2. Cargar fotos guardadas en metadata
    const photos = user.user_metadata?.photos || [];
    const photoBox = document.getElementById('client-photos');
    photoBox.innerHTML = '';
    photos.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.style.width = '100%'; img.style.height = '80px'; img.style.objectFit = 'cover'; img.style.borderRadius = '6px';
        photoBox.appendChild(img);
    });

    // 3. Barberías cercanas (reutiliza lógica de distancia)
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { data: shops } = await supabaseClient.from('barbers').select('name, location, lat, lng').limit(3);
            const container = document.getElementById('nearby-shops');
            container.innerHTML = '';
            shops?.forEach(s => {
                const div = document.createElement('div');
                div.style.cssText = 'background:rgba(0,242,255,0.05); border:1px solid #333; padding:8px; margin:5px 0; border-radius:6px; color:#fff; font-size:0.85rem;';
                div.textContent = `✂️ ${s.name} • ${s.location}`;
                container.appendChild(div);
            });
        });
    }

    // 4. Cargar Bolsa de Trabajo
    loadJobBoard();
});

// Agregar foto a metadata
async function addPhoto() {
    const url = document.getElementById('new-photo-url').value.trim();
    if (!url) return;
    const { data: { user } } = await supabaseClient.auth.getUser();
    const photos = [...(user.user_metadata?.photos || []), url];
    await supabaseClient.auth.updateUser({ data: { photos } });
    location.reload();
}

// Cargar ofertas de trabajo
async function loadJobBoard() {
    const { data } = await supabaseClient.from('job_board').select('*').order('created_at', { ascending: false }).limit(5);
    const container = document.getElementById('job-board');
    container.innerHTML = '';
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="color:#666; text-align:center;">No hay ofertas activas.</p>';
        return;
    }
    data.forEach(job => {
        const div = document.createElement('div');
        div.style.cssText = 'background:rgba(0,0,0,0.4); border-left:3px solid var(--neon-pink); padding:10px; margin:8px 0; border-radius:0 6px 6px 0;';
        div.innerHTML = `
            <strong style="color:#fff; font-size:0.9rem;">${job.type === 'barbero' ? ' Barbero busca trabajo' : ' Barbería busca staff'}</strong>
            <p style="color:#ccc; font-size:0.8rem; margin:4px 0;">${job.description}</p>
            <a href="https://wa.me/${job.contact}" target="_blank" style="color:var(--neon-cyan); font-size:0.75rem; text-decoration:none;">Contactar →</a>
        `;
        container.appendChild(div);
    });
}

function logout() { supabaseClient.auth.signOut().then(() => window.location.href = 'index.html'); }

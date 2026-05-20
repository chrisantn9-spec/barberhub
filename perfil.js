// perfil.js

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error || !user) {
            window.location.href = 'auth.html';
            return;
        }

        document.getElementById('client-name').textContent = user.user_metadata?.nombre || 'Cliente';
        document.getElementById('client-email').textContent = user.email;
        
        if (user.user_metadata?.avatar) {
            document.getElementById('client-avatar').src = user.user_metadata.avatar;
        }

        document.getElementById('client-avatar').onclick = () => document.getElementById('avatar-input').click();

        loadGallery(user);
        loadNearbyShops();
        loadJobBoard();

    } catch (err) {
        console.error(err);
    }
});

function loadGallery(user) {
    const photos = user.user_metadata?.photos || [];
    const box = document.getElementById('client-photos');
    box.innerHTML = '';
    
    photos.forEach(url => {
        const img = document.createElement('img');
        img.src = url;
        img.style.cssText = 'width:100%; height:80px; object-fit:cover; border-radius:6px; cursor:pointer; border:1px solid #444;';
        img.onclick = () => {
            document.getElementById('lightbox-img').src = url;
            document.getElementById('lightbox').classList.add('active');
        };
        box.appendChild(img);
    });
}

async function uploadAvatar(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert("Imagen muy pesada (máx 2MB)"); return; }

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        const fileName = `avatar-${user.id}.${file.name.split('.').pop()}`;
        
        await supabaseClient.storage.from('profiles').upload(`avatars/${fileName}`, file, { upsert: true });
        const { data: { publicUrl } } = supabaseClient.storage.from('profiles').getPublicUrl(`avatars/${fileName}`);
        
        await supabaseClient.auth.updateUser({ data: { avatar: publicUrl } });
        location.reload();
    } catch (err) {
        alert("Error: " + err.message);
    }
}

async function addPhoto() {
    const url = document.getElementById('new-photo-url').value.trim();
    if (!url) return;
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        const photos = [...(user.user_metadata?.photos || []), url];
        await supabaseClient.auth.updateUser({ data: { photos } });
        location.reload();
    } catch (err) {
        alert("Error: " + err.message);
    }
}

async function uploadPhoto(input) {
    const file = input.files[0];
    if (!file) return;
    const status = document.getElementById('upload-status');
    status.textContent = 'Subiendo...';

    try {
        if (file.size > 2 * 1024 * 1024) throw new Error("Imagen muy pesada");
        const { data: { user } } = await supabaseClient.auth.getUser();
        const fileName = `${Date.now()}.${file.name.split('.').pop()}`;

        await supabaseClient.storage.from('profiles').upload(`client-photos/${fileName}`, file);
        const { data: { publicUrl } } = supabaseClient.storage.from('profiles').getPublicUrl(`client-photos/${fileName}`);

        const photos = [...(user.user_metadata?.photos || []), publicUrl];
        await supabaseClient.auth.updateUser({ data: { photos } });
        location.reload();
    } catch (err) {
        alert("Error: " + err.message);
    }
}

async function loadNearbyShops() {
    const container = document.getElementById('nearby-shops');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { data } = await supabaseClient.from('barbers').select('name, location').limit(3);
            container.innerHTML = '';
            if (!data || data.length === 0) container.textContent = "No hay barberías cerca.";
            else data.forEach(s => {
                const div = document.createElement('div');
                div.style.cssText = 'background:rgba(0,242,255,0.05); border:1px solid #333; padding:8px; margin:5px 0; border-radius:6px; color:#fff; font-size:0.85rem;';
                div.textContent = `️ ${s.name} • ${s.location}`;
                container.appendChild(div);
            });
        });
    }
}

async function loadJobBoard() {
    const container = document.getElementById('job-board');
    try {
        const { data } = await supabaseClient.from('job_board').select('*').order('created_at', { ascending: false }).limit(5);
        container.innerHTML = '';
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="color:#666; text-align:center; font-size:0.8rem;">Sin ofertas.</p>';
            return;
        }
        data.forEach(job => {
            const div = document.createElement('div');
            div.className = 'job-card';
            div.onclick = () => {
                if(confirm('¿Contactar por WhatsApp?\n' + job.description)) window.open(`https://wa.me/${job.contact}`);
                else navigator.clipboard.writeText(job.contact);
            };
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between;">
                    <strong style="color:#fff;">${job.type === 'barbero' ? '💈 Barbero' : '🏪 Barbería'}</strong>
                    <span style="color:#666; font-size:0.7rem;">${new Date(job.created_at).toLocaleDateString()}</span>
                </div>
                <p style="color:#ccc; font-size:0.85rem; margin:5px 0;">${job.description}</p>
                <p style="color:var(--neon-cyan); font-size:0.7rem;">Toca para contactar →</p>
            `;
            container.appendChild(div);
        });
    } catch (err) {
        container.innerHTML = '<p style="color:red">Error.</p>';
    }
}

function logout() { supabaseClient.auth.signOut().then(() => window.location.href = 'index.html'); }

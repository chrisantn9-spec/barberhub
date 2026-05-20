// perfil.js

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data: { user }, error } = await supabaseClient.auth.getUser();
        if (error || !user) {
            window.location.href = 'auth.html';
            return;
        }

        // 1. Cargar datos
        document.getElementById('client-name').textContent = user.user_metadata?.nombre || 'Cliente';
        document.getElementById('client-email').textContent = user.email;
        
        if (user.user_metadata?.avatar) {
            document.getElementById('client-avatar').src = user.user_metadata.avatar;
        }

        // 2. Conectar el click de la foto al input oculto
        document.getElementById('client-avatar').onclick = function() {
            document.getElementById('avatar-input').click();
        };

        // 3. Cargar resto
        loadGallery(user);
        loadNearbyShops();
        loadJobBoard();

    } catch (err) {
        console.error(err);
    }
});

// 📸 CARGAR GALERÍA
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

//  SUBIR AVATAR
async function uploadAvatar(input) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert(" La imagen es muy pesada (máx 2MB)");
        return;
    }

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        const fileExt = file.name.split('.').pop();
        const fileName = `avatar-${user.id}.${fileExt}`;
        
        const { error } = await supabaseClient.storage
            .from('profiles')
            .upload(`avatars/${fileName}`, file, { upsert: true });

        if (error) throw error;

        const { data: { publicUrl } } = supabaseClient.storage
            .from('profiles')
            .getPublicUrl(`avatars/${fileName}`);

        await supabaseClient.auth.updateUser({ data: { avatar: publicUrl } });
        location.reload(); // Recargar para ver la nueva foto

    } catch (err) {
        alert("Error subiendo foto: " + err.message);
    }
}

// ➕ AGREGAR FOTO URL
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

// 📷 SUBIR FOTO CELULAR
async function uploadPhoto(input) {
    const file = input.files[0];
    if (!file) return;

    const status = document.getElementById('upload-status');
    status.textContent = 'Subiendo...';

    try {
        if (file.size > 2 * 1024 * 1024) throw new Error("Imagen muy pesada");

        const { data: { user } } = await supabaseClient.auth.getUser();
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;

        const { error } = await supabaseClient.storage
            .from('profiles')
            .upload(`client-photos/${fileName}`, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabaseClient.storage
            .from('profiles')
            .getPublicUrl(`client-photos/${fileName}`);

        const photos = [...(user.user_metadata?.photos || []), publicUrl];
        await supabaseClient.auth.updateUser({ data: { photos } });

        status.textContent = '✅ Listo!';
        setTimeout(() => location.reload(), 1000);

    } catch (err) {
        alert("Error: " + err.message);
        status.textContent = '';
    }
}

//  CERCANAS
async function loadNearbyShops() {
    const container = document.getElementById('nearby-shops');
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { data } = await supabaseClient.from('barbers').select('name, location').limit(3);
            container.innerHTML = '';
            if (!data || data.length === 0) {
                container.textContent = "No hay barberías cerca aún.";
                return;
            }
            data.forEach(s => {
                const div = document.createElement('div');
                div.style.cssText = 'background:rgba(0,242,255,0.05); border:1px solid #333; padding:8px; margin:5px 0; border-radius:6px; color:#fff; font-size:0.85rem;';
                div.textContent = `✂️ ${s.name} • ${s.location}`;
                container.appendChild(div);
            });
        });
    }
}

// 💼 BOLSA
async function loadJobBoard() {
    const container = document.getElementById('job-board');
    const { data } = await supabaseClient.from('job_board').select('*').limit(3);
    container.innerHTML = '';
    if (!data || data.length === 0) {
        container.innerHTML = '<p style="color:#666; text-align:center; font-size:0.8rem;">Sin ofertas activas.</p>';
        return;
    }
    data.forEach(job => {
        const div = document.createElement('div');
        div.style.cssText = 'background:rgba(0,0,0,0.4); border-left:3px solid var(--neon-pink); padding:8px; margin:5px 0; border-radius:0 6px 6px 0;';
        div.innerHTML = `<strong style="color:#fff; font-size:0.85rem;">${job.type === 'barbero' ? '💈 Barbero' : '🏪 Barbería'}</strong> <br> <span style="color:#ccc; font-size:0.8rem;">${job.description}</span>`;
        container.appendChild(div);
    });
}

function logout() { supabaseClient.auth.signOut().then(() => window.location.href = 'index.html'); }

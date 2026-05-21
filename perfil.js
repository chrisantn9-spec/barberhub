// perfil.js

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        
        if (!user) {
            window.location.href = 'auth.html';
            return;
        }

        // Mostrar datos del usuario
        document.getElementById('client-name').textContent = user.user_metadata?.nombre || 'Cliente';
        document.getElementById('client-email').textContent = user.email;
        
        if (user.user_metadata?.avatar) {
            document.getElementById('client-avatar').src = user.user_metadata.avatar;
        }

        // Hacer clickeable el avatar
        const avatarImg = document.getElementById('client-avatar');
        const avatarInput = document.getElementById('avatar-input');
        if (avatarImg && avatarInput) {
            avatarImg.onclick = () => avatarInput.click();
        }

        // Cargar galería
        loadGallery(user);
        
        // Cargar barberías cercanas
        loadNearbyShops();
        
        // Cargar bolsa de trabajo
        loadJobBoard();
        
        // Cargar notificaciones de mensajes
        loadMessageNotifications();

    } catch (err) {
        console.error('Error en DOMContentLoaded:', err);
    }
});

// 📸 CARGAR GALERÍA DE FOTOS
function loadGallery(user) {
    const photos = user.user_metadata?.photos || [];
    const box = document.getElementById('client-photos');
    
    if (!box) return;
    
    box.innerHTML = '';
    
    if (photos.length === 0) {
        box.innerHTML = '<p style="color:#666; grid-column:span 3; text-align:center;">Sin fotos aún</p>';
        return;
    }
    
    photos.forEach(url => {
        if (!url) return;
        const img = document.createElement('img');
        img.src = url;
        img.style.cssText = 'width:100%; height:80px; object-fit:cover; border-radius:6px; cursor:pointer; border:1px solid #444;';
        img.onclick = () => {
            const lightbox = document.getElementById('lightbox');
            const lightboxImg = document.getElementById('lightbox-img');
            if (lightbox && lightboxImg) {
                lightboxImg.src = url;
                lightbox.classList.add('active');
            }
        };
        box.appendChild(img);
    });
}

// 📷 SUBIR FOTO DE PERFIL (AVATAR)
async function uploadAvatar(input) {
    const file = input.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
        alert('❌ La imagen es muy pesada (máx 2MB)');
        return;
    }

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        const fileExt = file.name.split('.').pop();
        const fileName = `avatar-${user.id}.${fileExt}`;
        
        const { error: uploadError } = await supabaseClient.storage
            .from('profiles')
            .upload(`avatars/${fileName}`, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabaseClient.storage
            .from('profiles')
            .getPublicUrl(`avatars/${fileName}`);

        await supabaseClient.auth.updateUser({ data: { avatar: publicUrl } });
        
        location.reload();

    } catch (err) {
        console.error('Error subiendo avatar:', err);
        alert('❌ Error: ' + err.message);
    }
}

// ➕ AGREGAR FOTO POR URL
async function addPhoto() {
    const url = document.getElementById('new-photo-url').value.trim();
    if (!url) {
        alert('Pega una URL primero');
        return;
    }

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        const photos = [...(user.user_metadata?.photos || []), url];
        
        await supabaseClient.auth.updateUser({ data: { photos } });
        alert('✅ Foto agregada');
        location.reload();
        
    } catch (err) {
        console.error('Error agregando foto:', err);
        alert('❌ Error: ' + err.message);
    }
}

// 📷 SUBIR FOTO DESDE CELULAR
async function uploadPhoto(input) {
    const file = input.files[0];
    if (!file) return;

    const status = document.getElementById('upload-status');
    if (status) status.textContent = 'Subiendo...';

    try {
        if (file.size > 2 * 1024 * 1024) {
            throw new Error('Imagen muy pesada (máx 2MB)');
        }

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

        if (status) {
            status.textContent = '✅ Listo!';
            status.style.color = '#00ff88';
        }
        
        setTimeout(() => location.reload(), 1000);

    } catch (err) {
        console.error('Error subiendo foto:', err);
        alert('❌ Error: ' + err.message);
        if (status) status.textContent = '';
    }
}

// 📍 CARGAR BARBERÍAS CERCANAS
async function loadNearbyShops() {
    const container = document.getElementById('nearby-shops');
    if (!container) return;

    if (!navigator.geolocation) {
        container.textContent = 'GPS no disponible';
        return;
    }

    navigator.geolocation.getCurrentPosition(async (pos) => {
        try {
            const { data } = await supabaseClient
                .from('barbers')
                .select('name, location')
                .limit(3);

            if (!data || data.length === 0) {
                container.textContent = 'No hay barberías registradas aún';
                return;
            }

            container.innerHTML = '';
            data.forEach(s => {
                const div = document.createElement('div');
                div.style.cssText = 'background:rgba(0,242,255,0.05); border:1px solid #333; padding:8px; margin:5px 0; border-radius:6px; color:#fff; font-size:0.85rem;';
                div.textContent = `✂️ ${s.name} • ${s.location}`;
                container.appendChild(div);
            });

        } catch (err) {
            console.error('Error cargando barberías:', err);
            container.textContent = 'Error cargando barberías';
        }
    }, () => {
        container.textContent = 'Permiso de ubicación denegado';
    });
}

// 💼 CARGAR BOLSA DE TRABAJO
async function loadJobBoard() {
    const container = document.getElementById('job-board');
    if (!container) return;

    try {
        const { data, error } = await supabaseClient
            .from('job_board')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5);

        if (error) throw error;

        container.innerHTML = '';
        
        if (!data || data.length === 0) {
            container.innerHTML = '<p style="color:#666; text-align:center; font-size:0.8rem;">Sin ofertas activas.</p>';
            return;
        }

        data.forEach(job => {
            const div = document.createElement('div');
            div.style.cssText = 'background:rgba(0,0,0,0.4); border-left:3px solid var(--neon-pink); padding:10px; margin:8px 0; border-radius:0 6px 6px 0;';
            
            const typeIcon = job.type === 'barbero' ? '💈' : '🏪';
            const typeText = job.type === 'barbero' ? 'Barbero busca trabajo' : 'Barbería busca personal';
            
            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px;">
                    <strong style="color:#fff; font-size:0.9rem;">${typeIcon} ${typeText}</strong>
                    <span style="color:#666; font-size:0.7rem;">${new Date(job.created_at).toLocaleDateString()}</span>
                </div>
                <p style="color:#ccc; font-size:0.85rem; margin:5px 0;">${job.description}</p>
                <a href="https://wa.me/${job.contact}" target="_blank" style="color:var(--neon-cyan); font-size:0.75rem; text-decoration:none;">Contactar →</a>
            `;
            container.appendChild(div);
        });

    } catch (err) {
        console.error('Error cargando ofertas:', err);
        container.innerHTML = '<p style="color:#ff3333; text-align:center;">Error cargando ofertas.</p>';
    }
}

// 📬 CARGAR NOTIFICACIONES DE MENSAJES
async function loadMessageNotifications() {
    const container = document.getElementById('message-notifications');
    if (!container) return;

    try {
        const { data: { user } } = await supabaseClient.auth.getUser();
        if (!user) return;

        const { data: messages } = await supabaseClient
            .from('messages')
            .select('barber_id, message, created_at, user_name')
            .eq('is_read', false)
            .order('created_at', { ascending: false })
            .limit(5);

        if (!messages || messages.length === 0) {
            container.innerHTML = '';
            return;
        }

        // Agrupar por barbería
        const barberMap = new Map();
        messages.forEach(msg => {
            if (!barberMap.has(msg.barber_id)) {
                barberMap.set(msg.barber_id, {
                    count: 0,
                    last_message: msg.message,
                    barber_id: msg.barber_id
                });
            }
            barberMap.get(msg.barber_id).count++;
        });

        // Obtener nombres de barberías
        const barberIds = Array.from(barberMap.keys());
        const { data: barbers } = await supabaseClient
            .from('barbers')
            .select('id, name')
            .in('id', barberIds);

        container.innerHTML = '<h3 style="color:var(--neon-cyan); font-size:0.9rem; margin:0 0 10px 0;">📬 Mensajes Nuevos:</h3>';
        
        if (barbers) {
            barbers.forEach(barber => {
                const data = barberMap.get(barber.id);
                const div = document.createElement('div');
                div.style.cssText = 'background:rgba(0,0,0,0.4); padding:8px; margin:5px 0; border-radius:4px; border-left:3px solid var(--neon-cyan); cursor:pointer;';
                div.onclick = () => {
                    sessionStorage.setItem('chatBarberId', barber.id);
                    sessionStorage.setItem('chatBarberName', barber.name);
                    window.location.href = 'chat.html';
                };
                div.innerHTML = `
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <strong style="color:#fff; font-size:0.9rem;">${barber.name}</strong>
                        <span style="background:var(--neon-pink); color:#fff; padding:2px 8px; border-radius:10px; font-size:0.75rem; font-weight:bold;">${data.count} nuevo${data.count > 1 ? 's' : ''}</span>
                    </div>
                    <p style="color:#888; font-size:0.8rem; margin:3px 0 0 0;">"${data.last_message}"</p>
                `;
                container.appendChild(div);
            });
        }

    } catch (err) {
        console.error('Error cargando notificaciones:', err);
    }
}

// 🚪 CERRAR SESIÓN
function logout() {
    supabaseClient.auth.signOut().then(() => {
        window.location.href = 'index.html';
    });
}

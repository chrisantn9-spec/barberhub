// detalle.js
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        document.body.innerHTML = '<div style="text-align:center; padding:50px; color:#ff5555;">⚠️ ID de barbería no válido.<br><a href="index.html" style="color:var(--neon-cyan);">Volver</a></div>';
        return;
    }

    // Obtener datos
    const { data: barber, error } = await supabaseClient
        .from('barbers')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !barber) {
        document.getElementById('shop-name').textContent = 'No encontrado';
        document.getElementById('gallery').innerHTML = '<p style="color:#ff5555; text-align:center;">Barbería no encontrada.</p>';
        return;
    }

    // Rellenar datos
    document.getElementById('shop-name').textContent = barber.name;
    document.getElementById('shop-location').textContent = barber.location || 'Ubicación no especificada';
    document.getElementById('shop-desc').textContent = barber.descripcion || 'Sin descripción aún.';
    document.getElementById('shop-phone').textContent = barber.phone || 'No disponible';

    // Botones
    if (barber.phone) {
        const cleanPhone = barber.phone.replace(/\D/g, '');
        document.getElementById('link-wa').href = `https://wa.me/${cleanPhone}`;
        document.getElementById('link-call').href = `tel:${barber.phone}`;
    } else {
        document.getElementById('link-wa').style.display = 'none';
        document.getElementById('link-call').style.display = 'none';
    }
    if (barber.lat && barber.lng) {
        document.getElementById('link-map').href = `https://www.google.com/maps/search/?api=1&query=${barber.lat},${barber.lng}`;
    } else {
        document.getElementById('link-map').style.display = 'none';
    }

    // 🖼️ Galería de fotos
    const gallery = document.getElementById('gallery');
    gallery.innerHTML = '';
    
    // Soporta: array, string separado por comas, o string JSON
    let photos = [];
    if (Array.isArray(barber.photos)) {
        photos = barber.photos;
    } else if (typeof barber.photos === 'string') {
        try {
            photos = JSON.parse(barber.photos);
        } catch {
            photos = barber.photos.split(',').map(p => p.trim()).filter(p => p);
        }
    }

    if (photos.length > 0) {
        photos.forEach(url => {
            if (url) {
                const img = document.createElement('img');
                img.src = url;
                img.alt = barber.name;
                img.onerror = () => img.style.display = 'none';
                gallery.appendChild(img);
            }
        });
    } else {
        gallery.innerHTML = '<div style="height:150px; background:rgba(0,242,255,0.05); border:1px dashed #444; border-radius:8px; display:flex; align-items:center; justify-content:center; color:#666; font-size:0.9rem;">📷 Sin fotos aún</div>';
    }
});
"detalle.js carga datos y fotos"

async function loadBarbers() {
    const list = document.getElementById("barber-list");
    
    // 1. Muestra el loading mientras carga
    list.innerHTML = '<p class="loading">Cargando barberías...</p>';

    const { data, error } = await supabaseClient
        .from("barbers")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        list.innerHTML = `<p class="error">❌ ${error.message}</p>`;
        return;
    }
    
    if (data.length === 0) {
        list.innerHTML = `<p class="loading">📭 Aún no hay barberías registradas.</p>`;
        return;
    }

    // 2. SI HAY DATOS: Borra el texto "Cargando..." ANTES de poner las tarjetas
    list.innerHTML = ""; 

    data.forEach(barber => {
        const card = document.createElement("div");
        card.className = "barber-card";
        
        const deliveryIcon = barber.delivery === 'si' ? '🚚' : '';
        const mapsQuery = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(barber.location)}`;
        
        card.innerHTML = `
            <h3>${barber.name} ${deliveryIcon}</h3>
            <p style="color:#aaa; font-size:0.95rem;">👤 ${barber.owner_name || 'Sin nombre'}</p>
            <p>📍 ${barber.location}</p>
            <p>📞 ${barber.phone}</p>
            ${barber.delivery === 'si' ? '<p style="color:var(--neon-pink); font-weight:600;">🚚 Delivery disponible</p>' : ''}
            <div style="margin-top:15px;">
                <button onclick="location.href='reservar.html?id=${barber.id}'" style="margin-bottom:10px; background:var(--neon-cyan); color:#000; border:none; padding:12px; width:100%; border-radius:6px; font-weight:700; cursor:pointer;">📅 RESERVAR TURNO</button>
                <a href="${barber.whatsapp_link || 'https://wa.me/' + barber.phone.replace(/[^0-9]/g,'')}" target="_blank" style="display:block; text-align:center; background:#25D366; color:#fff; padding:10px; border-radius:6px; text-decoration:none; font-weight:700; margin-bottom:8px;">💬 WhatsApp</a>
                <a href="${mapsQuery}" target="_blank" style="display:block; text-align:center; background:transparent; border:2px solid var(--neon-cyan); color:var(--neon-cyan); padding:10px; border-radius:6px; text-decoration:none; font-weight:700;">🗺️ Ver Ubicación</a>
            </div>
        `;
        list.appendChild(card);
    });
}

// Inicializar al cargar
     // 🌀 Ocultar loader después de 2.5 segundos
    const loader = document.getElementById('cyber-loader');
    if (loader) {
        setTimeout(() => {
            loader.classList.add('hidden');
        }, 2500);
    }  document.addEventListener("DOMContentLoaded", loadBarbers);
"agregar loader cyberpunk
// 🔍 FUNCIONALIDAD DE BÚSQUEDA POR NOMBRE O ZONA
document.addEventListener('DOMContentLoaded', () => {
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', (e) => {
            const searchText = e.target.value.toLowerCase();
            const cards = document.querySelectorAll('.barber-card');

            cards.forEach(card => {
                // Busca en el título (nombre) y en los párrafos (zona/dirección)
                const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
                const paragraphs = Array.from(card.querySelectorAll('p')).map(p => p.textContent.toLowerCase()).join(' ');
                
                if (title.includes(searchText) || paragraphs.includes(searchText)) {
                    card.style.display = 'flex';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    }
});"


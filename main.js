// 🧮 Fórmula para calcular distancia entre dos puntos GPS (Haversine)
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio tierra en KM
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return (R * c).toFixed(1); // Retorna KM con 1 decimal
}

//  FUNCIÓN PRINCIPAL
document.addEventListener("DOMContentLoaded", async () => {
    const list = document.getElementById('barber-list');
    if (!list) return;

    list.innerHTML = '<p style="text-align:center; color:#888;">Sincronizando ubicación...</p>';

    // 1. Obtener ubicación del CLIENTE
    let clientLat = null;
    let clientLng = null;

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                clientLat = pos.coords.latitude;
                clientLng = pos.coords.longitude;
                renderList(clientLat, clientLng); // Renderizar con distancia
            },
            () => {
                console.log("GPS denegado, mostrando lista normal.");
                renderList(null, null); // Renderizar sin distancia
            }
        );
    } else {
        renderList(null, null);
    }

    async function renderList(cLat, cLng) {
        list.innerHTML = '<p style="text-align:center; color:#888;">Cargando barberías...</p>';

        const { data: barbers, error } = await supabaseClient.from('barbers').select('*');

        if (error) {
            list.innerHTML = '<p style="color:red">Error cargando datos.</p>';
            return;
        }

        // 2. Calcular y ordenar por distancia
        if (cLat && cLng) {
            barbers.forEach(b => {
                if (b.lat && b.lng) {
                    b.distancia = calcularDistancia(cLat, cLng, b.lat, b.lng);
                } else {
                    b.distancia = 9999; // Si no tiene GPS, se va al final
                }
            });
            barbers.sort((a, b) => a.distancia - b.distancia);
        }

        list.innerHTML = ''; // Limpiar loader

        // 3. Dibujar tarjetas
        barbers.forEach(barber => {
            const card = document.createElement('div');
            card.className = 'barber-card';

            // Texto de distancia (solo si tiene coordenadas)
            const distText = (barber.distancia && barber.distancia < 9999) 
                ? `<span style="color:var(--neon-cyan); font-size:0.8rem;">📍 a ${barber.distancia} km</span>` 
                : '';

            card.innerHTML = `
                <h3>${barber.name} ${distText}</h3>
                <p style="font-size:0.8rem; color:#aaa;">${barber.location}</p>
                <p style="font-size:0.8rem;">📞 ${barber.phone}</p>
                <div style="margin-top:10px; display:flex; gap:5px;">
                    <a href="https://wa.me/${barber.phone}" target="_blank" style="flex:1; background:#25D366; color:#fff; text-align:center; padding:5px; border-radius:4px; text-decoration:none; font-size:0.8rem;">WhatsApp</a>
                    <a href="https://www.google.com/maps/search/?api=1&query=${barber.lat},${barber.lng}" target="_blank" style="flex:1; background:var(--neon-cyan); color:#000; text-align:center; padding:5px; border-radius:4px; text-decoration:none; font-size:0.8rem;">Ver Mapa</a>
                </div>
            `;
            list.appendChild(card);
        });
    }
});
"main.js calcula distancia y ordena"

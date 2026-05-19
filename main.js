document.addEventListener("DOMContentLoaded", async () => {
    const list = document.getElementById("barber-list");
    try {
        const { data, error } = await supabaseClient.from("barbers").select("*");
        if (error) throw error;
        list.innerHTML = "";
        if (data.length === 0) {
            list.innerHTML = "<p class='loading'>Aún no hay barberías. <a href='registro-barbero.html' style='color:#00f2ff'>Sé el primero</a></p>";
            return;
        }
        data.forEach(barber => {
            const card = document.createElement("div");
            card.className = "barber-card";
            card.innerHTML = `
                <h3>${barber.name}</h3>
                <p>📍 ${barber.location || "Sin ubicación"}</p>
                <p>📞 ${barber.phone}</p>
                <button onclick="location.href='reservar.html?id=${barber.id}'">RESERVAR TURNO</button>
            `;
            list.appendChild(card);
        });
    } catch (err) { list.innerHTML = `<p class="error">❌ Error: ${err.message}</p>`; }
});

document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const barberId = urlParams.get("id");
    if (!barberId) { alert("⚠️ ID no encontrado."); window.location.href = "index.html"; return; }

    const today = new Date().toISOString().split("T")[0];
    document.getElementById("booking-date").setAttribute("min", today);
    const msg = document.getElementById("msg");

    document.getElementById("booking-form").addEventListener("submit", async (e) => {
        e.preventDefault(); msg.textContent = "⏳ Verificando disponibilidad...";
        const dateVal = document.getElementById("booking-date").value;
        const timeVal = document.getElementById("booking-time").value;
        const nameVal = document.getElementById("client-name").value;
        const phoneVal = document.getElementById("client-phone").value;

        const { data: existing, error: checkErr } = await supabaseClient.from("bookings").select("id").eq("barber_id", barberId).eq("booking_date", dateVal).eq("booking_time", timeVal).in("status", ["pending", "confirmed"]).limit(1);
        if (checkErr) { msg.textContent = "❌ Error de conexión"; return; }
        if (existing.length > 0) { msg.textContent = "⛔ Horario ocupado. Elige otro."; return; }

        const { error } = await supabaseClient.from("bookings").insert([{ barber_id: barberId, client_name: nameVal, client_phone: phoneVal, booking_date: dateVal, booking_time: timeVal, status: "pending" }]);
        if (error) { msg.textContent = "❌ Error: " + error.message; }
        else { msg.textContent = "✅ ¡Turno reservado!"; document.getElementById("booking-form").reset(); }
    });
});

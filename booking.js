form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const msg = document.getElementById("msg");
    msg.textContent = "⏳ Confirmando reserva...";
    msg.style.color = "#aaa";

    const clientName = document.getElementById("client-name").value.trim();
    const clientPhone = document.getElementById("client-phone").value.trim();
    const bookingDate = document.getElementById("booking-date").value;
    const bookingTime = document.getElementById("booking-time").value;

    if (!clientName || !clientPhone || !bookingDate || !bookingTime) {
        msg.textContent = "❌ Completa todos los campos";
        msg.style.color = "#ff3333";
        return;
    }

    const { error } = await supabaseClient
        .from("bookings")
        .insert([{
            barber_id: barberId,
            client_name: clientName,
            client_phone: clientPhone,
            booking_date: bookingDate,
            booking_time: bookingTime,
            status: "pending",
            created_at: new Date().toISOString()
        }]);

    if (error) {
        msg.textContent = "❌ " + error.message;
        msg.style.color = "#ff3333";
    } else {
        msg.innerHTML = "✅ ¡Turno reservado con éxito!";
        msg.style.color = "#00ff88";
        form.reset(); // Limpia los campos
        
        // Redirige al inicio después de 2 segundos
        setTimeout(() => {
            window.location.href = "index.html";
        }, 2000);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("booking-form");
    const msg = document.getElementById("msg");
    const btnSubmit = document.getElementById("btn-submit"); // Asegúrate de que tu botón tenga este ID

    // Si no hay formulario en esta página, no hacemos nada
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault(); // ⚠️ ESTO EVITA QUE LA PÁGINA SE RECARGUE SOLA

        // 1. Obtener datos
        const clientName = document.getElementById("client-name").value.trim();
        const clientPhone = document.getElementById("client-phone").value.trim();
        const bookingDate = document.getElementById("booking-date").value;
        const bookingTime = document.getElementById("booking-time").value;

        // 2. Validaciones básicas
        if (!clientName || !clientPhone || !bookingDate || !bookingTime) {
            msg.textContent = "❌ Por favor completa todos los campos";
            msg.style.color = "#ff3333";
            return;
        }

        // UI: Mostrar carga
        msg.textContent = " Agendando tu turno...";
        msg.style.color = "#aaa";
        if (btnSubmit) {
            btnSubmit.disabled = true;
            btnSubmit.textContent = "Procesando...";
        }

        // 3. Insertar en Supabase
        const { error } = await supabaseClient
            .from("bookings")
            .insert([{
                client_name: clientName,
                client_phone: clientPhone,
                booking_date: bookingDate,
                booking_time: bookingTime,
                barber_id: getBarberIdFromUrl(), // Función auxiliar para sacar el ID de la URL
                status: "pending",
                created_at: new Date().toISOString()
            }]);

        if (error) {
            console.error(error);
            msg.textContent = "❌ Error al reservar: " + error.message;
            msg.style.color = "#ff3333";
            if (btnSubmit) {
                btnSubmit.disabled = false;
                btnSubmit.textContent = "Reservar Turno";
            }
        } else {
            // ✅ ÉXITO
            msg.innerHTML = "✅ ¡Turno reservado con éxito!<br><small>Redirigiendo...</small>";
            msg.style.color = "#00ff88";
            form.reset(); // Limpiar formulario

            // 🚀 REDIRECCIÓN: Llevar al cliente a ver su cita
            setTimeout(() => {
                // Opción A: Ir a "Mis Citas" para que vean lo que acaban de reservar
                window.location.href = "mis-citas.html"; 
            }, 1500);
        }
    });
});

// Función para obtener el ID del barbero desde la URL (ej: reservar.html?id=123)
function getBarberIdFromUrl() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

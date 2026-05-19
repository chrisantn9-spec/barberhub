document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("barber-form");
    const msg = document.getElementById("reg-msg");

    if (!form) {
        console.warn("⚠️ Formulario no encontrado");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        msg.textContent = "⏳ Creando cuenta...";
        msg.style.color = "#aaa";

        // 1. Recopilar datos
        const name = document.getElementById("barber-name").value.trim();
        const ownerName = document.getElementById("owner-name").value.trim();
        const location = document.getElementById("barber-location").value.trim();
        const phone = document.getElementById("barber-phone").value.trim();
        const delivery = document.getElementById("delivery").value;
        const email = document.getElementById("auth-email").value.trim();
        const password = document.getElementById("auth-password").value.trim();

        if (!name || !ownerName || !location || !phone || !email || !password) {
            msg.textContent = "❌ Completa todos los campos";
            msg.style.color = "#ff3333";
            return;
        }

        try {
            console.log("🔹 Paso 1: Creando usuario en Supabase...");
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email: email,
                password: password
            });

            if (authError) throw new Error(authError.message);

            // 🔍 DETECCIÓN DE CONFIRMACIÓN DE EMAIL
            if (!authData.session) {
                msg.innerHTML = `
                    ✅ ¡Cuenta creada!<br>
                    <small style="color:#aaa; display:block; margin-top:8px;">
                        Supabase pide confirmar tu correo.<br>
                        Revisa tu bandeja (o spam), haz clic en el link y luego entra con tu contraseña.
                    </small>`;
                msg.style.color = "#00ff88";
                form.reset();
                return; // Detiene el flujo aquí para no generar error de RLS
            }

            console.log("🔹 Paso 2: Usuario autenticado. Esperando propagación de token...");
            // Pequeña pausa para que Supabase adjunte el JWT a las siguientes peticiones
            await new Promise(res => setTimeout(res, 600));

            console.log("🔹 Paso 3: Registrando barbería en base de datos...");
            const cleanPhone = phone.replace(/[^0-9]/g, "");
            const whatsappLink = `https://wa.me/${cleanPhone}`;

            const { error: barberError } = await supabaseClient
                .from("barbers")
                .insert([{
                    name,
                    owner_name: ownerName,
                    phone,
                    location,
                    delivery,
                    whatsapp_link: whatsappLink,
                    owner_id: authData.user.id,
                    created_at: new Date().toISOString()
                }]);

            if (barberError) throw new Error(barberError.message);

            console.log("🔹 Paso 4: Éxito. Redirigiendo al panel...");
            msg.textContent = "🚀 ¡Todo listo! Redirigiendo al panel...";
            msg.style.color = "#00ff88";
            form.reset();

            // Forzar redirección limpia
            setTimeout(() => {
                window.location.replace("admin.html");
            }, 1200);

        } catch (error) {
            console.error(" Error crítico en registro:", error);
            msg.textContent = "❌ " + error.message;
            msg.style.color = "#ff3333";
        }
    });

    console.log("✅ Sistema de registro inicializado");
});
"fix redirect y deteccion email"

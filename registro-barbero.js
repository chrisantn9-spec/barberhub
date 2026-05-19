document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("barber-form");
    const msg = document.getElementById("reg-msg");

    if (!form) {
        console.log("Formulario no encontrado");
        return;
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        msg.textContent = "⏳ Creando cuenta y registrando barbería...";
        msg.style.color = "#aaa";

        // Datos de la barbería
        const name = document.getElementById("barber-name").value.trim();
        const ownerName = document.getElementById("owner-name").value.trim();
        const location = document.getElementById("barber-location").value.trim();
        const phone = document.getElementById("barber-phone").value.trim();
        const delivery = document.getElementById("delivery").value;

        // Datos de autenticación
        const email = document.getElementById("auth-email").value.trim();
        const password = document.getElementById("auth-password").value.trim();

        // Validaciones básicas
        if (!name || !ownerName || !location || !phone) {
            msg.textContent = "❌ Completa todos los campos de la barbería";
            msg.style.color = "#ff3333";
            return;
        }

        if (!email || !password) {
            msg.textContent = "❌ Email y contraseña son obligatorios";
            msg.style.color = "#ff3333";
            return;
        }

        if (password.length < 6) {
            msg.textContent = "❌ La contraseña debe tener al menos 6 caracteres";
            msg.style.color = "#ff3333";
            return;
        }

        try {
            // PASO 1: Crear usuario en Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: email,
                password: password
            });

            if (authError) {
                throw new Error("Error al crear cuenta: " + authError.message);
            }

            // ✅ FIX CRÍTICO: Forzar sesión inmediata para que RLS no bloquee
            if (authData.session) {
                await supabase.auth.setSession(authData.session);
            }

            if (!authData.user) {
                throw new Error("No se pudo crear el usuario");
            }

            msg.textContent = "✅ Cuenta creada. Registrando barbería...";

            // PASO 2: Registrar la barbería vinculada al usuario
            const cleanPhone = phone.replace(/[^0-9]/g, "");
            const whatsappLink = `https://wa.me/${cleanPhone}`;

            const { data: barberData, error: barberError } = await supabaseClient
                .from("barbers")
                .insert([{
                    name: name,
                    owner_name: ownerName,
                    phone: phone,
                    location: location,
                    delivery: delivery,
                    whatsapp_link: whatsappLink,
                    owner_id: authData.user.id,
                    created_at: new Date().toISOString()
                }])
                .select();

            if (barberError) {
                throw new Error("Error al registrar barbería: " + barberError.message);
            }

            // ÉXITO TOTAL
            msg.innerHTML = `
                <span style="color:#00ff88; font-size:1.3rem;">
                    ✅ ¡Todo listo!<br>
                    <small style="font-size:0.9rem; color:#aaa; display:block; margin-top:10px;">
                        Cuenta creada y barbería publicada<br>
                        Redirigiendo al panel...
                    </small>
                </span>
            `;
            msg.style.color = "#00ff88";

            form.reset();

            // Guardar ID localmente
            if (barberData && barberData[0]) {
                localStorage.setItem("myBarberId", barberData[0].id);
            }

            // Redirigir al panel de admin
            setTimeout(() => {
                window.location.href = "admin.html";
            }, 2000);

        } catch (error) {
            console.error("Error:", error);
            msg.textContent = "❌ " + error.message;
            msg.style.color = "#ff3333";
        }
    });

    console.log("✅ Formulario de registro con auth inicializado");
});

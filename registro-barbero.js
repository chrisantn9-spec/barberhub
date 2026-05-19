document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("barber-form");
    const msg = document.getElementById("reg-msg");
    
    if (!form) {
        console.log("Formulario no encontrado");
        return;
    }
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        msg.textContent = "⏳ Registrando barbería...";
        msg.style.color = "#aaa";
        
        // Obtener valores del formulario
        const name = document.getElementById("barber-name").value.trim();
        const ownerName = document.getElementById("owner-name").value.trim();
        const location = document.getElementById("barber-location").value.trim();
        const phone = document.getElementById("barber-phone").value.trim();
        const delivery = document.getElementById("delivery").value;
        
        // Validaciones básicas
        if (!name || !ownerName || !location || !phone) {
            msg.textContent = "❌ Por favor completa todos los campos obligatorios";
            msg.style.color = "#ff3333";
            return;
        }
        
        // Crear link de WhatsApp automático
        const cleanPhone = phone.replace(/[^0-9]/g, "");
        const whatsappLink = `https://wa.me/${cleanPhone}`;
        
        // Obtener usuario logueado (si existe)
        let ownerId = null;
        try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session) {
                ownerId = session.user.id;
            }
        } catch (err) {
            console.log("Usuario no autenticado (registro público)");
        }
        
        // Insertar en Supabase
        const { data, error } = await supabaseClient
            .from("barbers")
            .insert([{
                name: name,
                owner_name: ownerName,
                phone: phone,
                location: location,
                delivery: delivery,
                whatsapp_link: whatsappLink,
                owner_id: ownerId,
                created_at: new Date().toISOString()
            }])
            .select();
        
        if (error) {
            console.error("Error al registrar:", error);
            msg.textContent = "❌ Error: " + error.message;
            msg.style.color = "#ff3333";
        } else {
            // Éxito
            msg.innerHTML = `
                <span style="color:#00ff88; font-size:1.3rem;">
                    ✅ ¡Barbería registrada con éxito!<br>
                    <small style="font-size:0.9rem; color:#aaa; display:block; margin-top:10px;">
                        Ahora aparecerás en el directorio<br>
                        Redirigiendo...
                    </small>
                </span>
            `;
            msg.style.color = "#00ff88";
            
            // Limpiar formulario
            form.reset();
            
            // Guardar ID para referencia
            if (data && data[0]) {
                localStorage.setItem("myBarberId", data[0].id);
            }
            
            // Redirigir al inicio después de 3 segundos
            setTimeout(() => {
                window.location.href = "index.html";
            }, 3000);
        }
    });
    
    console.log("✅ Formulario de registro inicializado");
});

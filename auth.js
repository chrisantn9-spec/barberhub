document.addEventListener("DOMContentLoaded", async () => {
    const msg = document.getElementById("msg");
    const form = document.getElementById("login-form");
    const body = document.body;
    
    // 1. Verificar sesión actual (con manejo seguro)
    try {
        const { data, error } = await supabaseClient.auth.getSession();
        
        if (error) {
            console.warn("⚠️ Error al verificar sesión:", error.message);
            body.classList.remove("checking-session");
            return;
        }
        
        // Si YA hay sesión activa → redirigir al panel (solo una vez)
        if (data?.session) {
            console.log("✅ Sesión activa detectada, redirigiendo a admin...");
            // Usar replace para evitar que el botón "atrás" regrese aquí
            window.location.replace("admin.html");
            return; // DETENER ejecución para que no se muestre el formulario
        }
        
    } catch (err) {
        console.error("❌ Error crítico en auth:", err);
        msg.textContent = "⚠️ Error de conexión";
        msg.style.color = "#ffaa00";
    }
    
    // 2. Si NO hay sesión → mostrar formulario
    body.classList.remove("checking-session");
    console.log("🔐 Sin sesión, mostrando formulario de login");
    
    // 3. Manejar submit del formulario
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        
        if (!email || !password) {
            msg.textContent = "⚠️ Completa email y contraseña";
            msg.style.color = "#ffaa00";
            return;
        }
        
        // UI de carga
        const btn = document.getElementById("btn-login");
        const originalText = btn.textContent;
        btn.textContent = "⏳ Entrando...";
        btn.disabled = true;
        msg.textContent = "";
        
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) {
                // Mostrar error específico de Supabase
                if (error.message.includes("Invalid login credentials")) {
                    msg.textContent = "❌ Email o contraseña incorrectos";
                } else if (error.message.includes("Email not confirmed")) {
                    msg.textContent = "⚠️ Confirma tu email primero (revisa tu bandeja)";
                } else {
                    msg.textContent = "❌ " + error.message;
                }
                msg.style.color = "#ff3333";
                btn.textContent = originalText;
                btn.disabled = false;
                return;
            }
            
            // Éxito: redirigir al panel
            msg.textContent = "✅ ¡Bienvenido! Redirigiendo...";
            msg.style.color = "#00ff88";
            
            // Pequeña pausa para que el usuario vea el mensaje
            setTimeout(() => {
                window.location.replace("admin.html");
            }, 800);
            
        } catch (err) {
            console.error("Error en login:", err);
            msg.textContent = "❌ Error inesperado";
            msg.style.color = "#ff3333";
            btn.textContent = originalText;
            btn.disabled = false;
        }
    });
    
    console.log("✅ auth.js inicializado correctamente");
});

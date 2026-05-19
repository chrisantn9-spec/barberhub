document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("barber-form"); const msg = document.getElementById("reg-msg");
    form.addEventListener("submit", async (e) => {
        e.preventDefault(); msg.textContent = "⏳ Registrando...";
        const name = document.getElementById("barber-name").value.trim();
        const phone = document.getElementById("barber-phone").value.trim();
        const location = document.getElementById("barber-location").value.trim();
        if (!name || !phone || !location) { msg.textContent = "⚠️ Completa todos."; return; }
        const { data, error } = await supabaseClient.from("barbers").insert([{ name, phone, location }]).select();
        if (error) { msg.textContent = "❌ " + error.message; }
        else {
            msg.innerHTML = `✅ ¡Listo! Tu ID: <code style="background:#222; padding:2px 5px; border-radius:3px;">${data[0].id}</code>`;
            form.reset(); localStorage.setItem("myBarberId", data[0].id);
            setTimeout(() => { if(confirm("¿Ir al panel?")) window.location.href = "admin.html"; }, 1500);
        }
    });
});

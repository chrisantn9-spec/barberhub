window.addEventListener("DOMContentLoaded", () => {
    const saved = localStorage.getItem("myBarberId");
    if (saved) document.getElementById("barber-id-input").value = saved;
});

async function loadBookings() {
    const barberId = document.getElementById("barber-id-input").value.trim();
    if (!barberId) return alert("⚠️ Ingresa tu ID");
    localStorage.setItem("myBarberId", barberId);

    const list = document.getElementById("bookings-list");
    list.innerHTML = "<p class='loading'>Cargando turnos...</p>";

    const { data, error } = await supabaseClient.from("bookings").select("*").eq("barber_id", barberId).order("booking_date", { ascending: true }).order("booking_time", { ascending: true });
    if (error) { list.innerHTML = `<p class='error'>❌ ${error.message}</p>`; return; }
    if (data.length === 0) { list.innerHTML = "<p class='loading'>📭 Sin turnos aún.</p>"; return; }

    list.innerHTML = "";
    data.forEach(b => {
        const card = document.createElement("div"); card.className = "barber-card";
        const sc = b.status==='confirmed'?'confirmed':b.status==='cancelled'?'cancelled':'';
        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:8px;"><span style="font-size:18px; font-weight:bold;">${b.client_name}</span><span class="status ${sc}">${b.status.toUpperCase()}</span></div>
            <p>📞 ${b.client_phone} | 📅 ${b.booking_date} | ⏰ ${b.booking_time}</p>
            <div class="action-btns">
                ${b.status==='pending'?`<button class="btn-confirm" onclick="updateStatus('${b.id}','confirmed')">✅ Confirmar</button><button class="btn-cancel" onclick="updateStatus('${b.id}','cancelled')">❌ Cancelar</button>`:""}
                <button class="btn-wa" onclick="sendWhatsApp('${b.client_phone}','${b.booking_date}','${b.booking_time}','${b.status}')">💬 WhatsApp</button>
            </div>`;
        list.appendChild(card);
    });
}
async function updateStatus(id, s) { const { error } = await supabaseClient.from("bookings").update({ status: s }).eq("id", id); if(error) alert("❌ "+error.message); else loadBookings(); }
function sendWhatsApp(phone, date, time, status) { const c=phone.replace(/[^0-9]/g,""); window.open(`https://wa.me/${c}?text=${encodeURIComponent(`Hola! 👋 Tu turno está ${status}.\n📅 ${date} a las ${time}.\n¡Te esperamos! 💈`)}`,"_blank"); }

// Datos falsos de citas
const appointments = [
  { id: 1, barber: "CyberCuts Studio", date: "Viernes, 24 Mayo", time: "16:00", service: "Corte + Barba", status: "Confirmada" },
  { id: 2, barber: "Neon Barber Shop", date: "Lunes, 27 Mayo", time: "10:30", service: "Degradado Americano", status: "Pendiente" },
  { id: 3, barber: "Razor & Code", date: "Miércoles, 29 Mayo", time: "18:00", service: "Afeitado Clásico", status: "Completada" }
];

const list = document.getElementById('appointments-list');

appointments.forEach(cita => {
  const card = document.createElement('div');
  // Color según estado
  let statusColor = cita.status === 'Confirmada' ? 'var(--neon-cyan)' : 
                    cita.status === 'Pendiente' ? '#ffaa00' : '#888';

  card.className = 'appointment-card';
  card.innerHTML = `
    <div class="appt-header">
      <h3>${cita.barber}</h3>
      <span class="status-badge" style="color:${statusColor}; border-color:${statusColor}">${cita.status}</span>
    </div>
    <div class="appt-body">
      <div class="appt-detail"><i class="fas fa-cut"></i> ${cita.service}</div>
      <div class="appt-detail"><i class="fas fa-calendar"></i> ${cita.date}</div>
      <div class="appt-detail"><i class="fas fa-clock"></i> ${cita.time}</div>
    </div>
    <div class="appt-footer">
      <button class="btn-outline" onclick="alert('Redirigiendo al mapa...')">Ver Ubicación</button>
      ${cita.status !== 'Completada' ? '<button class="btn-primary" style="width:auto; padding:8px 16px;">Reprogramar</button>' : ''}
    </div>
  `;
  list.appendChild(card);
});

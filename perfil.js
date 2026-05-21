//  DATOS DE EJEMPLO (Próximamente vendrán de Supabase)
const barbers = [
  { id: 1, name: "CyberCuts Studio", img: "https://placehold.co/400x300/0a0a1a/00f2ff?text=CyberCuts", rating: 4.9, reviews: 128, location: "Centro, 0.5 km", price: "$15", tags: ["corte", "premium"] },
  { id: 2, name: "Neon Barber Shop", img: "https://placehold.co/400x300/0a0a1a/ff00ff?text=NeonBarber", rating: 4.7, reviews: 85, location: "Norte, 1.2 km", price: "$12", tags: ["barba", "corte"] },
  { id: 3, name: "Razor & Code", img: "https://placehold.co/400x300/0a0a1a/00ff88?text=RazorCode", rating: 5.0, reviews: 210, location: "Sur, 0.8 km", price: "$18", tags: ["premium", "barba"] },
  { id: 4, name: "Urban Fade Lab", img: "https://placehold.co/400x300/0a0a1a/ffaa00?text=UrbanFade", rating: 4.5, reviews: 64, location: "Este, 2.0 km", price: "$10", tags: ["corte"] },
  { id: 5, name: "Blade Runner Barbers", img: "https://placehold.co/400x300/0a0a1a/00f2ff?text=BladeRunner", rating: 4.8, reviews: 150, location: "Oeste, 1.5 km", price: "$16", tags: ["premium", "corte"] },
  { id: 6, name: "Synthwave Cuts", img: "https://placehold.co/400x300/0a0a1a/ff00ff?text=Synthwave", rating: 4.6, reviews: 92, location: "Centro, 0.3 km", price: "$14", tags: ["barba", "corte"] }
];

const grid = document.getElementById('barber-grid');
const searchInput = document.getElementById('search-input');
const chips = document.querySelectorAll('.chip');

// 🎨 Renderizar tarjetas con animación escalonada
function renderCards(data) {
  grid.innerHTML = '';
  if (data.length === 0) {
    grid.innerHTML = `<div class="empty-state"><i class="fas fa-search"></i><p>No se encontraron barberías</p></div>`;
    return;
  }
  data.forEach((b, index) => {
    const card = document.createElement('div');
    card.className = 'barber-card';
    card.style.animationDelay = `${index * 0.08}s`;
    card.innerHTML = `
      <div class="card-image-wrapper">
        <img src="${b.img}" alt="${b.name}" loading="lazy">
        <div class="card-overlay"></div>
        <button class="fav-btn" onclick="toggleFav(this)"><i class="far fa-heart"></i></button>
      </div>
      <div class="card-content">
        <div class="card-header">
          <h3>${b.name}</h3>
          <div class="rating"><i class="fas fa-star"></i> ${b.rating} <span>(${b.reviews})</span></div>
        </div>
        <p class="location"><i class="fas fa-map-marker-alt"></i> ${b.location}</p>
        <div class="card-footer">
          <span class="price">${b.price} / servicio</span>
          <button class="btn-book" onclick="bookBarber(${b.id})">Reservar</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// 🔍 Búsqueda en tiempo real + Filtros
function filterData() {
  const query = searchInput.value.toLowerCase().trim();
  const activeFilter = document.querySelector('.chip.active').dataset.filter;
  
  const filtered = barbers.filter(b => {
    const matchesSearch = !query || 
      b.name.toLowerCase().includes(query) || 
      b.location.toLowerCase().includes(query);
    const matchesFilter = activeFilter === 'all' || b.tags.includes(activeFilter);
    return matchesSearch && matchesFilter;
  });
  
  renderCards(filtered);
}

searchInput.addEventListener('input', filterData);

chips.forEach(chip => {
  chip.addEventListener('click', () => {
    chips.forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    filterData();
  });
});

// ❤️ Favoritos (visual)
window.toggleFav = (btn) => {
  btn.classList.toggle('active');
  const icon = btn.querySelector('i');
  icon.classList.toggle('far');
  icon.classList.toggle('fas');
};

// 📅 Reserva (placeholder)
window.bookBarber = (id) => {
  alert(`📅 Iniciando reserva para ID: ${id}\n(Próximamente: selector de fecha/hora)`);
  // window.location.href = `reserva.html?barber=${id}`;
};

// 🔄 Carga inicial
renderCards(barbers);

// 📱 Menú inferior activo
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function(e) {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    this.classList.add('active');
  });
});

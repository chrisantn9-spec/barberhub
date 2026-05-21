// Datos falsos de "Cortes Famosos"
const trends = [
  { id: 1, user: "@CyberBarber", avatar: "https://i.pravatar.cc/100?img=11", img: "https://placehold.co/300x400/111/00f2ff?text=Fade+Corte", likes: 1240, rating: 5.0 },
  { id: 2, user: "@NeonScissors", avatar: "https://i.pravatar.cc/100?img=12", img: "https://placehold.co/300x400/111/ff00ff?text=Texturizado", likes: 980, rating: 4.8 },
  { id: 3, user: "@UrbanBlade", avatar: "https://i.pravatar.cc/100?img=13", img: "https://placehold.co/300x400/111/00ff88?text=Clasico+Moderno", likes: 1500, rating: 4.9 },
  { id: 4, user: "@RazorKing", avatar: "https://i.pravatar.cc/100?img=14", img: "https://placehold.co/300x400/111/ffaa00?text=Barba+Completa", likes: 850, rating: 4.7 },
  { id: 5, user: "@FadeMaster", avatar: "https://i.pravatar.cc/100?img=15", img: "https://placehold.co/300x400/111/00f2ff?text=Skin+Fade", likes: 2100, rating: 5.0 },
  { id: 6, user: "@StyleLab", avatar: "https://i.pravatar.cc/100?img=16", img: "https://placehold.co/300x400/111/ff00ff?text=Pompadour", likes: 1100, rating: 4.6 }
];

const grid = document.getElementById('explore-grid');

// Renderizar tarjetas tipo Instagram/Pinterest
trends.forEach(post => {
  const card = document.createElement('div');
  card.className = 'explore-card';
  card.innerHTML = `
    <div class="card-image-wrapper">
      <img src="${post.img}" alt="Corte">
      <div class="overlay-info">
        <div class="user-row">
          <img src="${post.avatar}" class="avatar-small">
          <span>${post.user}</span>
        </div>
        <div class="rating-badge"><i class="fas fa-star"></i> ${post.rating}</div>
      </div>
    </div>
    <div class="card-actions">
      <span><i class="fas fa-heart"></i> ${post.likes}</span>
      <span><i class="fas fa-comment"></i> 42</span>
    </div>
  `;
  grid.appendChild(card);
});

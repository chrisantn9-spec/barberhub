self.addEventListener('install', (event) => {
    console.log(' Service Worker instalado - BarberHub');
});

self.addEventListener('activate', (event) => {
    console.log('⚡ Service Worker activado');
});

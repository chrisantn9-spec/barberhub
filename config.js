// config.js - Versión estable para navegador
if (typeof supabase === 'undefined') {
  console.error('❌ Supabase CDN no cargó. Revisa el orden de tus scripts.');
} else {
  const { createClient } = supabase;
  
  window.supabaseClient = createClient(
    'https://qnlbaxxbsbwbgqucbywn.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFubGJheHhic2J3YmdxdWNieXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzQzNjcsImV4cCI6MjA5NDcxMDM2N30.6n-0yf-9fuZKO8qJEM2dOmwBNxhijQtaBzVo2TNesjM',
    { auth: { persistSession: true } }
  );
  
  console.log('✅ Supabase conectado');
}

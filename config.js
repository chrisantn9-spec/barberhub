// config.js - Versión lista para usar

if (typeof supabase !== 'undefined') {
  const { createClient } = supabase;

  // Tus credenciales correctas
  const SUPABASE_URL = 'https://qnlbaxxbsbwbgqucbywn.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFubGJheHhic2J3YmdxdWNieXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzQzNjcsImV4cCI6MjA5NDcxMDM2N30.6n-0yf-9fuZKO8qJEM2dOmwBNxhijQtaBzVo2TNesjM';

  // Inicializar cliente global
  window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });

  console.log('✅ Supabase conectado correctamente');
} else {
  console.error('❌ Error: El CDN de Supabase no ha cargado.');
}

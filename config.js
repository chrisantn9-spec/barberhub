// config.js - FUNCIONA EN NAVEGADOR (sin módulos)

// Esperar a que Supabase CDN esté disponible
if (typeof supabase === 'undefined') {
  console.error('❌ Supabase CDN no cargó. Verifica que el script esté en tu HTML.');
} else {
  const { createClient } = supabase;
  
  // 🔑 TU KEY DE SUPABASE (anon/public, NO service_role)
  const SUPABASE_URL = 'https://qnlbaxxbsbwbgqucbywn.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFubGJheHhic2J3YmdxdWNieXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzE5NjQsImV4cCI6MjA2MzMwNzk2NH0.6X8wvGv7VZvZvZvZvZvZvZvZvZvZvZvZvZvZvZvZvZ';
  
  // Crear cliente global
  window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
  
  console.log('✅ Supabase conectado');
}

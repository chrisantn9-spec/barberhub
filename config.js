// config.js - SIN MÓDULOS - Funciona en todos los navegadores

// Verificar que Supabase CDN está cargado
if (typeof supabase === 'undefined') {
  console.error('❌ Supabase no está cargado. Verifica que el CDN esté incluido en tu HTML.');
} else {
  const { createClient } = supabase;
  
  // Tus credenciales (VERIFICA QUE ESTÉN COMPLETAS)
  const SUPABASE_URL = 'https://qnlbaxxbsbwbgqucbywn.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // ← TU KEY COMPLETA AQUÍ
  
  // Crear cliente global
  window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
  
  console.log('✅ Supabase inicializado correctamente');
}

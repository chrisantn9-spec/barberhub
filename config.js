// config.js - Versión estable para navegador
if (typeof supabase === 'undefined') {
  console.error('❌ Supabase CDN no cargó. Revisa el orden de tus scripts en HTML.');
} else {
  const { createClient } = supabase;
  
  // ⚠️ VERIFICA QUE ESTA KEY ESTÉ COMPLETA EN TU DASHBOARD DE SUPABASE
  const SUPABASE_URL ='sb_publishable_s2KUqB2eUZFtKFatxuQagQ_3HOQ24P0';
  const SUPABASE_ANON_KEY = 'TU_KEY_COMPLETA_AQUI'; // ← Pega tu key real aquí

  window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  });
  
  console.log('✅ Supabase conectado correctamente');
}

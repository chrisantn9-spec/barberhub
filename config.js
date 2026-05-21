// config.js
const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co'; // ⬅️ PEGA TU URL REAL
const SUPABASE_KEY = 'TU-CLAVE-ANON-PUBLIC';            // ⬅️ PEGA TU CLAVE REAL

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,        // ✅ Guarda sesión en localStorage
    autoRefreshToken: true,      // ✅ Refresca el token automáticamente
    storage: window.localStorage,// ✅ Usa almacenamiento permanente
    detectSessionInUrl: true     // ✅ Detecta el callback de Google
  }
});

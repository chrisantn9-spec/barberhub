// config.js
// ⚠️ NUNCA subas claves secretas a GitHub
// Usa variables de entorno en Vercel/Netlify

const SUPABASE_URL = 'https://TU-PROYECTO.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_s2KUqB2eUZFtKFatxuQagQ_3HOQ24P0'; // ✅ Esta SÍ es pública

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    detectSessionInUrl: true
  }
});

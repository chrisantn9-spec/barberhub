// config.js
const SUPABASE_URL = 'https://qnlbaxxbsbwbgqucbywn.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_s2KUqB2eUZFtKFatxuQagQ_3HOQ24P0';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    detectSessionInUrl: true
  }
});
"fix config js syntax"

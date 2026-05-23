// config.js - SIN MÓDULOS - Compatible con todos los navegadores

// Cargar Supabase desde CDN (UMD build)
const { createClient } = supabase;

// Tus credenciales
const SUPABASE_URL = 'https://qnlbaxxbsbwbgqucbywn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFubGJheHhic2J3YmdxdWNieXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzE5NjQsImV4cCI6MjA2MzMwNzk2NH0.6X8wvGv7VZvZvZvZvZvZvZvZvZvZvZvZvZvZvZvZvZ';

// Crear cliente y exponer GLOBALMENTE
window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
});

console.log('✅ Supabase client initialized');

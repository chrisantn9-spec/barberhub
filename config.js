// config.js - Versión compatible con navegador (sin módulos)

// Cargar Supabase desde CDN
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// Tus credenciales de Supabase
const SUPABASE_URL = 'https://qnlbaxxbsbwbgqucbywn.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFubGJheHhic2J3YmdxdWNieXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc3MzE5NjQsImV4cCI6MjA2MzMwNzk2NH0.6X8wvGv7VZvZvZvZvZvZvZvZvZvZvZvZvZvZvZvZvZ' // ← Reemplaza con tu key real

// Crear cliente y exponerlo GLOBALMENTE
window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

console.log('✅ Supabase client initialized')

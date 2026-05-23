// config.js - Versión navegador (SIN módulos)
const { createClient } = supabase;

// 🔑 PEGA AQUÍ TU CLAVE PÚBLICA (anon) DE SUPABASE
const SUPABASE_URL = 'https://'qnlbaxxbsbwbgqucbywn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFubGJheHhic2J3YmdxdWNieXduIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMzQzNjcsImV4cCI6MjA5NDcxMDM2N30.6n-0yf-9fuZKO8qJEM2dOmwBNxhijQtaBzVo2TNesjM'; 

window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true }
});

console.log('✅ Supabase configurado');

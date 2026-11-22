// js/supabase.js
window.SiAkad = window.SiAkad || {};

(function(App) {
  // GANTI DENGAN URL DAN ANON KEY DARI DASHBOARD SUPABASE ANDA
  const SUPABASE_URL = "https://iouqqpkfwnhawnchylrd.supabase.co";
  const SUPABASE_ANON_KEY = "MASUKKAN_ANON_KEY_ANDA_DI_SINI"; 

  // Inisialisasi Supabase Client
  const { createClient } = supabase;
  App.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  console.log("Supabase Client siap digunakan!");
})(window.SiAkad);
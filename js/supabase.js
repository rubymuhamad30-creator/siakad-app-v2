// js/supabase.js
window.SiAkad = window.SiAkad || {};

(function(App) {
  // GANTI DENGAN URL DAN ANON KEY DARI DASHBOARD SUPABASE ANDA
  const SUPABASE_URL = "https://iouqqpkfwnhawnchylrd.supabase.co";
  const SUPABASE_ANON_KEY = "sb_publishable_wDop9fkDPMfsu9-Uh0MzLA_U-3RWfZy"; 

  // Inisialisasi Supabase Client
  const { createClient } = supabase;
  App.supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  
  console.log("Supabase Client siap digunakan!");
})(window.SiAkad);

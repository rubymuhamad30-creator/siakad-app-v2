// js/state.js
window.SiAkad = window.SiAkad || {};

(function(App) {
  const STORAGE_KEY = App.STORAGE_KEY || "siakad_v1";
  const today = () => new Date().toISOString().slice(0, 10);
  const timeNow = () => {
    const d = new Date();
    return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  };

  const escapeHtml = (str) => String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  const S = { v: "dash", me: null, role: null, logged: false, q: "", open: false, mkx: null, edit: null };

  const seed = () => ({
    th: "auto",
    inst: "Akademi Nurul Bayan",
    dosen: [
      { id: 1, nama: "Ustadz Abdullah Sahl, Lc", email: "abdullah@siakad.id" },
      { id: 2, nama: "Ustadz Moh. Zamzamy Al Islamy, Lc", email: "zamzamy@siakad.id" }
    ],
    mhs: [
      { id: 1, nim: "2026001", nama: "Ahmad Fauzi", email: "ahmad@mail.com", ortu: "Bpk. Yusuf", foto: "" },
      { id: 2, nim: "2026002", nama: "Siti Aisyah", email: "aisyah@mail.com", ortu: "Bpk. Hasan", foto: "" }
    ],
    mk: [
      // --- CONTOH JADWAL DITAMBAHKAN DI SINI ---
      // Format: "Hari, HH:MM-HH:MM" (Gunakan nama hari bahasa Indonesia)
      { 
        id: 1, nama: "Fiqih", dosen: "Ustadz Abdullah Sahl, Lc", 
        jadwal: "Senin, 08:00-09:30", 
        zoom: "https://us06web.zoom.us/j/8845119628", yt: "", gform: "", files: [] 
      },
      { 
        id: 2, nama: "Hadist", dosen: "Ustadz Moh. Zamzamy Al Islamy, Lc", 
        jadwal: "Selasa, 10:00-11:30", 
        zoom: "https://us06web.zoom.us/j/4625237062", yt: "", gform: "", files: [] 
      },
      // ... (MK lainnya biarkan kosong jadwalnya atau tambahkan sendiri)
      { id: 3, nama: "Tafsir", dosen: "Ustadz Tajudin, Lc., M.Pd", jadwal: "", zoom: "", yt: "", gform: "", files: [] },
      { id: 4, nama: "Metode Nurul Bayan", dosen: "Syaikh Ahmad Kamaly Al-Misry, M.Ag", jadwal: "", zoom: "", yt: "", gform: "", files: [] },
      { id: 5, nama: "Bahasa Arab", dosen: "Ustadz Moh. Zamzamy Al Islamy, Lc", jadwal: "", zoom: "", yt: "", gform: "", files: [] },
      { id: 6, nama: "Khatmah Tilawah", dosen: "Ustadz Rezky Budiawan", jadwal: "", zoom: "", yt: "", gform: "", files: [] },
      { id: 7, nama: "Dirosatul Mutun", dosen: "Ustadz Deni Irawan, Lc", jadwal: "", zoom: "", yt: "", gform: "", files: [] },
      { id: 8, nama: "Penyetaran S1", dosen: "Ustadz Moh. Zamzamy Al Islamy, Lc", jadwal: "", zoom: "", yt: "", gform: "", files: [] },
      { id: 9, nama: "Tahfidzul Qur'an", dosen: "Ustadz Rezky Budiawan", jadwal: "", zoom: "", yt: "", gform: "", files: [] }
    ],
    absen: [], nilai: [], setor: [],
    notif: [{ id: 1, t: "Sistem Auto-Join Zoom diaktifkan.", d: today(), r: 0 }]
  });

  let db = seed();

  function loadData() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        db = JSON.parse(raw);
        if (!db.dosen) db.dosen = seed().dosen;
      } else { db = seed(); }
    } catch (e) { db = seed(); }
    App.db = db;
  }

  function saveData() { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(db)); } catch (e) {} }
  function setDb(newDb) { db = newDb; App.db = db; saveData(); }
  function addNotification(text) { db.notif.unshift({ id: Date.now(), t: text, d: today(), w: timeNow(), r: 0 }); saveData(); }

  const getMhs = (id) => db.mhs.find((m) => m.id == id) || { nama: "?" };
  const getMk = (id) => db.mk.find((m) => m.id == id) || { nama: "?" };
  const nextId = (arr) => arr.reduce((max, item) => Math.max(max, item.id), 0) + 1;
  const calculateGrade = (score) => {
    if (score >= 85) return "A"; if (score >= 75) return "B";
    if (score >= 65) return "C"; if (score >= 50) return "D"; return "E";
  };

  Object.assign(App, {
    today, timeNow, escapeHtml, S, seed,
    get db() { return db; }, set db(val) { db = val; },
    loadData, saveData, setDb, addNotification, getMhs, getMk, nextId, calculateGrade
  });
})(window.SiAkad);
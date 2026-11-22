// js/constants.js - Konstanta & konfigurasi dasar SiAkad
window.SiAkad = window.SiAkad || {};

// Logo utama aplikasi (menggunakan file logo di folder img/)
window.SiAkad.LOGO = "img/logo.jpg";

window.SiAkad.SURAH_LIST = [
  "Al-Fatihah", "Al-Baqarah", "Ali Imran", "An-Nisa", "Al-Ma'idah", "Al-An'am",
  "Al-A'raf", "Al-Anfal", "At-Taubah", "Yunus", "Hud", "Yusuf", "Ar-Ra'd", "Ibrahim",
  "Al-Hijr", "An-Nahl", "Al-Isra", "Al-Kahfi", "Maryam", "Taha", "Al-Anbiya", "Al-Hajj",
  "Al-Mu'minun", "An-Nur", "Al-Furqan", "Asy-Syu'ara", "An-Naml", "Al-Qasas", "Al-'Ankabut",
  "Ar-Rum", "Luqman", "As-Sajdah", "Al-Ahzab", "Saba", "Fatir", "Yasin", "As-Saffat",
  "Sad", "Az-Zumar", "Gafir", "Fussilat", "Asy-Syura", "Az-Zukhruf", "Ad-Dukhan",
  "Al-Jasiyah", "Al-Ahqaf", "Muhammad", "Al-Fath", "Al-Hujurat", "Qaf", "Az-Zariyat",
  "At-Tur", "An-Najm", "Al-Qamar", "Ar-Rahman", "Al-Waqi'ah", "Al-Hadid", "Al-Mujadalah",
  "Al-Hasyr", "Al-Mumtahanah", "As-Saff", "Al-Jumu'ah", "Al-Munafiqun", "At-Tagabun",
  "At-Talaq", "At-Tahrim", "Al-Mulk", "Al-Qalam", "Al-Haqqah", "Al-Ma'arij", "Nuh",
  "Al-Jinn", "Al-Muzzammil", "Al-Muddassir", "Al-Qiyamah", "Al-Insan", "Al-Mursalat",
  "An-Naba", "An-Nazi'at", "'Abasa", "At-Takwir", "Al-Infitar", "Al-Mutaffifin",
  "Al-Insyiqaq", "Al-Buruj", "At-Tariq", "Al-A'la", "Al-Gasyiyah", "Al-Fajr",
  "Al-Balad", "Asy-Syams", "Al-Lail", "Ad-Duha", "Asy-Syarh", "At-Tin", "Al-'Alaq",
  "Al-Qadr", "Al-Bayyinah", "Az-Zalzalah", "Al-'Adiyat", "Al-Qari'ah", "At-Takasur",
  "Al-'Asr", "Al-Humazah", "Al-Fil", "Quraisy", "Al-Ma'un", "Al-Kausar", "Al-Kafirun",
  "An-Nasr", "Al-Masad", "Al-Ikhlas", "Al-Falaq", "An-Nas"
];

window.SiAkad.STORAGE_KEY = "siakad_v1";

window.SiAkad.NAV_ITEMS = [
  ["dash", "📊", "Dashboard"],
  ["mhs", "🎓", "Mahasiswa"],
  ["idc", "🪪", "ID Card"],
  ["mk", "📚", "Mata Kuliah"],
  ["abs", "✅", "Absensi"],
  ["uts", "📝", "UTS / Evaluasi"],
  ["set", "🕌", "Setoran Tilawah"],
  ["ntf", "🔔", "Notifikasi"],
  ["cfg", "⚙️", "Pengaturan"]
];

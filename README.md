# SiAkad – Sistem Pembelajaran Akademi Menurut Bayang

Aplikasi web manajemen perkuliahan yang telah di-refactor menjadi arsitektur modular multi-file yang bersih, rapi, dan mudah dikembangkan.

---

## 📁 Struktur File Proyek

```text
siakad-app/
├── index.html              # Halaman utama aplikasi (HTML bersih)
├── README.md               # Dokumentasi proyek & cara penggunaan
│
├── css/
│   └── style.css           # Seluruh stylesheet (tema, layout, responsif, print)
│
└── js/
    ├── constants.js        # Konstanta: Logo base64, 114 Nama Surah, Menu Navigasi
    ├── state.js            # State global, local storage helper, seed data, notifikasi
    ├── main.js             # Bootstrap aplikasi, routing tampilan, theme handler
    │
    └── views/              # Komponen halaman (Modular Views)
        ├── login.js        # Halaman autentikasi login demo & reset password
        ├── dashboard.js    # Statistik mahasiswa, kehadiran & rata-rata nilai
        ├── mahasiswa.js    # CRUD data mahasiswa, pencarian & upload foto
        ├── idcard.js       # Tampilan & fitur cetak Kartu Mahasiswa (KTM)
        ├── matakuliah.js   # Manajemen mata kuliah, tautan Zoom/YouTube, berkas materi
        ├── absensi.js      # Pencatatan absensi manual & otomatis (Zoom/YouTube)
        ├── evaluasi.js     # Input dan rekapitulasi nilai UTS / evaluasi
        ├── tilawah.js      # Setoran tilawah/khotmah, rekaman audio & skor tajwid
        ├── notifikasi.js   # Riwayat notifikasi aktivitas sistem
        └── pengaturan.js   # Konfigurasi nama kampus, tema, backup & restore JSON
```

---

## 🚀 Cara Menjalankan

Karena proyek ini menggunakan fitur modern **JavaScript ES Modules (`import/export`)**, disarankan menjalankannya dengan local web server:

### Opsi 1: Menggunakan VS Code Live Server (Direkomendasikan)
1. Buka folder `siakad-app` di VS Code.
2. Klik kanan pada file `index.html` dan pilih **"Open with Live Server"**.

### Opsi 2: Menggunakan Node.js / npx
Jalankan perintah berikut di terminal pada folder `siakad-app`:
```bash
npx serve .
# atau
npx http-server .
```

### Opsi 3: Menggunakan Python
```bash
# Python 3
python -m http.server 8000
```
Lalu buka browser di `http://localhost:8000`.

---

## 🔑 Akun Demo
- **Email:** `admin@siakad.id`
- **Password:** `admin123`

---

## 🌟 Keuntungan Pemisahan File Ini:
1. **Pemisahan Tanggung Jawab (Separation of Concerns):**
   - File HTML hanya berisi kerangka.
   - File CSS terisolasi dan mudah diubah styling-nya.
   - Setiap fitur logika (mahasiswa, tilawah, nilai, absensi) berada di file terpisah di dalam folder `js/views/`.
2. **Kemudahan Kolaborasi:** Anggota tim dapat mengerjakan fitur yang berbeda (misal: fitur tilawah atau absensi) tanpa konflik kode di satu file raksasa.
3. **Mudah Diintegrasikan ke Backend / API:** State di `js/state.js` dapat dengan mudah digantikan panggilan `fetch()` ke REST API (Express, Laravel, Django, Supabase, dll.) di masa mendatang.

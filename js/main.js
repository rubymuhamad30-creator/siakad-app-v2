// js/main.js
window.SiAkad = window.SiAkad || {};

(function(App) {
  const ROLE_MENUS = {
    admin: ["dash", "mhs", "idc", "mk", "abs", "uts", "set", "ntf", "cfg"],
    dosen: ["dash", "mk", "abs", "uts", "set", "ntf"],
    mahasiswa: ["dash", "idc", "abs", "uts", "set", "ntf", "cfg"]
  };

  const VIEW_MAP = {
    dash: () => App.renderDashboard(),
    mhs: () => App.renderMahasiswa(),
    idc: () => App.renderIdCard(),
    mk: () => App.renderMataKuliah(),
    abs: () => App.renderAbsensi(),
    uts: () => App.renderEvaluasi(),
    set: () => App.renderTilawah(),
    ntf: () => App.renderNotifikasi(),
    cfg: () => App.renderPengaturan()
  };

  let prayerData = {
    location: "Memuat...",
    times: [
      { name: "Subuh", time: "04:30" }, { name: "Dzuhur", time: "12:00" },
      { name: "Ashar", time: "15:15" }, { name: "Maghrib", time: "18:00" }, { name: "Isya", time: "19:15" }
    ]
  };
  let isPrayerFetched = false;
  let clockInterval = null;
  let autoJoinInterval = null;
  let joinedClassesToday = {};

  // --- FUNGSI API JADWAL SHOLAT ---
  async function fetchPrayerTimes() {
    try {
      const locRes = await fetch("https://ipapi.co/json/");
      const locData = await locRes.json();
      const city = locData.city || "Jakarta";
      
      const date = new Date();
      const dd = date.getDate().toString().padStart(2, '0');
      const mm = (date.getMonth() + 1).toString().padStart(2, '0');
      const yyyy = date.getFullYear();
      
      const apiRes = await fetch(`https://api.aladhan.com/v1/timingsByCity/${dd}-${mm}-${yyyy}?city=${city}&country=Indonesia&method=11`);
      const apiData = await apiRes.json();
      
      if (apiData.code === 200) {
        const t = apiData.data.timings;
        prayerData.location = `${city}`;
        prayerData.times = [
          { name: "Subuh", time: t.Fajr }, { name: "Dzuhur", time: t.Dhuhr },
          { name: "Ashar", time: t.Asr }, { name: "Maghrib", time: t.Maghrib }, { name: "Isya", time: t.Isha }
        ];
        isPrayerFetched = true;
        document.querySelectorAll("#prayer-location").forEach(el => el.textContent = prayerData.location);
      }
    } catch (e) {
      prayerData.location = "Jakarta";
      isPrayerFetched = true;
      document.querySelectorAll("#prayer-location").forEach(el => el.textContent = prayerData.location);
    }
  }

  // --- FUNGSI AI AUTO-JOIN ZOOM ---
  function startAutoJoinWatcher() {
    if (autoJoinInterval) clearInterval(autoJoinInterval);
    autoJoinInterval = setInterval(() => {
      if (App.S.role !== "mahasiswa" && App.S.role !== "dosen") return; 
      const now = new Date();
      const daysIndo = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const currentDay = daysIndo[now.getDay()];
      const currentTime = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      const todayDate = App.today();

      App.db.mk.forEach(k => {
        if (!k.jadwal || !k.zoom) return; 
        const parts = k.jadwal.split(','); 
        if (parts.length < 2) return;
        const dayName = parts[0].trim();
        const timeRange = parts[1].trim().split('-');
        if (timeRange.length < 2) return;
        const startTime = timeRange[0].trim();
        const endTime = timeRange[1].trim();

        if (currentDay === dayName && currentTime >= startTime && currentTime <= endTime) {
          const joinKey = `${todayDate}_${k.id}`;
          if (!joinedClassesToday[joinKey]) {
            joinedClassesToday[joinKey] = true; 
            App.addNotification(`🔔 Kelas ${k.nama} telah dimulai! Membuka Zoom otomatis...`);
            setTimeout(() => {
              const confirmJoin = confirm(`[AUTO-JOIN] Kelas "${k.nama}" sedang berlangsung.\n\nKlik OK untuk membuka Zoom.`);
              if (confirmJoin) {
                window.open(k.zoom, "_blank", "noopener");
                if (App.S.role === "mahasiswa") {
                  App.markAbsen(App.S.me, k.id, "Auto-Join");
                  App.renderApp();
                }
              }
            }, 1000);
          }
        }
      });
    }, 10000); 
  }

  // --- FUNGSI UTAMA ---
  function applyTheme() {
    const root = document.documentElement;
    if (App.db.th === "auto") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", App.db.th);
  }

  function toggleTheme() {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark" || (App.db.th === "auto" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    App.db.th = isDark ? "light" : "dark"; App.saveData(); renderApp();
  }

  function go(viewKey) {
    App.S.v = viewKey; App.S.open = false; App.S.q = ""; App.S.edit = null; App.S.mkx = null; renderApp();
  }

  function widgetClockHtml() {
    return `
      <div id="sidebar-clock" style="font-size: 24px; font-weight: 800; color: var(--tx); letter-spacing: -0.5px; line-height: 1.1;">--:--:--</div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 6px; border-bottom: 1px solid var(--bd); padding-bottom: 8px;">
        <div id="sidebar-date" style="font-size: 11px; font-weight: 600; color: var(--mu);">Memuat...</div>
        <div style="font-size: 10px; font-weight: 700; color: var(--tx-sec); background: var(--bg); padding: 2px 6px; border-radius: 4px;">
          📍 <span id="prayer-location">${prayerData.location}</span>
        </div>
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; margin-top: 8px;">
        <div>
          <div style="font-size: 10px; color: var(--pr); font-weight: 700; text-transform: uppercase;">Sholat Berikutnya</div>
          <div id="next-prayer-name" style="font-size: 13px; font-weight: 800; color: var(--tx); margin-top: 2px;">-</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size: 10px; color: var(--mu); font-weight: 600;">Menuju</div>
          <div id="prayer-countdown" style="font-size: 13px; font-weight: 800; color: var(--pr); font-family: monospace;">--:--:--</div>
        </div>
      </div>
    `;
  }

  function renderApp() {
    applyTheme();
    if (clockInterval) clearInterval(clockInterval);

    const root = document.getElementById("root");
    if (!root) return;

    if (!App.S.logged) { root.innerHTML = App.renderLogin(); return; }

    const allowedMenus = ROLE_MENUS[App.S.role] || ROLE_MENUS.mahasiswa;
    const filteredNavs = App.NAV_ITEMS.filter(nav => allowedMenus.includes(nav[0]));
    if (!allowedMenus.includes(App.S.v)) App.S.v = "dash";

    const unreadCount = App.db.notif.filter((n) => !n.r).length;
    const currentNav = filteredNavs.find((n) => n[0] === App.S.v) || filteredNavs[0];
    const viewFn = VIEW_MAP[App.S.v] || VIEW_MAP.dash;

    let userHtml = "";
    if (App.S.role === "admin") userHtml = `<span style="font-size:16px;">👑</span> Admin`;
    else if (App.S.role === "dosen") {
      const ds = App.db.dosen.find(d => d.id == App.S.me);
      userHtml = `<span style="font-size:16px;">🧑‍🏫</span> ${ds ? ds.nama : 'Dosen'}`;
    } else {
      const m = App.getMhs(App.S.me);
      userHtml = m.foto ? `<img src="${m.foto}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;margin-right:6px"> ${App.escapeHtml(m.nama)}` : `<span style="font-size:16px;margin-right:4px;">🎓</span> ${App.escapeHtml(m.nama)}`;
    }

    let searchPlaceholder = "", showSearch = false;
    if (App.S.v === "mk") { searchPlaceholder = "🔍 Cari MK..."; showSearch = true; }
    else if (App.S.v === "mhs" && App.S.role === "admin") { searchPlaceholder = "🔍 Cari Mahasiswa..."; showSearch = true; }
    else if (App.S.v === "uts") { searchPlaceholder = "🔍 Cari MK..."; showSearch = true; }
    else if (App.S.v === "dash" && App.S.role === "mahasiswa") { searchPlaceholder = "🔍 Cari MK Saya..."; showSearch = true; }

    root.innerHTML = `
      <div class="sidebar-overlay ${App.S.open ? "open" : ""}" onclick="toggleMenu()"></div>

      <div id="app">
        <aside class="${App.S.open ? "open" : ""}">
          <button class="close-sidebar-btn" onclick="toggleMenu()">✖</button>
          <a class="logo" href="#" onclick="go('dash');return false">
            <img src="${App.LOGO}" alt="Logo">
            <div><div class="logo-text-title">SiAkad</div><small>Akademi Nurul Bayan</small></div>
          </a>

          <div class="sidebar-widget-container" style="padding: 0 8px; margin-bottom: 24px;">
            ${widgetClockHtml()}
          </div>

          <div class="nav-group">
            ${filteredNavs.map((n) => `
              <button class="nav ${App.S.v === n[0] ? "on" : ""}" onclick="go('${n[0]}')">
                <span class="nav-icon">${n[1]}</span><span class="nav-text">${n[2]}</span>
                ${n[0] === "ntf" && unreadCount ? ` <span class="tag">${unreadCount}</span>` : ""}
              </button>
            `).join("")}
          </div>

          <button class="nav nav-logout" onclick="logout()">
            <span class="nav-icon">🚪</span><span class="nav-text">Keluar</span>
          </button>
        </aside>

        <main>
          <div class="top">
            <div class="top-left">
              <button class="btn g menu-btn" onclick="toggleMenu()">☰</button>
              <div>
                <h1>${currentNav[2]}</h1>
                <span class="top-breadcrumb">SiAkad / ${currentNav[2]}</span>
              </div>
            </div>
            
            <div class="top-right">
              <div class="user-selector">
                ${userHtml} <span style="color:var(--mu);font-weight:400;text-transform:uppercase;margin-left:4px;font-size:10px">(${App.S.role})</span>
              </div>
              <button class="theme-toggle-btn" onclick="toggleTheme()" title="Ubah Tema">🌓</button>
              
              ${showSearch ? `
                <input type="text" value="${App.escapeHtml(App.S.q)}" 
                       placeholder="${searchPlaceholder}" 
                       oninput="handleSearch(this.value)"
                       style="width:250px; margin:0; padding:8px 14px; border-radius:20px; font-size:13px; background:var(--card); border:1px solid var(--bd); box-shadow: var(--sh-sm);">
              ` : ""}
            </div>
          </div>

          ${App.S.v === "dash" ? `
            <div class="mobile-widget">
              ${widgetClockHtml()}
            </div>
          ` : ""}

          ${viewFn()}
        </main>
      </div>
    `;

    if (!isPrayerFetched) fetchPrayerTimes();
    startClock();
    startAutoJoinWatcher();
  }

  function startClock() {
    const updateClock = () => {
      const clockEls = document.querySelectorAll("#sidebar-clock");
      const dateEls = document.querySelectorAll("#sidebar-date");
      const prayerNameEls = document.querySelectorAll("#next-prayer-name");
      const countdownEls = document.querySelectorAll("#prayer-countdown");
      
      if (clockEls.length === 0) {
        clearInterval(clockInterval); return;
      }

      const now = new Date();
      const h = now.getHours().toString().padStart(2, '0');
      const m = now.getMinutes().toString().padStart(2, '0');
      const s = now.getSeconds().toString().padStart(2, '0');
      
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
      const dateStr = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;

      let nextPrayer = null, nextPrayerDate = null;
      for (let i = 0; i < prayerData.times.length; i++) {
        const p = prayerData.times[i];
        const [ph, pm] = p.time.split(':').map(Number);
        const pDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), ph, pm, 0);
        if (pDate > now) { nextPrayer = p; nextPrayerDate = pDate; break; }
      }

      if (!nextPrayer) {
        nextPrayer = prayerData.times[0];
        const [ph, pm] = nextPrayer.time.split(':').map(Number);
        nextPrayerDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, ph, pm, 0);
      }

      const diff = nextPrayerDate - now;
      const diffH = Math.floor(diff / (1000 * 60 * 60)).toString().padStart(2, '0');
      const diffM = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)).toString().padStart(2, '0');
      const diffS = Math.floor((diff % (1000 * 60)) / 1000).toString().padStart(2, '0');

      clockEls.forEach(el => el.textContent = `${h}:${m}:${s}`);
      dateEls.forEach(el => el.textContent = dateStr);
      prayerNameEls.forEach(el => el.textContent = `${nextPrayer.name} (${nextPrayer.time})`);
      countdownEls.forEach(el => el.textContent = `-${diffH}:${diffM}:${diffS}`);
    };

    updateClock();
    clockInterval = setInterval(updateClock, 1000);
  }

  function handleSearch(val) {
    App.S.q = val; App.renderApp();
    const input = document.querySelector('.top-right input');
    if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); }
  }

  function logout() { App.S.logged = false; App.S.role = null; App.S.me = null; App.S.q = ""; renderApp(); }
  function toggleMenu() { App.S.open = !App.S.open; renderApp(); }

  Object.assign(App, { applyTheme, toggleTheme, go, renderApp, handleSearch, logout, toggleMenu });
  Object.assign(window, App);

  // --- INISIALISASI APLIKASI (MENDUKUNG ASYNC SUPABASE) ---
  async function initApp() {
    // Tampilkan loading screen sementara
    const root = document.getElementById("root");
    if (root) {
      root.innerHTML = `
        <div style="display:flex; align-items:center; justify-content:center; height:100vh; flex-direction:column; gap:16px; background:var(--bg); color:var(--tx);">
          <div style="width:40px; height:40px; border:4px solid var(--bd); border-top-color:var(--pr); border-radius:50%; animation:spin 1s linear infinite;"></div>
          <div style="font-weight:600; font-size:14px;">Menghubungkan ke Server...</div>
        </div>
        <style>@keyframes spin { to { transform: rotate(360deg); } }</style>
      `;
    }

    // Tunggu data dari Supabase selesai diambil
    if (App.loadData) {
      await App.loadData(); 
    }
    
    // Setelah data siap, render aplikasi
    renderApp();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }
})(window.SiAkad);
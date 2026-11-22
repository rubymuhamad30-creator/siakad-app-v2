// js/views/dashboard.js
window.SiAkad = window.SiAkad || {};

(function(App) {
  function renderBars(items) {
    if (!items || items.length === 0) return "<p style='color:var(--mu)'>Belum ada data.</p>";
    return items.map((i) => `
      <div style="margin:8px 0">
        <div class="row" style="justify-content:space-between">
          <span>${App.escapeHtml(i[0])}</span>
          <b>${i[1]}${i[2] || ""}</b>
        </div>
        <div class="bar"><i style="width:${Math.min(100, i[3] ?? i[1])}%;background:${i[4]||'linear-gradient(90deg, var(--pr), var(--ac))'}"></i></div>
      </div>
    `).join("");
  }

  function renderMkGrid() {
    // Filter Mata Kuliah berdasarkan ketikan di Topbar
    const query = App.S.q.toLowerCase();
    const filteredMk = App.db.mk.filter(k => 
      k.nama.toLowerCase().includes(query) || k.dosen.toLowerCase().includes(query)
    );

    if (filteredMk.length === 0) {
      return `
        <div class="card" style="text-align:center; color:var(--mu); padding:40px;">
          <div style="font-size:30px; margin-bottom:10px;">🔍</div>
          Mata kuliah tidak ditemukan.
        </div>
      `;
    }

    return `
      <div class="grid" style="grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap:16px;">
        ${filteredMk.map((k, index) => {
          const colors = ['#fee2e2', '#dcfce7', '#e0f2fe', '#fef08a', '#f3e8ff'];
          const iconColors = ['#ef4444', '#22c55e', '#0ea5e9', '#eab308', '#a855f7'];
          const bg = colors[index % colors.length];
          const col = iconColors[index % iconColors.length];
          return `
            <div onclick="openMkDetail(${k.id})" style="cursor:pointer; background:var(--card); border:1px solid var(--bd); border-radius:var(--radius-lg); padding:20px; text-align:center; transition:all 0.2s; box-shadow:var(--sh-sm);" onmouseover="this.style.transform='translateY(-4px)'; this.style.borderColor='var(--pr)'" onmouseout="this.style.transform='none'; this.style.borderColor='var(--bd)'">
              <div style="width:50px;height:50px;margin:0 auto 12px; background:${bg}; color:${col}; border-radius:50%; display:flex;align-items:center;justify-content:center;font-size:24px;">📖</div>
              <div style="font-weight:700; font-size:14px; line-height:1.3; margin-bottom:4px;">${App.escapeHtml(k.nama)}</div>
              <div style="font-size:11px; color:var(--mu);">${App.escapeHtml(k.dosen.split(',')[0])}</div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderDashboard() {
    const isMhs = App.S.role === "mahasiswa";
    const myId = App.S.me;

    let statMhs = App.db.mhs.length;
    let avgTajwid = App.db.setor.length ? Math.round(App.db.setor.reduce((acc, s) => acc + s.avg, 0) / App.db.setor.length) : 0;
    let absenCount = App.db.absen.length;

    let warningHtml = "";
    let recentActivityHtml = "";

    if (isMhs) {
      const mySetor = App.db.setor.filter(s => s.m == myId);
      avgTajwid = mySetor.length ? Math.round(mySetor.reduce((acc, s) => acc + s.avg, 0) / mySetor.length) : 0;
      
      const myAbsen = App.db.absen.filter(a => a.m == myId);
      absenCount = myAbsen.length;

      // 1. CEK PERINGATAN 80%
      const STANDAR_PERTEMUAN = 10; 
      let mkBermasalah = [];
      App.db.mk.forEach(k => {
        const hadir = myAbsen.filter(a => a.mk == k.id).length;
        const persen = Math.min(100, Math.round((hadir / STANDAR_PERTEMUAN) * 100));
        if (persen < 80) mkBermasalah.push(`${k.nama} (${persen}%)`);
      });

      if (mkBermasalah.length > 0) {
        warningHtml = `
          <div class="card" style="border-left:4px solid var(--pr); background:var(--pr-soft); margin-bottom:20px">
            <b style="color:var(--pr);display:block;margin-bottom:4px">⚠️ Peringatan Kehadiran (Minimal 80%)</b>
            <p style="font-size:13px;color:var(--tx-sec);margin:0">
              Anda belum memenuhi syarat kehadiran 80% untuk beberapa MK. Segera penuhi sebelum UTS.
            </p>
          </div>
        `;
      }

      // 2. AKTIVITAS TERAKHIR (Menampilkan Jam Absen)
      const recentAbsen = [...myAbsen].reverse().slice(0, 3);
      
      if (recentAbsen.length > 0) {
        recentActivityHtml = `
          <div class="card" style="margin-top:20px">
            <div class="card-title" style="font-size:15px">🕒 Kehadiran Terakhir</div>
            ${recentAbsen.map(a => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:8px 0; border-bottom:1px dashed var(--bd);">
                <div>
                  <div style="font-weight:600; font-size:13px;">${App.escapeHtml(App.getMk(a.mk).nama)}</div>
                  <div style="font-size:11px; color:var(--mu);">Via ${a.via} • ${a.d}</div>
                </div>
                <div style="font-weight:700; font-size:14px; color:var(--ac);">${a.w || '--:--'}</div>
              </div>
            `).join("")}
          </div>
        `;
      }
    }

    if (isMhs) {
      return `
        ${warningHtml}
        <div class="grid">
          <div class="stat-card"><div class="stat-icon green">✅</div><div class="stat-info"><div class="stat-label">Total Kehadiran</div><div class="stat-val">${absenCount} Sesi</div></div></div>
          <div class="stat-card"><div class="stat-icon">🕌</div><div class="stat-info"><div class="stat-label">Rata-rata Tajwid</div><div class="stat-val">${avgTajwid}</div></div></div>
        </div>
        
        <div style="margin-top:30px; margin-bottom:15px; display:flex; justify-content:space-between; align-items:center;">
          <h2 style="font-size:18px; font-weight:800;">Mata Kuliah Saya</h2>
        </div>
        ${renderMkGrid()}
        
        ${recentActivityHtml}
      `;
    }

    // Tampilan Admin / Dosen
    return `
      <div class="grid">
        <div class="stat-card"><div class="stat-icon">🎓</div><div class="stat-info"><div class="stat-label">Mahasiswa</div><div class="stat-val">${statMhs}</div></div></div>
        <div class="stat-card"><div class="stat-icon green">📚</div><div class="stat-info"><div class="stat-label">Mata Kuliah</div><div class="stat-val">${App.db.mk.length}</div></div></div>
        <div class="stat-card"><div class="stat-icon">✅</div><div class="stat-info"><div class="stat-label">Absensi Tercatat</div><div class="stat-val">${absenCount}</div></div></div>
        <div class="stat-card"><div class="stat-icon green">🕌</div><div class="stat-info"><div class="stat-label">Rata Tajwid</div><div class="stat-val">${avgTajwid}</div></div></div>
      </div>
      <div class="grid">
        <div class="card"><div class="card-title">Kehadiran Global</div>${renderBars(App.db.mk.map((k) => [k.nama, App.db.absen.filter(a => a.mk == k.id).length, " Sesi", Math.min(100, App.db.absen.filter(a => a.mk == k.id).length * 10)]))}</div>
        <div class="card"><div class="card-title">Rata-rata Nilai UTS</div>${renderBars(App.db.mk.map((k) => [k.nama, Math.round(App.db.nilai.filter(x => x.k == k.id).reduce((acc, x, _, arr) => acc + x.n / arr.length, 0)) || 0]))}</div>
      </div>
    `;
  }

  Object.assign(App, { renderBars, renderDashboard });
})(window.SiAkad);

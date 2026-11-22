// js/views/absensi.js
window.SiAkad = window.SiAkad || {};

(function(App) {
  function renderAbsensi() {
    const isMhs = App.S.role === "mahasiswa";
    const myId = App.S.me;
    
    // Filter data absen (jika mahasiswa, hanya miliknya)
    const list = [...App.db.absen].reverse().filter(a => !isMhs || a.m == myId);

    // Statistik Kehadiran Mahasiswa
    let mkStatsHtml = "";
    if (isMhs) {
      const stats = App.db.mk.map(k => {
        const hadir = list.filter(a => a.mk == k.id).length;
        const persen = Math.min(100, Math.round((hadir / 10) * 100));
        return { nama: k.nama, hadir, persen };
      });

      if (stats.length > 0) {
        mkStatsHtml = `
          <div class="card" style="padding:16px; margin-bottom:16px;">
            <div style="font-size:13px; font-weight:800; text-transform:uppercase; color:var(--mu); margin-bottom:12px; letter-spacing:0.5px;">📊 Ringkasan Kehadiran</div>
            <div style="display:flex; flex-direction:column; gap:12px;">
              ${stats.map(s => `
                <div style="display:flex; align-items:center; gap:10px;">
                  <div style="flex:1; font-size:12.5px; font-weight:600; color:var(--tx); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${App.escapeHtml(s.nama)}">
                    ${App.escapeHtml(s.nama)}
                  </div>
                  <div style="width:80px; height:6px; background:var(--bd); border-radius:4px; overflow:hidden; flex-shrink:0;">
                    <div style="height:100%; width:${s.persen}%; background:${s.persen >= 80 ? 'var(--ac)' : 'var(--pr)'}; border-radius:4px;"></div>
                  </div>
                  <div style="width:40px; text-align:right; font-size:12px; font-weight:800; color:${s.persen >= 80 ? 'var(--ac)' : 'var(--pr)'}; flex-shrink:0;">
                    ${s.persen}%
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        `;
      }
    }

    // HTML untuk Tabel (Hanya jika ada data)
    let tableHtml = "";
    if (list.length > 0) {
      tableHtml = `
        <table class="responsive-table">
          <thead>
            <tr>
              <th style="width:15%;">Tanggal</th>
              <th style="width:15%;">Jam</th>
              <th style="width:30%;">Mahasiswa</th>
              <th style="width:30%;">Mata Kuliah</th>
              <th style="width:10%;">Via</th>
            </tr>
          </thead>
          <tbody>
            ${list.map((a) => `
              <tr class="tr-abs">
                <td>
                  <span class="mobile-label">Tanggal</span>
                  <span style="font-weight:600;">${a.d}</span>
                </td>
                <td>
                  <span class="mobile-label">Jam</span>
                  <span class="tag" style="background:var(--bg); font-weight:800; color:var(--pr); border:1px solid var(--bd);">${a.w || '-'}</span>
                </td>
                <td>
                  <span class="mobile-label">Mahasiswa</span>
                  <span>${App.escapeHtml(App.getMhs(a.m).nama)}</span>
                </td>
                <td>
                  <span class="mobile-label">Mata Kuliah</span>
                  <span style="font-weight:600;">${App.escapeHtml(App.getMk(a.mk).nama)}</span>
                </td>
                <td>
                  <span class="mobile-label">Via</span>
                  <span class="tag" style="background:var(--pr-soft); color:var(--pr); border-color:var(--pr-bd);">${a.via}</span>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      `;
    }

    // HTML untuk Data Kosong (Di luar tabel agar aman di Mobile)
    let emptyHtml = "";
    if (list.length === 0) {
      emptyHtml = `
        <div style="padding: 40px 20px; text-align: center;">
          <div style="font-size: 40px; margin-bottom: 12px; opacity: 0.3;">📭</div>
          <div style="font-size: 14px; font-weight: 600; color: var(--mu);">Belum ada data kehadiran.</div>
        </div>
      `;
    }

    return `
      ${!isMhs ? `
      <div class="card" style="margin-bottom:16px;">
        <b>Catat Kehadiran Manual (Dosen/Admin)</b>
        <div class="row" style="margin-top:8px">
          <select id="am" style="flex:1;margin:0">
            ${App.db.mhs.map((m) => `<option value="${m.id}">${App.escapeHtml(m.nama)}</option>`).join("")}
          </select>
          <select id="ak" style="flex:1;margin:0">
            ${App.db.mk.map((k) => `<option value="${k.id}">${App.escapeHtml(k.nama)}</option>`).join("")}
          </select>
          <button class="btn" onclick="submitManualAbsen()">Hadir</button>
        </div>
      </div>` : ""}

      ${isMhs ? `
        <div class="card" style="border-left:4px solid var(--pr); background:var(--pr-soft); padding:12px 16px; margin-bottom:16px; display:flex; align-items:flex-start; gap:10px;">
          <div style="font-size:18px;">ℹ️</div>
          <div style="font-size:12px; color:var(--tx-sec); line-height:1.5;">
            Kehadiran otomatis tercatat saat Anda klik <b>Gabung Zoom</b> atau <b>Tonton YouTube</b> di Beranda.
          </div>
        </div>
        ${mkStatsHtml}
      ` : ""}

      <div class="card" style="padding:0; overflow:hidden; margin-bottom:20px; border:1px solid var(--bd);">
        <div style="padding:16px; border-bottom:1px solid var(--bd); background:var(--bg);">
          <div style="font-size:14px; font-weight:800; color:var(--tx);">${isMhs ? "Riwayat Kehadiran Saya" : "Riwayat Kehadiran Global"}</div>
        </div>
        
        ${tableHtml}
        ${emptyHtml}

      </div>
    `;
  }

  function submitManualAbsen() {
    const am = document.getElementById("am");
    const ak = document.getElementById("ak");
    if (!am || !ak) return;
    markAbsen(+am.value, +ak.value, "Manual", true);
    App.renderApp();
  }

  function markAbsen(mhsId, mkId, via, showMsg = false) {
    if (!mhsId || !mkId) return false;
    const tgl = App.today();
    const jam = App.timeNow();
    const sudahHadir = App.db.absen.some((a) => a.m == mhsId && a.mk == mkId && a.d == tgl);

    if (sudahHadir) {
      if (showMsg) alert("Sudah tercatat hadir hari ini.");
      return false;
    }
    
    App.db.absen.push({ m: mhsId, mk: mkId, d: tgl, w: jam, via });
    App.saveData();
    return true;
  }

  function openZoom(mkId) {
    markAbsen(+App.S.me, mkId, "Zoom");
    const course = App.getMk(mkId);
    if (course.zoom) window.open(course.zoom, "_blank", "noopener");
    App.renderApp();
  }

  function openYouTube(mkId) {
    const ok = markAbsen(+App.S.me, mkId, "YouTube");
    const course = App.getMk(mkId);
    if (course.yt) window.open(course.yt, "_blank", "noopener");
    alert(ok ? "Absen tercatat!" : "Absen sudah tercatat.");
    App.renderApp();
  }

  Object.assign(App, { renderAbsensi, submitManualAbsen, markAbsen, openZoom, openYouTube });
})(window.SiAkad);
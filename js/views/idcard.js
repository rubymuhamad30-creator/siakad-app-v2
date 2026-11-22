// js/views/idcard.js
window.SiAkad = window.SiAkad || {};

(function(App) {
  function renderIdCard() {
    const isMhs = App.S.role === "mahasiswa";
    // Jika mahasiswa, filter hanya dirinya. Jika admin, tampilkan semua.
    const listMhs = isMhs ? App.db.mhs.filter(m => m.id == App.S.me) : App.db.mhs;

    return `
      <div class="noprint row" style="margin-bottom:16px">
        <button class="btn" onclick="window.print()">🖨️ Cetak ID Card</button>
      </div>
      
      <div class="row" style="align-items:flex-start;gap:20px;flex-wrap:wrap">
        ${listMhs.map((m) => `
          <div class="idc">
            ${m.foto ? `<img src="${m.foto}" class="mhs-pic" alt="Foto">` : `<div class="ph">👤</div>`}
            <div style="flex:1">
              <div class="row" style="gap:8px;align-items:center;margin-bottom:6px">
                <img src="${App.LOGO}" class="idc-logo" alt="Logo">
                <div class="idc-header">KARTU MAHASISWA</div>
              </div>
              <div class="idc-name">${App.escapeHtml(m.nama)}</div>
              <div class="idc-nim">NIM. ${App.escapeHtml(m.nim)}</div>
              <div class="idc-footer">Orang Tua: ${App.escapeHtml(m.ortu)}<br><b>${App.escapeHtml(App.db.inst)}</b></div>
            </div>
          </div>
        `).join("")}
      </div>
    `;
  }
  Object.assign(App, { renderIdCard });
})(window.SiAkad);
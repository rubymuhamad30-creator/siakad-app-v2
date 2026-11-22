// js/views/pengaturan.js
window.SiAkad = window.SiAkad || {};

(function(App) {
  function renderPengaturan() {
    return `
      <div class="card">
        <label>Nama Lembaga / Kampus</label>
        <input value="${App.escapeHtml(App.db.inst)}" onchange="updateInstitution(this.value)">

        <label>Tema Tampilan</label>
        <select onchange="changeTheme(this.value)">
          ${[["auto", "Ikuti sistem"], ["light", "Terang"], ["dark", "Gelap"]].map((t) => `
            <option value="${t[0]}" ${App.db.th == t[0] ? "selected" : ""}>${t[1]}</option>
          `).join("")}
        </select>

        <label>Bahasa Aplikasi (Simulasi)</label>
        <select onchange="changeLanguage(this.value)">
          <option value="id" ${App.db.lang !== 'en' ? 'selected' : ''}>Bahasa Indonesia</option>
          <option value="en" ${App.db.lang === 'en' ? 'selected' : ''}>English</option>
        </select>
      </div>

      <div class="card">
        <b>Backup & Pemulihan Data</b>
        <p style="font-size:13px;color:var(--mu);margin:6px 0 10px">Simpan salinan data lokal Anda dalam format JSON.</p>
        <div class="row" style="margin-top:8px">
          <button class="btn" onclick="backupData()">⬇️ Unduh backup (JSON)</button>
          <input type="file" accept=".json" onchange="restoreData(this)" style="flex:1">
        </div>
        <hr style="border:0;border-top:1px solid var(--bd);margin:16px 0 12px">
        <button class="btn d" onclick="resetData()">Reset Semua Data</button>
      </div>
    `;
  }

  function updateInstitution(val) { App.db.inst = val; App.saveData(); }
  function changeTheme(val) { App.db.th = val; App.saveData(); App.renderApp(); }
  function changeLanguage(val) {
    App.db.lang = val; App.saveData();
    alert("Bahasa diubah ke: " + (val === 'en' ? 'English' : 'Indonesia') + "\n(Catatan: Teks antarmuka utama masih menggunakan Bahasa Indonesia pada mode demo ini).");
  }

  function backupData() {
    const a = document.createElement("a");
    a.href = "data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(App.db, null, 2));
    a.download = "siakad-backup-" + App.today() + ".json"; a.click();
  }

  function restoreData(inputEl) {
    const file = inputEl.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data.mhs || !data.mk) throw new Error("Format salah");
        App.setDb(data); App.renderApp(); alert("Data dipulihkan!");
      } catch (e) { alert("File backup tidak valid."); }
    };
    reader.readAsText(file);
  }

  function resetData() {
    if (confirm("Hapus semua data dan kembali ke awal?")) { App.setDb(App.seed()); App.renderApp(); }
  }

  Object.assign(App, { renderPengaturan, updateInstitution, changeTheme, changeLanguage, backupData, restoreData, resetData });
})(window.SiAkad);
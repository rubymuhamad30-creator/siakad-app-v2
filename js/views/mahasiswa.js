// js/views/mahasiswa.js
window.SiAkad = window.SiAkad || {};

(function(App) {
  function renderMahasiswa() {
    const query = App.S.q.toLowerCase();
    
    // Filter berdasarkan Nama atau NIM
    const list = App.db.mhs.filter((m) => 
      (m.nama + " " + m.nim + " " + m.email).toLowerCase().includes(query)
    );

    return `
      <div class="card" style="display:flex; justify-content:space-between; align-items:center;">
        <div>
          <b style="font-size:16px;">Daftar Mahasiswa</b>
          <div style="font-size:13px; color:var(--mu);">Menampilkan ${list.length} dari ${App.db.mhs.length} mahasiswa</div>
        </div>
        <button class="btn" onclick="openMhsForm()">+ Tambah Mahasiswa</button>
      </div>

      ${App.S.edit ? mhsForm() : ""}
      
      <div class="card tw" style="padding:0; overflow:hidden;">
        <table style="min-width:100%;">
          <thead>
            <tr>
              <th>No. Mahasiswa</th>
              <th>Nama</th>
              <th>Email</th>
              <th>Orang Tua</th>
              <th style="text-align:right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${list.length ? list.map((m) => `
              <tr>
                <td><span class="tag" style="background:var(--bg)">${App.escapeHtml(m.nim)}</span></td>
                <td><b>${App.escapeHtml(m.nama)}</b></td>
                <td>${App.escapeHtml(m.email)}</td>
                <td>${App.escapeHtml(m.ortu)}</td>
                <td style="text-align:right;">
                  <button class="btn g s" onclick="editMhs(${m.id})" title="Edit">✏️</button>
                  <button class="btn d s" onclick="delMhs(${m.id})" title="Hapus">🗑️</button>
                </td>
              </tr>
            `).join("") : `
              <tr>
                <td colspan="5" style="text-align:center; padding:30px; color:var(--mu);">
                  <div style="font-size:30px; margin-bottom:10px;">🔍</div>
                  Data mahasiswa tidak ditemukan.
                </td>
              </tr>
            `}
          </tbody>
        </table>
      </div>
    `;
  }

  function openMhsForm() { App.S.edit = {}; App.renderApp(); }
  function editMhs(id) { App.S.edit = App.db.mhs.find((x) => x.id == id); App.renderApp(); }
  function cancelMhsForm() { App.S.edit = null; App.renderApp(); }

  function mhsForm() {
    const m = App.S.edit || {};
    return `
      <div class="card" style="background:var(--bg); border-left:4px solid var(--ac);">
        <b style="color:var(--ac);">${m.id ? "✏️ Edit" : "➕ Tambah"} Mahasiswa</b>
        <div class="grid">
          <div><label>Nama</label><input id="fn" value="${App.escapeHtml(m.nama)}"></div>
          <div><label>Nomor Mahasiswa</label><input id="fi" value="${App.escapeHtml(m.nim)}"></div>
          <div><label>Email</label><input id="fe" value="${App.escapeHtml(m.email)}"></div>
          <div><label>Nama Orang Tua</label><input id="fo" value="${App.escapeHtml(m.ortu)}"></div>
        </div>
        <label>Foto (Opsional)</label><input type="file" accept="image/*" id="ff">
        <div class="row" style="margin-top:8px">
          <button class="btn" onclick="saveMhs()">Simpan</button>
          <button class="btn g" onclick="cancelMhsForm()">Batal</button>
        </div>
      </div>
    `;
  }

  function saveMhs() {
    const val = (id) => document.getElementById(id).value.trim();
    const nama = val("fn"), nim = val("fi");
    if (!nama || !nim) return alert("Nama dan NIM wajib diisi");

    const finalize = (fotoUrl) => {
      const o = App.S.edit;
      const data = { nama, nim, email: val("fe"), ortu: val("fo"), foto: fotoUrl || o.foto || "" };
      if (o.id) Object.assign(o, data); else App.db.mhs.push({ id: App.nextId(App.db.mhs), ...data });
      App.saveData(); App.S.edit = null; App.renderApp();
    };

    const file = document.getElementById("ff")?.files[0];
    if (!file) return finalize();

    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const c = document.createElement("canvas"); c.width = 220; c.height = 275;
        const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0, 220, 275);
        finalize(c.toDataURL("image/jpeg", 0.8));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function delMhs(id) { 
    if (confirm("Hapus mahasiswa ini?")) { 
      App.db.mhs = App.db.mhs.filter((m) => m.id != id); 
      App.saveData(); App.renderApp(); 
    } 
  }

  Object.assign(App, { renderMahasiswa, openMhsForm, editMhs, cancelMhsForm, mhsForm, saveMhs, delMhs });
})(window.SiAkad);
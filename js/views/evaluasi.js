// js/views/evaluasi.js
window.SiAkad = window.SiAkad || {};

(function(App) {
  function renderEvaluasi() {
    const isMhs = App.S.role === "mahasiswa";

    return `
      ${!isMhs ? `
      <div class="card">
        <div class="card-title">⚙️ Pengaturan Link Google Form UTS</div>
        <p style="font-size:13px;color:var(--mu);margin-bottom:10px">Masukkan link Google Form untuk masing-masing mata kuliah.</p>
        ${App.db.mk.map((k) => `
          <div class="row" style="margin-bottom:8px">
            <div style="flex:1;font-weight:600;font-size:14px">${App.escapeHtml(k.nama)}</div>
            <input type="url" id="gf-${k.id}" value="${App.escapeHtml(k.gform || "")}" placeholder="https://forms.gle/..." style="flex:2;margin:0">
            <button class="btn s" onclick="saveGForm(${k.id})">Simpan Link</button>
          </div>
        `).join("")}
      </div>` : ""}

      <div class="card">
        <div class="card-title">📝 Evaluasi & Ujian Tengah Semester (UTS)</div>
        <div class="grid">
          ${App.db.mk.map((k) => {
            const link = k.gform ? `<a href="${k.gform}" target="_blank" class="btn ok" style="width:100%;text-decoration:none;margin-bottom:8px">🔗 Buka Soal UTS (Google Form)</a>` : `<button class="btn g" style="width:100%;margin-bottom:8px" disabled>Link UTS belum tersedia</button>`;
            const mhsId = App.S.me;
            const uploadedFile = k.utFiles && k.utFiles[mhsId] ? k.utFiles[mhsId] : null;
            const fileStatus = uploadedFile ? `<div style="font-size:12px;color:var(--ac);margin-bottom:6px">✅ Sudah upload: <b>${App.escapeHtml(uploadedFile.n)}</b></div>` : `<div style="font-size:12px;color:var(--mu);margin-bottom:6px">Belum ada file rekaman/tugas.</div>`;
            
            // Jika yang login bukan mahasiswa, sembunyikan fitur upload
            const uploadSection = isMhs ? `
                <hr style="border:0;border-top:1px solid var(--bd);margin:12px 0">
                <div style="font-size:12px;font-weight:600;margin-bottom:4px;color:var(--tx-sec)">Upload Rekaman / Tugas UTS:</div>
                ${fileStatus}
                <input type="file" id="uf-${k.id}" style="font-size:12px;padding:6px">
                <button class="btn s" style="width:100%;margin-top:6px" onclick="uploadUtFile(${k.id})">⬆️ Kirim File</button>
            ` : "";

            return `
              <div style="border:1px solid var(--bd);border-radius:var(--radius);padding:16px;background:var(--bg)">
                <b style="display:block;margin-bottom:10px;font-size:15px">${App.escapeHtml(k.nama)}</b>
                ${link}
                ${uploadSection}
              </div>
            `;
          }).join("")}
        </div>
      </div>

      ${!isMhs ? `
      <div class="card">
        <div class="card-title">💯 Input Nilai Ujian</div>
        <div class="row">
          <select id="nm" style="flex:1;margin:0">${App.db.mhs.map((m) => `<option value="${m.id}">${App.escapeHtml(m.nama)}</option>`).join("")}</select>
          <select id="nk" style="flex:1;margin:0">${App.db.mk.map((k) => `<option value="${k.id}">${App.escapeHtml(k.nama)}</option>`).join("")}</select>
          <input id="nn" type="number" min="0" max="100" placeholder="Nilai" style="width:100px;margin:0">
          <button class="btn" onclick="addNilai()">Simpan</button>
        </div>
      </div>
      <div class="card tw">
        <table>
          <thead><tr><th>Mahasiswa</th><th>Mata Kuliah</th><th>Nilai</th><th>Huruf Mutu</th></tr></thead>
          <tbody>
            ${App.db.nilai.map((n) => `
              <tr>
                <td>${App.escapeHtml(App.getMhs(n.m).nama)}</td>
                <td>${App.escapeHtml(App.getMk(n.k).nama)}</td>
                <td><b>${n.n}</b></td>
                <td><span class="tag">${App.calculateGrade(n.n)}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>` : ""}
    `;
  }

  function saveGForm(mkId) {
    const input = document.getElementById("gf-" + mkId);
    if (!input) return;
    const course = App.getMk(mkId);
    if (course.id) { course.gform = input.value.trim(); App.saveData(); alert("Link disimpan!"); App.renderApp(); }
  }

  function uploadUtFile(mkId) {
    const input = document.getElementById("uf-" + mkId);
    if (!input || !input.files[0]) return alert("Pilih file!");
    const file = input.files[0];
    const course = App.getMk(mkId);
    if (!course.utFiles) course.utFiles = {};
    course.utFiles[App.S.me] = { n: file.name, s: (file.size / 1024 / 1024).toFixed(2) + " MB", d: App.today() };
    App.addNotification("Tugas UTS diunggah oleh " + App.getMhs(App.S.me).nama);
    App.saveData(); alert("File berhasil dicatat!"); App.renderApp();
  }

  function addNilai() {
    const nn = document.getElementById("nn"), nm = document.getElementById("nm"), nk = document.getElementById("nk");
    if (!nn || isNaN(+nn.value) || nn.value.trim() === "") return alert("Nilai valid (0-100)");
    const mhsId = +nm.value, mkId = +nk.value, score = +nn.value;
    const existing = App.db.nilai.find((x) => x.m == mhsId && x.k == mkId);
    if (existing) existing.n = score; else App.db.nilai.push({ m: mhsId, k: mkId, n: score });
    App.saveData(); App.renderApp();
  }

  Object.assign(App, { renderEvaluasi, saveGForm, uploadUtFile, addNilai });
})(window.SiAkad);
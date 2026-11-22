// js/views/matakuliah.js
window.SiAkad = window.SiAkad || {};

(function(App) {
  function renderMataKuliah() {
    const f = App.S.edit;
    const query = App.S.q.toLowerCase();

    // Filter Mata Kuliah berdasarkan pencarian
    const filteredMk = App.db.mk.filter(k => 
      k.nama.toLowerCase().includes(query) || k.dosen.toLowerCase().includes(query)
    );

    return `
      <div class="card" style="display:flex; justify-content:space-between; align-items:center; border-left:4px solid var(--pr); flex-wrap:wrap; gap:10px;">
        <div>
          <b style="font-size:16px;">🛠️ Panel Pengelolaan Mata Kuliah</b>
          <div style="font-size:13px; color:var(--mu); margin-top:4px;">Kelola data kelas, jadwal, tautan Zoom, dan materi.</div>
        </div>
        <button class="btn" onclick="openMkForm()">+ Tambah MK</button>
      </div>

      ${f ? mkForm() : ""}
      
      <div class="card tw" style="padding:0; overflow:hidden;">
        <table class="responsive-table" style="min-width:100%;">
          <thead>
            <tr>
              <th style="width:30%;">Mata Kuliah & Dosen</th>
              <th style="width:20%;">Jadwal</th>
              <th style="width:20%;">Tautan Kelas</th>
              <th style="width:10%;">Materi</th>
              <th style="width:20%; text-align:right;">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${filteredMk.length ? filteredMk.map((k) => `
                <tr class="tr-mk">
                  <td>
                    <div style="font-weight:700; font-size:14px; color:var(--tx);">${App.escapeHtml(k.nama)}</div>
                    <div style="font-size:12px; color:var(--mu); margin-top:2px;">${App.escapeHtml(k.dosen)}</div>
                  </td>
                  <td>
                    <span class="tag" style="background:var(--bg); font-weight:600;">${k.jadwal ? App.escapeHtml(k.jadwal) : 'Belum diatur'}</span>
                  </td>
                  <td>
                    <div style="display:flex; flex-direction:column; gap:4px;">
                      <span style="font-size:11px; font-weight:600; color:${k.zoom ? 'var(--ac)' : 'var(--mu)'}">${k.zoom ? '✅ Zoom Siap' : '❌ Zoom Kosong'}</span>
                      <span style="font-size:11px; font-weight:600; color:${k.yt ? 'var(--ac)' : 'var(--mu)'}">${k.yt ? '✅ YouTube Siap' : '❌ YouTube Kosong'}</span>
                    </div>
                  </td>
                  <td>
                    <button class="btn g s" style="font-size:11px; padding:4px 8px;" onclick="toggleFiles(${k.id})">
                      📁 ${k.files ? k.files.length : 0} File
                    </button>
                  </td>
                  <td class="td-aksi">
                    <button class="btn g s" onclick="editMk(${k.id})" title="Edit MK">✏️</button>
                    <button class="btn d s" onclick="delMk(${k.id})" title="Hapus MK">🗑️</button>
                  </td>
                </tr>
                ${App.S.mkx == k.id ? `
                  <tr style="background:var(--bg);">
                    <td colspan="5" style="padding:0;">${renderFilesSection(k)}</td>
                  </tr>
                ` : ""}
            `).join("") : `
              <tr><td colspan="5" style="text-align:center; padding:30px; color:var(--mu);">Mata kuliah tidak ditemukan.</td></tr>
            `}
          </tbody>
        </table>
      </div>
    `;
  }

  // Bagian Kelola File
  function renderFilesSection(k) {
    const files = k.files || [];
    return `
      <div style="padding:16px 20px; border-left:4px solid var(--ac);">
        <b style="font-size:12px; text-transform:uppercase; color:var(--mu); margin-bottom:10px; display:block;">Daftar Materi: ${App.escapeHtml(k.nama)}</b>
        <div style="display:grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap:10px; margin-bottom:16px;">
          ${files.length ? files.map((x, i) => `
            <div style="background:var(--card); border:1px solid var(--bd); padding:8px 12px; border-radius:var(--radius-sm); display:flex; justify-content:space-between; align-items:center;">
              <div style="font-size:12px;">
                ${x.t == "folder" ? "📁" : "📄"} <span style="font-weight:600;">${App.escapeHtml(x.n)}</span>
              </div>
              <button class="btn d s" style="padding:2px 6px; font-size:10px;" onclick="delFile(${k.id}, ${i})">×</button>
            </div>
          `).join("") : `<div style="font-size:12px; color:var(--mu); font-style:italic;">Belum ada materi.</div>`}
        </div>
        <div class="row">
          <input type="file" id="fl" multiple style="flex:1; font-size:12px; margin:0; padding:6px;">
          <button class="btn s" onclick="addFile(${k.id})">Unggah Materi</button>
        </div>
      </div>
    `;
  }

  // Modal Detail MK (untuk Mahasiswa)
  function openMkDetail(id) {
    const k = App.getMk(id); const myId = App.S.me; if (!k.id) return;
    const hadir = App.db.absen.filter(a => a.mk == k.id && a.m == myId).length;
    const persen = Math.min(100, Math.round((hadir / 10) * 100));
    const isLayak = persen >= 80;

    const modal = document.createElement("div");
    modal.id = "mk-modal";
    modal.style = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:9999;padding:20px;backdrop-filter:blur(3px);";
    modal.innerHTML = `
      <div style="background:var(--card);width:100%;max-width:500px;border-radius:var(--radius-lg);box-shadow:var(--sh-lg);overflow:hidden; animation: slideUp 0.3s ease;">
        <div style="background:linear-gradient(135deg, var(--pr-soft), var(--card)); padding:20px; border-bottom:1px solid var(--bd); position:relative;">
          <button onclick="document.getElementById('mk-modal').remove()" style="position:absolute;top:15px;right:15px;background:none;border:0;font-size:20px;cursor:pointer;color:var(--mu);">✖</button>
          <div style="width:40px;height:40px;background:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;margin-bottom:10px;box-shadow:var(--sh-sm)">📖</div>
          <h3 style="margin:0;font-size:18px;color:var(--tx)">${App.escapeHtml(k.nama)}</h3>
          <div style="font-size:13px;color:var(--tx-sec);margin-top:4px">${App.escapeHtml(k.dosen)}</div>
          <div style="font-size:12px;color:var(--pr);margin-top:6px;font-weight:600;">🕒 ${k.jadwal || 'Jadwal belum diatur'}</div>
        </div>
        <div style="padding:20px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;background:${isLayak ? 'var(--ac-soft)' : 'var(--pr-soft)'};padding:10px 14px;border-radius:var(--radius);border:1px solid ${isLayak ? 'var(--ac-bd)' : 'var(--pr-bd)'}">
            <div style="font-size:13px;font-weight:600;color:${isLayak ? 'var(--ac)' : 'var(--pr)'}">Kehadiran: ${persen}%</div>
            ${isLayak ? '<span style="font-size:11px;color:var(--ac)">✅ Memenuhi Syarat</span>' : '<span style="font-size:11px;color:var(--pr)">⚠️ Minimal 80%</span>'}
          </div>
          <div style="display:flex;flex-direction:column;gap:10px;margin-bottom:20px;">
            <button class="btn" ${k.zoom ? "" : "disabled"} onclick="openZoom(${k.id}); document.getElementById('mk-modal').remove();">🎥 Gabung Zoom</button>
            <button class="btn g" ${k.yt ? "" : "disabled"} onclick="openYouTube(${k.id}); document.getElementById('mk-modal').remove();">▶️ Tonton YouTube (Absen)</button>
          </div>
          <div>
            <div style="font-size:12px;font-weight:700;color:var(--mu);text-transform:uppercase;margin-bottom:8px">Materi</div>
            ${(k.files && k.files.length > 0) ? k.files.map((f, i) => `
              <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px dashed var(--bd);">
                <span style="font-size:13px;">${f.t === 'folder' ? '📁' : '📄'} ${App.escapeHtml(f.n)}</span>
              </div>
            `).join("") : `<p style="font-size:13px;color:var(--mu);font-style:italic;">Belum ada materi.</p>`}
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.remove(); });
  }

  function openMkForm() { App.S.edit = {}; App.renderApp(); }
  function editMk(id) { App.S.edit = App.db.mk.find((x) => x.id == id); App.renderApp(); }
  function toggleFiles(id) { App.S.mkx = App.S.mkx == id ? null : id; App.renderApp(); }
  function cancelMkForm() { App.S.edit = null; App.renderApp(); }

  // FORM TAMBAH/EDIT MK (DENGAN INPUT JADWAL)
  function mkForm() {
    const k = App.S.edit || {};
    return `
      <div class="card" style="background:var(--bg); border-left:4px solid var(--ac);">
        <b style="display:block; margin-bottom:10px; color:var(--ac);">${k.id ? "✏️ Edit" : "➕ Tambah"} Mata Kuliah</b>
        <div class="grid">
          <div><label>Nama MK</label><input id="kn" value="${App.escapeHtml(k.nama)}"></div>
          <div><label>Dosen</label><input id="kd" value="${App.escapeHtml(k.dosen)}"></div>
          
          <div>
            <label>Jadwal Kuliah (Hari, Jam Mulai-Selesai)</label>
            <input id="kj" value="${App.escapeHtml(k.jadwal || '')}" placeholder="Contoh: Senin, 08:00-09:30">
          </div>
          
          <div><label>Link Zoom</label><input id="kz" value="${App.escapeHtml(k.zoom)}"></div>
          <div><label>Link YouTube</label><input id="ky" value="${App.escapeHtml(k.yt)}"></div>
        </div>
        <div class="row" style="margin-top:6px">
          <button class="btn" onclick="saveMk()">Simpan</button>
          <button class="btn g" onclick="cancelMkForm()">Batal</button>
        </div>
      </div>
    `;
  }

  // FUNGSI SIMPAN MK (MENYERTAKAN JADWAL)
  function saveMk() {
    const val = (id) => document.getElementById(id).value.trim();
    const nama = val("kn"); if (!nama) return alert("Nama MK wajib diisi");
    const o = App.S.edit;
    
    const data = { 
      nama: nama, 
      dosen: val("kd"), 
      jadwal: val("kj"), 
      zoom: val("kz"), 
      yt: val("ky") 
    };
    
    if (o.id) Object.assign(o, data); 
    else App.db.mk.push({ id: App.nextId(App.db.mk), files: [], ...data });
    
    App.saveData(); App.S.edit = null; App.renderApp();
  }

  function delMk(id) { if (confirm("Hapus MK ini?")) { App.db.mk = App.db.mk.filter((k) => k.id != id); App.saveData(); App.renderApp(); } }
  function addFile(id) {
    const fileInput = document.getElementById("fl"); if (!fileInput) return;
    const files = [...fileInput.files];
    const course = App.getMk(id); if (!course.files) course.files = [];
    files.forEach((f) => course.files.push({ t: "file", n: f.name, ty: (f.name.split(".").pop() || "").toUpperCase() }));
    App.saveData(); alert("Materi diunggah!"); App.renderApp();
  }
  function delFile(id, index) { const c = App.getMk(id); if (c && c.files) { c.files.splice(index, 1); App.saveData(); App.renderApp(); } }

  Object.assign(App, { renderMataKuliah, openMkDetail, renderFilesSection, openMkForm, editMk, toggleFiles, mkForm, cancelMkForm, saveMk, delMk, addFile, delFile });
})(window.SiAkad);
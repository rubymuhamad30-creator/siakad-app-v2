// js/views/tilawah.js
window.SiAkad = window.SiAkad || {};

(function(App) {
  let mediaRecorder = null;
  let audioChunks = [];
  let activeStream = null;

  function stopRecordingIfAny() {
    if (mediaRecorder && mediaRecorder.state === "recording") { try { mediaRecorder.stop(); } catch (e) {} }
    if (activeStream) { activeStream.getTracks().forEach((t) => t.stop()); activeStream = null; }
    mediaRecorder = null;
  }

  function renderTilawah() {
    stopRecordingIfAny();
    const isMhs = App.S.role === "mahasiswa";
    const setorList = [...App.db.setor].reverse().filter(s => !isMhs || s.m == App.S.me);

    return `
      <div class="card">
        <b>Setoran Baru</b>
        <div class="grid" style="margin-top:8px">
          ${!isMhs ? `
          <div>
            <label>Mahasiswa</label>
            <select id="sm">${App.db.mhs.map((m) => `<option value="${m.id}">${App.escapeHtml(m.nama)}</option>`).join("")}</select>
          </div>` : `<input type="hidden" id="sm" value="${App.S.me}">`}
          
          <div><label>Jenis</label><select id="sj"><option>Tilawah</option><option>Khotmah</option></select></div>
          <div><label>Surat</label><select id="ss">${App.SURAH_LIST.map((s, i) => `<option value="${i + 1}">${i + 1}. ${s}</option>`).join("")}</select></div>
          <div><label>Juz</label><select id="sz">${Array.from({ length: 30 }, (_, i) => `<option>${i + 1}</option>`).join("")}</select></div>
          <div><label>Ayat (dari – sampai)</label><input id="sa" placeholder="Contoh: 1 - 7"></div>
        </div>

        <label style="display:block;margin-top:8px">Rekaman Suara</label>
        <div class="row">
          <button class="btn g" id="rb" onclick="toggleRecording()">🎙️ Mulai rekam</button>
          <audio id="au" controls style="display:none"></audio>
        </div>

        <b style="display:block;margin-top:14px">Penilaian Tajwid</b>
        <div class="grid">
          ${[["tj", "Hukum Tajwid"], ["mk", "Makhraj Huruf"], ["kl", "Kelancaran"]].map((x) => `
            <div>
              <label>${x[1]}: <span id="v${x[0]}">80</span></label>
              <input type="range" id="${x[0]}" min="0" max="100" value="80" ${isMhs ? 'disabled' : ''} oninput="document.getElementById('v${x[0]}').textContent=this.value">
            </div>
          `).join("")}
        </div>

        ${!isMhs ? `
        <label>Catatan Penguji</label>
        <textarea id="sc" rows="2" placeholder="Catatan..."></textarea>` : `<textarea id="sc" style="display:none"></textarea>`}
        
        <button class="btn" style="margin-top:10px" onclick="addSetor()">Simpan Setoran</button>
      </div>

      <div class="card tw">
        <table>
          <thead><tr><th>Tanggal</th><th>Mahasiswa</th><th>Jenis</th><th>Surat / Juz</th><th>Nilai (T/M/K)</th><th>Rata-rata</th></tr></thead>
          <tbody>
            ${setorList.map((s) => `
              <tr>
                <td>${s.d}</td>
                <td>${App.escapeHtml(App.getMhs(s.m).nama)}</td>
                <td>${s.j}</td>
                <td>${App.SURAH_LIST[s.s - 1] || "Surat #" + s.s} (${App.escapeHtml(s.a)}) / Juz ${s.z}</td>
                <td>${s.tj} / ${s.mk} / ${s.kl}</td>
                <td><span class="tag">${s.avg}</span></td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </div>
    `;
  }

  async function toggleRecording() {
    const btn = document.getElementById("rb");
    if (!btn) return;
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop(); btn.textContent = "🎙️ Mulai rekam"; return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      activeStream = stream; mediaRecorder = new MediaRecorder(stream); audioChunks = [];
      mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
      mediaRecorder.onstop = () => {
        const audio = document.getElementById("au");
        if (audio) { audio.src = URL.createObjectURL(new Blob(audioChunks)); audio.style.display = "block"; }
        if (activeStream) { activeStream.getTracks().forEach((t) => t.stop()); activeStream = null; }
      };
      mediaRecorder.start(); btn.textContent = "⏹️ Berhenti rekam";
    } catch (err) { alert("Mikrofon tidak dapat diakses."); }
  }

  function addSetor() {
    const getVal = (id) => document.getElementById(id) ? document.getElementById(id).value : "";
    const tj = +getVal("tj"), mk = +getVal("mk"), kl = +getVal("kl");
    const avg = Math.round((tj + mk + kl) / 3);
    const mhsId = +getVal("sm");

    App.db.setor.push({
      id: Date.now(), d: App.today(), m: mhsId, j: getVal("sj"),
      s: +getVal("ss"), z: +getVal("sz"), a: getVal("sa"),
      tj, mk, kl, avg, c: getVal("sc")
    });

    App.addNotification("Setoran baru: " + App.getMhs(mhsId).nama);
    App.saveData(); App.renderApp();
  }

  Object.assign(App, { renderTilawah, toggleRecording, addSetor });
})(window.SiAkad);
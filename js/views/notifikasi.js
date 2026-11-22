// js/views/notifikasi.js - Tampilan notifikasi aktivitas
window.SiAkad = window.SiAkad || {};

(function(App) {
  function renderNotifikasi() {
    return `
      <div class="card">
        <button class="btn g" onclick="markAllNotificationsRead()">Tandai semua dibaca</button>
      </div>
      ${App.db.notif.map((n) => `
        <div class="nt" style="${n.r ? "opacity:0.6" : ""}">
          ${App.escapeHtml(n.t)}<br>
          <small style="color:var(--mu)">${n.d}</small>
        </div>
      `).join("")}
    `;
  }

  function markAllNotificationsRead() {
    App.db.notif.forEach((n) => (n.r = 1));
    App.saveData();
    App.renderApp();
  }

  Object.assign(App, {
    renderNotifikasi,
    markAllNotificationsRead
  });
})(window.SiAkad);

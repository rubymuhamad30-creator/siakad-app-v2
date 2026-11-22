// js/views/login.js - Tampilan dan logika login (Multi-Role)
window.SiAkad = window.SiAkad || {};

(function(App) {
  function renderLogin() {
    return `
      <div class="login-wrapper">
        <div id="login-box">
          <div class="login-logo-container"><img src="${App.LOGO}" alt="Logo"></div>
          <div class="login-title">SiAkad</div>
          <div class="login-subtitle">Sistem Pembelajaran Akademi Nurul Bayan</div>

          <div class="login-form">
            <label>Email</label>
            <input id="le" type="email" value="admin@siakad.id" placeholder="admin@siakad.id / ahmad@mail.com / abdullah@siakad.id">
            <label>Kata sandi</label>
            <input id="lp" type="password" value="admin123">
            <button class="btn login-btn" onclick="doLogin()">Masuk</button>
          </div>

          <p class="login-footer-note" style="margin-top:15px;text-align:left;">
            <b>Mode Demo (Gunakan Email Ini):</b><br>
            Admin: <code>admin@siakad.id</code><br>
            Dosen: <code>abdullah@siakad.id</code><br>
            Mhs: <code>ahmad@mail.com</code>
          </p>
        </div>
      </div>
    `;
  }

  function doLogin() {
    const email = document.getElementById("le").value.trim().toLowerCase();
    
    // 1. Cek Admin
    if (email === "admin@siakad.id") {
      App.S.logged = true;
      App.S.role = "admin";
      App.S.me = "admin";
    } 
    // 2. Cek Dosen
    else if (App.db.dosen && App.db.dosen.find(d => d.email.toLowerCase() === email)) {
      const dosen = App.db.dosen.find(d => d.email.toLowerCase() === email);
      App.S.logged = true;
      App.S.role = "dosen";
      App.S.me = dosen.id;
    }
    // 3. Cek Mahasiswa
    else if (App.db.mhs.find(m => m.email.toLowerCase() === email)) {
      const mhs = App.db.mhs.find(m => m.email.toLowerCase() === email);
      App.S.logged = true;
      App.S.role = "mahasiswa";
      App.S.me = mhs.id;
    } 
    // 4. Gagal
    else {
      alert("Email tidak dikenali! Gunakan email yang terdaftar (lihat petunjuk di bawah form).");
      return;
    }

    App.S.v = "dash";
    App.renderApp();
  }

  Object.assign(App, {
    renderLogin,
    doLogin
  });
})(window.SiAkad);
// auth.js — logika halaman login (index.html) dan register (register.html)
// File ini dipakai di kedua halaman; script hanya jalan untuk form yang memang ada di halaman itu.

document.addEventListener('DOMContentLoaded', () => {
  if (getToken()) {
    window.location.href = 'cuaca.html';
    return;
  }

  const msg = document.getElementById('auth-msg');
  function showMsg(text, type) {
    msg.textContent = text;
    msg.className = `msg show ${type}`;
  }
  function hideMsg() { msg.className = 'msg'; }

  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideMsg();
      const btn = formLogin.querySelector('button[type="submit"]');
      const email = document.getElementById('login-email').value.trim();
      const password = document.getElementById('login-password').value;

      btn.disabled = true;
      btn.innerHTML = '<span class="loader"></span>Masuk...';
      try {
        const data = await apiFetch('/login', {
          method: 'POST',
          body: JSON.stringify({ email, password })
        });
        setToken(data.token);
        setUser(data.user);
        window.location.href = 'cuaca.html';
      } catch (err) {
        showMsg(err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Masuk';
      }
    });
  }

  const formRegister = document.getElementById('form-register');
  if (formRegister) {
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideMsg();
      const btn = formRegister.querySelector('button[type="submit"]');
      const nama = document.getElementById('reg-nama').value.trim();
      const email = document.getElementById('reg-email').value.trim();
      const password = document.getElementById('reg-password').value;

      btn.disabled = true;
      btn.innerHTML = '<span class="loader"></span>Mendaftar...';
      try {
        await apiFetch('/register', {
          method: 'POST',
          body: JSON.stringify({ nama, email, password })
        });
        showMsg('Registrasi berhasil! Mengarahkan ke halaman masuk...', 'ok');
        setTimeout(() => { window.location.href = 'index.html'; }, 1200);
      } catch (err) {
        showMsg(err.message, 'error');
        btn.disabled = false;
        btn.textContent = 'Daftar';
      }
    });
  }
});

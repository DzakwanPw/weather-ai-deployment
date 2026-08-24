// auth.js — logika halaman login & register

document.addEventListener('DOMContentLoaded', () => {
  // Kalau sudah login, langsung lempar ke halaman cuaca
  if (getToken()) {
    window.location.href = 'cuaca.html';
    return;
  }

  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const msg = document.getElementById('auth-msg');

  function showTab(which) {
    const isLogin = which === 'login';
    tabLogin.classList.toggle('active', isLogin);
    tabRegister.classList.toggle('active', !isLogin);
    formLogin.style.display = isLogin ? 'block' : 'none';
    formRegister.style.display = isLogin ? 'none' : 'block';
    hideMsg();
  }
  tabLogin.addEventListener('click', () => showTab('login'));
  tabRegister.addEventListener('click', () => showTab('register'));

  function showMsg(text, type) {
    msg.textContent = text;
    msg.className = `msg show ${type}`;
  }
  function hideMsg() {
    msg.className = 'msg';
  }

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
      showMsg('Registrasi berhasil, silakan masuk.', 'ok');
      showTab('login');
      document.getElementById('login-email').value = email;
    } catch (err) {
      showMsg(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Daftar';
    }
  });
});

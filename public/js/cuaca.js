// cuaca.js — logika halaman cari cuaca

document.addEventListener('DOMContentLoaded', () => {
  requireAuth();
  greetUser();
  initLogoutButton();
  loadCityGlances();

  const form = document.getElementById('form-cuaca');
  const input = document.getElementById('kota-input');
  const msg = document.getElementById('cuaca-msg');
  const resultCard = document.getElementById('result-card');
  const btn = form.querySelector('button[type="submit"]');

  function showMsg(text, type) {
    msg.textContent = text;
    msg.className = `msg show ${type}`;
  }
  function hideMsg() { msg.className = 'msg'; }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMsg();
    resultCard.style.display = 'none';
    const kota = input.value.trim();
    if (!kota) return;

    btn.disabled = true;
    btn.innerHTML = '<span class="loader"></span>Mencari...';

    try {
      const res = await apiFetch('/cuaca', {
        method: 'POST',
        body: JSON.stringify({ kota })
      });
      renderResult(res.data);
    } catch (err) {
      showMsg(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Cari cuaca';
    }
  });

  function renderResult(log) {
    const cuaca = JSON.parse(log.data_cuaca);
    const glyph = weatherGlyph(cuaca.description || '');

    document.getElementById('res-glyph').textContent = glyph;
    document.getElementById('res-kota').textContent = log.kota;
    document.getElementById('res-temp').textContent = `${Math.round(cuaca.temp)}°C`;
    document.getElementById('res-desc').textContent = cuaca.description || '-';
    document.getElementById('res-feels').textContent = `${Math.round(cuaca.feels_like)}°C`;
    document.getElementById('res-humidity').textContent = `${cuaca.humidity}%`;
    document.getElementById('res-pressure').textContent = `${cuaca.pressure} hPa`;
    document.getElementById('res-ai').innerHTML = renderMarkdownLite(log.respon_ai);

    resultCard.style.display = 'block';
  }

  async function loadCityGlances() {
    const cards = document.querySelectorAll('.city-card[data-city]');
    for (const card of cards) {
      const kota = card.dataset.city;
      try {
        const res = await apiFetch(`/cuaca/preview?kota=${encodeURIComponent(kota)}`, { method: 'GET' });
        const glyph = weatherGlyph(res.data.description || '');
        card.querySelector('.glyph').textContent = glyph;
        card.querySelector('.temp').textContent = `${Math.round(res.data.temp)}°C`;
      } catch (err) {
        card.querySelector('.temp').textContent = '-';
      }
    }
  }
});

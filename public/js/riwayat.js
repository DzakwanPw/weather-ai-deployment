// riwayat.js — logika halaman riwayat pencarian

document.addEventListener('DOMContentLoaded', async () => {
  requireAuth();
  greetUser();
  initLogoutButton();

  const list = document.getElementById('riwayat-list');
  const empty = document.getElementById('riwayat-empty');
  const loading = document.getElementById('riwayat-loading');

  try {
    const res = await apiFetch('/cuaca', { method: 'GET' });
    loading.style.display = 'none';

    const logs = res.data || [];
    if (logs.length === 0) {
      empty.style.display = 'block';
      return;
    }

    logs.forEach(log => {
      const cuaca = JSON.parse(log.data_cuaca);
      const glyph = weatherGlyph(cuaca.description || '');

      const item = document.createElement('div');
      item.className = 'log-item';
      item.innerHTML = `
        <div class="glyph">${glyph}</div>
        <div class="info">
          <div class="kota">${log.kota} · ${Math.round(cuaca.temp)}°C</div>
          <div class="time">${formatTanggal(log.createdAt)}</div>
          <div class="snippet">${log.respon_ai}</div>
        </div>
      `;
      list.appendChild(item);
    });
  } catch (err) {
    loading.style.display = 'none';
    empty.style.display = 'block';
    empty.querySelector('.empty-text').textContent = err.message;
  }
});

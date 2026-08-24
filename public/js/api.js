// api.js — helper bersama untuk semua halaman

const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('wai_token');
}
function setToken(token) {
  localStorage.setItem('wai_token', token);
}
function getUser() {
  const raw = localStorage.getItem('wai_user');
  return raw ? JSON.parse(raw) : null;
}
function setUser(user) {
  localStorage.setItem('wai_user', JSON.stringify(user));
}
function clearSession() {
  localStorage.removeItem('wai_token');
  localStorage.removeItem('wai_user');
}
function requireAuth() {
  if (!getToken()) {
    window.location.href = 'index.html';
  }
}

async function apiFetch(path, options = {}) {
  const headers = Object.assign(
    { 'Content-Type': 'application/json' },
    options.headers || {}
  );
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, { ...options, headers });
  let data = null;
  try { data = await res.json(); } catch (e) { /* no body */ }

  if (res.status === 401) {
    clearSession();
    window.location.href = 'index.html';
    return null;
  }
  if (!res.ok) {
    const message = (data && data.message) || 'Terjadi kesalahan, coba lagi.';
    throw new Error(message);
  }
  return data;
}

// Mapping deskripsi cuaca (Bahasa Indonesia, dari OpenWeatherMap lang=id) ke glyph
function weatherGlyph(desc = '') {
  const d = desc.toLowerCase();
  if (d.includes('hujan petir') || d.includes('badai')) return '⛈️';
  if (d.includes('hujan')) return '🌧️';
  if (d.includes('gerimis')) return '🌦️';
  if (d.includes('salju')) return '❄️';
  if (d.includes('kabut') || d.includes('asap')) return '🌫️';
  if (d.includes('cerah') && d.includes('berawan')) return '⛅';
  if (d.includes('berawan') || d.includes('mendung')) return '☁️';
  if (d.includes('cerah')) return '☀️';
  return '🌤️';
}

function formatTanggal(iso) {
  const date = new Date(iso);
  return date.toLocaleString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

// Render markdown ringan dari respon AI: **tebal** dan poin "*" jadi bullet rapi
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
function renderMarkdownLite(str = '') {
  let s = escapeHtml(str);
  s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/\s\*\s/g, '<br>• ');
  s = s.replace(/\*(.+?)\*/g, '<em>$1</em>');
  return s;
}

function initLogoutButton() {
  const btn = document.querySelector('[data-logout]');
  if (!btn) return;
  btn.addEventListener('click', () => {
    clearSession();
    window.location.href = 'index.html';
  });
}

function greetUser() {
  const el = document.querySelector('[data-user-name]');
  const user = getUser();
  if (el && user) el.textContent = user.nama;
}

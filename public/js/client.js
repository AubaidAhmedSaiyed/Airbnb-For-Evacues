/* global window, document, fetch, localStorage */

window.Sheltr = window.Sheltr || {};

window.Sheltr.getToken = function getToken() {
  return localStorage.getItem('sheltr_token');
};

window.Sheltr.setToken = function setToken(token) {
  if (!token) localStorage.removeItem('sheltr_token');
  else localStorage.setItem('sheltr_token', token);
};

window.Sheltr.logout = function logout() {
  window.Sheltr.setToken('');
  window.location.href = '/';
};

window.Sheltr.apiFetch = async function apiFetch(path, options = {}) {
  const token = window.Sheltr.getToken();
  const headers = new Headers(options.headers || {});
  if (!headers.has('Content-Type') && options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const res = await fetch(path, { ...options, headers });
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message = (data && data.message) ? data.message : `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
};

window.Sheltr.formToJson = function formToJson(formEl) {
  const fd = new FormData(formEl);
  const obj = {};
  for (const [k, v] of fd.entries()) obj[k] = v;
  return obj;
};

window.Sheltr.toast = function toast(message, kind = 'info') {
  let el = document.getElementById('sheltr-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'sheltr-toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.style.background = kind === 'error' ? '#7d2e2e' : '#0b1b12';
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(window.__sheltrToastT);
  window.__sheltrToastT = setTimeout(() => el.classList.remove('show'), 2400);
};

window.Sheltr.applyNavAuthState = async function applyNavAuthState() {
  const token = window.Sheltr.getToken();
  const loggedOutEls = document.querySelectorAll('[data-auth="logged-out"]');
  const loggedInEls = document.querySelectorAll('[data-auth="logged-in"]');

  loggedOutEls.forEach(el => { el.style.display = token ? 'none' : ''; });
  loggedInEls.forEach(el => { el.style.display = token ? '' : 'none'; });

  const whoEl = document.querySelector('[data-whoami]');
  if (!whoEl) return;

  if (!token) {
    whoEl.textContent = 'Not logged in';
    return;
  }
  try {
    const me = await window.Sheltr.apiFetch('/api/users/me');
    whoEl.textContent = `${me.name} • ${me.role}`;

    // Role-gated nav links (host vs guest)
    const roleEls = document.querySelectorAll('[data-role]');
    roleEls.forEach(el => {
      const role = el.getAttribute('data-role');
      el.style.display = me.role === role ? '' : 'none';
    });
  } catch {
    whoEl.textContent = 'Session expired';
  }
};

window.addEventListener('DOMContentLoaded', () => {
  window.Sheltr.applyNavAuthState();
});


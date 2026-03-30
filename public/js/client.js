/* global window, document, fetch, localStorage */

window.Sheltr = window.Sheltr || {};

window.Sheltr.getToken = function getToken() {
  return localStorage.getItem('sheltr_token');
};

window.Sheltr.setToken = function setToken(token) {
  if (!token) localStorage.removeItem('sheltr_token');
  else localStorage.setItem('sheltr_token', token);
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


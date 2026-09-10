const API_BASE_URL = window.APP_CONFIG.backendUrl;

function apiUrl(path) {
  return /^https?:\/\//i.test(path) ? path : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

async function getJSON(url, options) {
  const response = await fetch(apiUrl(url), options);
  if (!response.ok) throw new Error(`Server returned ${response.status}`);
  return response.json();
}

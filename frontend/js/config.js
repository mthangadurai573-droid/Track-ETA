// Set window.__BACKEND_URL__ before this script to override the Render service URL.
window.APP_CONFIG = {
	backendUrl: (window.__BACKEND_URL__ || 'https://track-eta.onrender.com').replace(/\/$/, '')
};

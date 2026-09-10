const { ROUTES } = require('../data/routes');
const { tick } = require('./simulation.service');

const providerUrl = process.env.REALTIME_PROVIDER_URL || '';
const providerToken = process.env.REALTIME_PROVIDER_TOKEN || '';
const providerTimeoutMs = Number(process.env.REALTIME_PROVIDER_TIMEOUT_MS || 1500);
const cache = new Map();
let lastProviderError = '';

function providerEnabled() {
  return Boolean(providerUrl);
}

function providerStatus() {
  return {
    enabled: providerEnabled(),
    url_configured: providerEnabled(),
    last_error: lastProviderError || null
  };
}

function unwrapPayload(payload, trainNo) {
  if (payload?.data) payload = payload.data;
  if (Array.isArray(payload)) return payload.find(item => String(item.train_no || item.trainNumber || item.number) === String(trainNo)) || null;
  if (payload?.trains) return unwrapPayload(payload.trains, trainNo);
  return payload && (payload.train_no || payload.trainNumber || payload.number) ? payload : null;
}

function numberOr(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeProviderPayload(payload, simulation) {
  const latitude = numberOr(payload.latitude ?? payload.lat ?? payload.position?.latitude, simulation.latitude);
  const longitude = numberOr(payload.longitude ?? payload.lng ?? payload.lon ?? payload.position?.longitude, simulation.longitude);
  const speed = numberOr(payload.current_speed_kmph ?? payload.speed_kmph ?? payload.speed ?? payload.currentSpeed, simulation.current_speed_kmph);
  return {
    ...simulation,
    latitude,
    longitude,
    current_speed_kmph: Math.max(0, Math.min(160, speed)),
    current_location: payload.current_location || payload.currentStation || payload.location || simulation.current_location,
    next_station: payload.next_station || payload.nextStation || simulation.next_station,
    source: 'live-provider',
    data_quality: 'external-feed',
    provider_updated_at: payload.updated_at || payload.timestamp || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

async function fetchProviderSnapshot(trainNo, simulation) {
  if (!providerEnabled()) return null;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), providerTimeoutMs);
  try {
    const separator = providerUrl.includes('?') ? '&' : '?';
    const response = await fetch(`${providerUrl}${separator}train_no=${encodeURIComponent(trainNo)}`, {
      signal: controller.signal,
      headers: providerToken ? { Authorization: `Bearer ${providerToken}` } : {}
    });
    if (!response.ok) throw new Error(`provider HTTP ${response.status}`);
    const payload = unwrapPayload(await response.json(), trainNo);
    if (!payload) throw new Error('provider returned no matching train');
    lastProviderError = '';
    return normalizeProviderPayload(payload, simulation);
  } catch (error) {
    lastProviderError = error.message;
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function refreshTrain(trainNo) {
  if (!ROUTES[trainNo]) return null;
  const simulation = tick(trainNo);
  const external = await fetchProviderSnapshot(trainNo, simulation);
  const snapshot = external || { ...simulation, source: 'simulation-fallback', data_quality: 'demo-simulation' };
  cache.set(trainNo, snapshot);
  return snapshot;
}

function getSnapshot(trainNo) {
  return cache.get(trainNo) || { ...tick(trainNo), source: providerEnabled() ? 'simulation-fallback' : 'demo-simulation', data_quality: providerEnabled() ? 'provider-unavailable' : 'demo-simulation' };
}

function clearSnapshot(trainNo) {
  cache.delete(trainNo);
}

module.exports = { providerEnabled, providerStatus, refreshTrain, getSnapshot, clearSnapshot };

const { ROUTES } = require('../data/routes');
const { resetTrain } = require('../services/simulation.service');
const { refreshTrain, getSnapshot, clearSnapshot } = require('../services/realtime.service');

function listTrains(req, res) {
  res.json(Object.entries(ROUTES).map(([train_no, r]) => ({
    train_no,
    name: r.name,
    from: r.from,
    to: r.to,
    category: r.category,
    distance_km: r.stations.at(-1).km,
    scheduled_duration_minutes: r.stations.at(-1).scheduledMin + Math.max(0, r.stations.length - 2) * 2,
    average_travel_time: (() => { const minutes = r.stations.at(-1).scheduledMin + Math.max(0, r.stations.length - 2) * 2; return `${Math.floor(minutes / 60)}h ${minutes % 60}m`; })()
  })));
}

function getTrain(req, res) {
  const train = ROUTES[req.params.trainNo];
  if (!train) return res.status(404).json({ error: 'Train not found' });
  return res.json({ train_no: req.params.trainNo, ...train });
}

async function liveTrain(req, res) {
  if (!ROUTES[req.params.trainNo]) return res.status(404).json({ error: 'Train not found' });
  res.set('Cache-Control', 'no-store');
  return res.json(await refreshTrain(req.params.trainNo));
}

function reset(req, res) {
  if (!ROUTES[req.params.trainNo]) return res.status(404).json({ error: 'Train not found' });
  resetTrain(req.params.trainNo);
  clearSnapshot(req.params.trainNo);
  return res.json({ status: 'reset', train_no: req.params.trainNo, snapshot: getSnapshot(req.params.trainNo) });
}

module.exports = { listTrains, getTrain, liveTrain, reset };

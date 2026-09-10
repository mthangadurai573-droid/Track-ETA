const express = require('express');
const { ROUTES } = require('../data/routes');
const { tick } = require('../services/simulation.service');
const router = express.Router();

function operationalStatus(snapshot) {
  if (snapshot.status === 'arrived') return 'arrived';
  if (snapshot.status === 'stopped') return snapshot.delay_minutes <= 2 ? 'on_time' : snapshot.delay_minutes <= 15 ? 'delayed' : 'critical';
  return snapshot.status;
}

router.get('/stats', (req, res) => {
  const live = Object.keys(ROUTES).map(tick);
  res.json({
    train_count: live.length,
    on_time: live.filter(x => operationalStatus(x) === 'on_time').length,
    delayed: live.filter(x => operationalStatus(x) === 'delayed').length,
    critical: live.filter(x => operationalStatus(x) === 'critical').length,
    average_delay: Number((live.reduce((a, x) => a + x.delay_minutes, 0) / live.length).toFixed(1)),
    high_crowd: live.filter(x => x.crowd_score >= 70).length,
    alerts: live.filter(x => x.delay_minutes >= 15 || x.crowd_score >= 80).length
  });
});

router.get('/notifications', (req, res) => {
  const live = Object.keys(ROUTES).map(tick);
  res.json(live.filter(x => x.status !== 'on_time' || x.crowd_score >= 70).slice(0, 8).map(x => ({
    train_no: x.train_no, title: x.status === 'critical' ? 'Critical ETA delay' : 'Service update',
    message: `${x.train_name}: +${x.delay_minutes} min predicted delay near ${x.current_location}.`,
    level: x.status === 'critical' ? 'high' : 'medium', time: x.updated_at
  })));
});

router.get('/crowd/:trainNo', (req, res) => {
  if (!ROUTES[req.params.trainNo]) return res.status(404).json({ error: 'Train not found' });
  const live = tick(req.params.trainNo);
  const score = live.crowd_score;
  res.json({
    train_no: live.train_no,
    train_name: live.train_name,
    route: `${live.from_station} → ${live.to_station}`,
    current_location: live.current_location,
    station: live.next_station,
    distance_covered_km: live.distance_covered_km,
    progress_percent: live.progress_percent,
    score,
    level: score >= 75 ? 'High Crowd' : score >= 50 ? 'Medium' : 'Low',
    inputs: { festival_calendar: score >= 70, ticket_bookings: Math.round(score * 8), previous_passenger_count: Math.round(score * 7.4) },
    updated_at: live.updated_at
  });
});

router.get('/risk/:trainNo', (req, res) => {
  if (!ROUTES[req.params.trainNo]) return res.status(404).json({ error: 'Train not found' });
  const live = tick(req.params.trainNo);
  const checks = { overspeed: live.current_speed_kmph > 100, sharp_curves: false, bad_weather: live.weather !== 'Clear', signal_issues: live.factors['Signal congestion'] > 7 };
  const risk = Math.min(100, Math.round((live.current_speed_kmph / 110) * 30 + (live.delay_minutes / 30) * 20 + (live.crowd_score / 100) * 15 + (checks.bad_weather ? 15 : 0) + (checks.signal_issues ? 20 : 0)));
  res.json({ train_no: live.train_no, score: risk, level: risk >= 70 ? 'High' : risk >= 40 ? 'Medium' : 'Low', checks, basis: { overspeed: 'Live simulated GPS speed; alert above 100 km/h', signal_issues: 'Live signal congestion factor; alert above 7 minutes', bad_weather: 'Live weather classification from weather severity', sharp_curves: 'No curve geometry dataset is loaded for this demo route; not detected' }, contacts: [{ department: 'Railway control room', number: '139' }, { department: 'National emergency response', number: '112' }], disclaimer: 'Verify local railway control-room contacts before production use.' });
});

router.get('/maintenance/:trainNo', (req, res) => {
  if (!ROUTES[req.params.trainNo]) return res.status(404).json({ error: 'Train not found' });
  const live = tick(req.params.trainNo);
  const healthScore = Math.max(68, Math.round(100 - live.delay_minutes - live.crowd_score / 8));
  res.json({ train_no: live.train_no, brake_inspection: live.distance_covered_km > 1000 ? 'Recommended soon' : 'Normal', wheel_replacement: live.distance_covered_km > 1600 ? 'Review required' : 'Normal', engine_servicing: live.delay_minutes > 15 ? 'Priority review' : 'Normal', health_score: healthScore, basis: `Distance covered (${live.distance_covered_km} km), predicted delay (${live.delay_minutes} min), and passenger crowd (${live.crowd_score}/100).` });
});

router.get('/reports', (req, res) => {
  const live = Object.keys(ROUTES).map(tick);
  res.json(live.map(x => ({ train_no: x.train_no, train_name: x.train_name, route: `${x.from_station} → ${x.to_station}`, delay: x.delay_minutes, crowd: x.crowd_score, status: operationalStatus(x) })));
});

module.exports = router;

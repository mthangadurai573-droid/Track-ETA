const { ROUTES } = require('../data/routes');

const SIM_SPEEDUP = 40;
const MAX_OPERATIONAL_SPEED_KMPH = 160;
const STATION_DWELL_REAL_SECONDS = 60;
const STATION_DWELL_MINUTES = (STATION_DWELL_REAL_SECONDS / 60) * SIM_SPEEDUP;
const DECELERATION_WINDOW_MINUTES = 15;
const state = new Map();

function initTrain(trainNo, startAtOrigin = false) {
  const route = ROUTES[trainNo];
  const initialElapsed = startAtOrigin ? 0 : 20 + Math.random() * 40;
  const initialStationIndex = route.stations.reduce((index, station, stationIndex) => station.scheduledMin <= initialElapsed ? stationIndex : index, 0);
  const conditionBucket = Number(trainNo) % 3;
  const delayScale = conditionBucket === 0 ? 0.05 : conditionBucket === 1 ? 0.42 : 1;
  state.set(trainNo, {
    elapsedSimMinutes: initialElapsed,
    stationIndex: Math.min(initialStationIndex, route.stations.length - 2),
    dwellRemainingMinutes: startAtOrigin ? STATION_DWELL_MINUTES : 0,
    holdingAtStation: startAtOrigin,
    segmentSpeedFactors: route.stations.slice(0, -1).map(() => 0.94 + Math.random() * 0.12),
    speedKmph: 0,
    etaHistory: [],
    lastTick: Date.now(),
    baseHistoricalDelay: 2 + Math.random() * 4,
    delayScale,
    delayProfile: {
      signalCongestion: Math.random(),
      weatherSeverity: Math.random(),
      trackCondition: Math.random() * 0.6,
      dwellOverrun: Math.random() * 4
    },
    crowdBaseline: 35 + Math.random() * 30,
    startWallclock: new Date(),
    completedSnapshot: null
  });
}

Object.keys(ROUTES).forEach(initTrain);

function stationProgress(trainNo, elapsedMinutes, current) {
  const stations = ROUTES[trainNo].stations;
  const index = Math.max(0, Math.min(current.stationIndex, stations.length - 1));
  const station = stations[index];
  if (current.dwellRemainingMinutes > 0 || index === stations.length - 1) {
    return { currentStation: station.name, nextStation: index === stations.length - 1 ? station.name : stations[index + 1].name, currentKm: station.km, lat: station.lat, lng: station.lng };
  }
  const next = stations[index + 1];
  const frac = next.scheduledMin === station.scheduledMin ? 0 : (elapsedMinutes - station.scheduledMin) / (next.scheduledMin - station.scheduledMin);
  return { currentStation: station.name, nextStation: next.name, currentKm: station.km + frac * (next.km - station.km), lat: station.lat + frac * (next.lat - station.lat), lng: station.lng + frac * (next.lng - station.lng) };
}

function advanceSimulation(current, route, deltaMinutes) {
  let remaining = deltaMinutes;
  const finalIndex = route.stations.length - 1;
  while (remaining > 0 && current.elapsedSimMinutes < route.stations[finalIndex].scheduledMin) {
    if (current.holdingAtStation && current.dwellRemainingMinutes <= 0) {
      current.holdingAtStation = false;
    }
    if (current.dwellRemainingMinutes > 0) {
      const dwell = Math.min(remaining, current.dwellRemainingMinutes);
      current.dwellRemainingMinutes -= dwell;
      remaining -= dwell;
      current.holdingAtStation = current.dwellRemainingMinutes > 0;
      return;
    }
    const nextStation = route.stations[current.stationIndex + 1];
    if (!nextStation) break;
    const travel = nextStation.scheduledMin - current.elapsedSimMinutes;
    if (remaining < travel) {
      current.elapsedSimMinutes += remaining;
      remaining = 0;
    } else {
      current.elapsedSimMinutes = nextStation.scheduledMin;
      current.stationIndex += 1;
      remaining -= travel;
      if (current.stationIndex < finalIndex) {
        current.dwellRemainingMinutes = STATION_DWELL_MINUTES;
        current.holdingAtStation = true;
        return;
      }
    }
  }
}

function predictDelay(trainNo) {
  const s = state.get(trainNo);
  const { signalCongestion, weatherSeverity, trackCondition, dwellOverrun } = s.delayProfile;
  const scale = s.delayScale;
  const factors = {
    "Route delay": Number((s.baseHistoricalDelay * scale).toFixed(1)),
    "Dwell time overrun": Number((dwellOverrun * scale).toFixed(1)),
    "Signal congestion": Number((signalCongestion * 10 * scale).toFixed(1)),
    "Weather conditions": Number((weatherSeverity * 8 * scale).toFixed(1)),
    "Track conditions": Number((trackCondition * 6 * scale).toFixed(1))
  };
  const total = Number(Object.values(factors).reduce((a, b) => a + b, 0).toFixed(1));
  return { total, factors };
}

function scheduledSegmentSpeed(route, current) {
  const station = route.stations[current.stationIndex];
  const nextStation = route.stations[current.stationIndex + 1];
  if (!station || !nextStation) return 0;
  const minutes = nextStation.scheduledMin - station.scheduledMin;
  if (minutes <= 0) return 0;
  return (nextStation.km - station.km) / (minutes / 60);
}

function operatingTargetSpeed(route, current, referenceSpeed) {
  const station = route.stations[current.stationIndex];
  const nextStation = route.stations[current.stationIndex + 1];
  if (!station || !nextStation) return 0;
  const segmentMinutes = nextStation.scheduledMin - station.scheduledMin;
  const remainingMinutes = nextStation.scheduledMin - current.elapsedSimMinutes;
  const baseSpeed = MAX_OPERATIONAL_SPEED_KMPH;
  if (remainingMinutes >= DECELERATION_WINDOW_MINUTES || segmentMinutes <= 0) return baseSpeed;
  const progress = Math.max(0, Math.min(1, remainingMinutes / DECELERATION_WINDOW_MINUTES));
  const smoothFactor = progress * progress * (3 - 2 * progress);
  return baseSpeed * (0.1 + 0.9 * smoothFactor);
}

function remainingJourneyMinutes(route, current, elapsed, journeyComplete) {
  if (journeyComplete) return 0;
  const finalIndex = route.stations.length - 1;
  const remainingSimulatedTravel = Math.max(0, route.stations[finalIndex].scheduledMin - elapsed);
  const travelMinutes = remainingSimulatedTravel / SIM_SPEEDUP;
  const futureStationStops = Math.max(0, finalIndex - current.stationIndex - 1) * (STATION_DWELL_REAL_SECONDS / 60);
  const currentStopMinutes = current.holdingAtStation ? current.dwellRemainingMinutes / SIM_SPEEDUP : 0;
  return travelMinutes + futureStationStops + currentStopMinutes;
}

function tick(trainNo) {
  const route = ROUTES[trainNo];
  if (!state.has(trainNo)) initTrain(trainNo);
  const current = state.get(trainNo);
  const now = Date.now();
  const realElapsed = (now - current.lastTick) / 1000;
  current.lastTick = now;
  const totalScheduled = route.stations.at(-1).scheduledMin;
  advanceSimulation(current, route, (realElapsed * SIM_SPEEDUP) / 60);
  const elapsed = Math.min(current.elapsedSimMinutes, totalScheduled);
  const journeyComplete = elapsed >= totalScheduled;
  const referenceSpeed = scheduledSegmentSpeed(route, current);
  const targetSpeed = journeyComplete || current.holdingAtStation ? 0 : operatingTargetSpeed(route, current, referenceSpeed);
  const speedStep = Math.min(12, Math.max(1, realElapsed * 4));
  if (current.holdingAtStation || journeyComplete) {
    current.speedKmph = 0;
  } else {
    current.speedKmph += Math.sign(targetSpeed - current.speedKmph) * Math.min(Math.abs(targetSpeed - current.speedKmph), speedStep);
  }
  const progress = stationProgress(trainNo, elapsed, current);
  if (journeyComplete && current.completedSnapshot) return current.completedSnapshot;
  const isStopped = !journeyComplete && current.holdingAtStation;
  const prediction = predictDelay(trainNo);
  const scheduledDuration = totalScheduled + Math.max(0, route.stations.length - 2) * 2;
  const remainingMinutes = remainingJourneyMinutes(route, current, elapsed, journeyComplete);
  const scheduledArrival = new Date(now + remainingMinutes * 60000);
  const predictedArrival = new Date(scheduledArrival.getTime() + prediction.total * 60000);
  const progressPct = Math.min(100, (progress.currentKm / route.stations.at(-1).km) * 100);
  const weather = prediction.factors["Weather conditions"] > 5 ? 'Heavy Rain' : prediction.factors["Weather conditions"] > 2.5 ? 'Moderate' : 'Clear';
  const crowdScore = Math.min(100, Math.round(current.crowdBaseline + prediction.factors["Route delay"] * 2));
  const entry = {
    clock: new Date().toLocaleTimeString('en-IN', { hour12: false }),
    predicted_eta: predictedArrival.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    delay_min: prediction.total,
    remaining_journey_minutes: Number(remainingMinutes.toFixed(2)),
    predicted_remaining_minutes: Number((remainingMinutes + prediction.total).toFixed(2))
  };
  current.etaHistory.push(entry);
  current.etaHistory = current.etaHistory.slice(-15);

  const snapshot = {
    train_no: trainNo, train_name: route.name, from_station: route.from, to_station: route.to,
    category: route.category, current_location: journeyComplete ? route.to : progress.currentStation,
    next_station: journeyComplete ? 'Arrived' : progress.nextStation,
    current_speed_kmph: journeyComplete ? 0 : Number(current.speedKmph.toFixed(1)),
    reference_speed_kmph: Number(referenceSpeed.toFixed(1)),
    distance_covered_km: Number(progress.currentKm.toFixed(1)), total_distance_km: route.stations.at(-1).km,
    progress_percent: Number(progressPct.toFixed(1)), latitude: progress.lat, longitude: progress.lng,
    scheduled_eta: scheduledArrival.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    predicted_eta: predictedArrival.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false }),
    delay_minutes: prediction.total,
    status: journeyComplete ? 'arrived' : isStopped ? 'stopped' : prediction.total <= 2 ? 'on_time' : prediction.total <= 15 ? 'delayed' : 'critical',
    is_stopped: isStopped,
    station_stop_duration_minutes: STATION_DWELL_REAL_SECONDS / 60,
    station_stop_remaining_seconds: isStopped ? Math.ceil(current.dwellRemainingMinutes * 60 / SIM_SPEEDUP) : 0,
    factors: prediction.factors, weather, crowd_score: crowdScore,
    route_path: route.stations.map(station => [station.lat, station.lng]),
    station_points: route.stations.map(station => ({
      name: station.name,
      city: station.name.replace(/\s+(Central|Junction|Cantt)$/, ''),
      distance_km: station.km,
      latitude: station.lat,
      longitude: station.lng
    })),
    scheduled_duration_minutes: scheduledDuration, average_travel_time: `${Math.floor(scheduledDuration / 60)}h ${scheduledDuration % 60}m`,
    remaining_journey_minutes: Number(remainingMinutes.toFixed(2)),
    eta_history: current.etaHistory, journey_complete: journeyComplete, updated_at: new Date().toISOString()
  };
  if (journeyComplete) current.completedSnapshot = snapshot;
  return snapshot;
}

function getSnapshot(trainNo) { return tick(trainNo); }
function resetTrain(trainNo) { initTrain(trainNo, true); return { status: 'reset', train_no: trainNo }; }

module.exports = { tick, resetTrain, getSnapshot };

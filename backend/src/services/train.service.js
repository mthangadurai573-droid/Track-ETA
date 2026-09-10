const { ROUTES } = require('../data/routes');

function listTrains() {
  return Object.entries(ROUTES).map(([trainNo, route]) => ({
    train_no: trainNo,
    name: route.name,
    from: route.from,
    to: route.to
  }));
}

function getTrain(trainNo) {
  const route = ROUTES[trainNo];
  if (!route) return null;
  return {
    train_no: trainNo,
    name: route.name,
    from: route.from,
    to: route.to,
    stations: route.stations.map(({ name, km, lat, lng }) => ({ name, km, lat, lng }))
  };
}

module.exports = { listTrains, getTrain };

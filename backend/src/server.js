const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');
const trainRoutes = require('./routes/train.routes');
const createHealthRouter = require('./routes/health.routes');
const analyticsRoutes = require('./routes/analytics.routes');
const { ROUTES } = require('./data/routes');
const { refreshTrain } = require('./services/realtime.service');
const { log } = require('./utils/logger');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});
const PORT = process.env.PORT || 10000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use('/api', trainRoutes);
app.use('/api', analyticsRoutes);
app.use('/api', createHealthRouter());
app.use(express.static(path.join(__dirname, '../../frontend')));

app.get(/^\/(?!api(?:\/|$)).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/index.html'));
});

io.on('connection', socket => {
  socket.on('subscribe', trainNo => {
    if (ROUTES[trainNo]) socket.join(`train:${trainNo}`);
  });
});

io.engine.on('connection_error', error => {
  log(`Socket.IO connection error: ${error.message}`);
});

setInterval(async () => {
  await Promise.all(Object.keys(ROUTES).map(async trainNo => {
    const snapshot = await refreshTrain(trainNo);
    io.to(`train:${trainNo}`).emit('train:update', snapshot);
  }));
}, 2000);

server.listen(PORT, '0.0.0.0', () => log(`Track ETA running on port ${PORT}`));

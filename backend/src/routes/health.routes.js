const express = require('express');
const { providerStatus } = require('../services/realtime.service');
const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ ok: true, service: 'Track ETA Forecast', version: '3.0.0', runtime: 'Node.js', realtime: providerStatus() });
});

module.exports = router;

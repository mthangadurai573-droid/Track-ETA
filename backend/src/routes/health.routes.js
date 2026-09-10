const express = require('express');

function createHealthRouter({ io, frontendUrl }) {
  const router = express.Router();

  router.get('/health', (req, res) => {
    res.json({
      ok: true,
      service: 'Track ETA Forecast',
      version: '3.0.0',
      runtime: 'Node.js',
      realtime: {
        enabled: Boolean(io && io.engine),
        url_configured: Boolean(frontendUrl),
        last_error: null
      }
    });
  });

  return router;
}

module.exports = createHealthRouter;

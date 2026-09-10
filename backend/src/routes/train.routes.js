const express = require('express');
const controller = require('../controllers/train.controller');
const router = express.Router();
router.get('/trains', controller.listTrains);
router.get('/train/:trainNo', controller.getTrain);
router.get('/train/:trainNo/live', controller.liveTrain);
router.post('/train/:trainNo/reset', controller.reset);
module.exports = router;

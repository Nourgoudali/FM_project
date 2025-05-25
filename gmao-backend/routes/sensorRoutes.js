const express = require('express');
const sensorController = require('../controllers/sensorController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Sensor data endpoints
router.post('/', verifyToken, checkRole('admin'), sensorController.create);
router.get('/:equipmentId', verifyToken, sensorController.getSensorsByEquipment);
router.get('/alerts', verifyToken, checkRole(['admin', 'team_leader']), sensorController.getAlerts);

// Predictive maintenance endpoints
router.get('/:equipmentId/recommendations', verifyToken, sensorController.getRecommendationsForEquipment);
router.post('/:equipmentId/optimization', verifyToken, checkRole('admin'), sensorController.applyOptimization);

module.exports = router;
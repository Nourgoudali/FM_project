const express = require('express');
const sensorController = require('../controllers/sensorController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware(['admin']), sensorController.create);
router.get('/equipment/:equipmentId', authMiddleware, sensorController.getByEquipment);
router.get('/alerts', authMiddleware, roleMiddleware(['admin', 'team_leader']), sensorController.getAlerts);

module.exports = router;
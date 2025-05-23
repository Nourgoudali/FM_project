const express = require('express');
const sensorController = require('../controllers/sensorController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, checkRole('admin'), sensorController.create);
router.get('/equipment/:equipmentId', verifyToken, sensorController.getByEquipment);
router.get('/alerts', verifyToken, checkRole(['admin', 'team_leader']), sensorController.getAlerts);

module.exports = router;
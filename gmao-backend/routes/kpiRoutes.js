const express = require('express');
const kpiController = require('../controllers/kpiController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/generate', verifyToken, checkRole(['admin', 'team_leader']), kpiController.generate);
router.get('/latest', verifyToken, kpiController.getLatest);
router.get('/equipment/:id', verifyToken, kpiController.getEquipmentKPI);
router.get('/reliability', verifyToken, kpiController.getReliabilityKPI);
router.get('/maintenance', verifyToken, kpiController.getMaintenanceKPI);

module.exports = router;
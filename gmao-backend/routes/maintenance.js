const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const MaintenanceTaskController = require('../controllers/MaintenanceTaskController');

// Routes pour la planification de maintenance
router.post('/planning', auth, MaintenanceTaskController.createTask);
router.get('/planning', auth, MaintenanceTaskController.getTasks);
router.put('/planning/:taskId/validate', auth, MaintenanceTaskController.validateTask);

module.exports = router;

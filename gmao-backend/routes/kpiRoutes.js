const express = require('express');
const kpiController = require('../controllers/kpiController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/generate', authMiddleware, roleMiddleware(['admin', 'team_leader']), kpiController.generate);
router.get('/latest', authMiddleware, kpiController.getLatest);

module.exports = router;
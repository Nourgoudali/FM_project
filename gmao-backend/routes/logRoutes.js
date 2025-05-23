const express = require('express');
const logController = require('../controllers/logController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', verifyToken, checkRole('admin'), logController.getAll);
router.get('/system', verifyToken, checkRole('admin'), logController.getSystemLogs);

module.exports = router;
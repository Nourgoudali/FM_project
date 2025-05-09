const express = require('express');
const logController = require('../controllers/logController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', authMiddleware, roleMiddleware(['admin']), logController.getAll);

module.exports = router;
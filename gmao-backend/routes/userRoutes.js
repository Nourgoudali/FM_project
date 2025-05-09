const express = require('express');
const userController = require('../controllers/userController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', authMiddleware, roleMiddleware(['admin']), userController.register);
router.post('/login', userController.login);

module.exports = router;
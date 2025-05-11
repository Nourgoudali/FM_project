const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');

// Routes publiques
router.post('/login', authController.login);
router.post('/register', authController.register);

// Routes protégées
router.get('/profile', authMiddleware, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
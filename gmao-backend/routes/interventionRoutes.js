const express = require('express');
const interventionController = require('../controllers/interventionController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

// Log uniquement le chemin de la route sans données sensibles
router.use((req, res, next) => {
  console.log(`Request received: ${req.method} ${req.originalUrl}`);
  next();
});

router.post('/', verifyToken, interventionController.create);
router.get('/', verifyToken, interventionController.getAll);
router.get('/:id', verifyToken, interventionController.getById);
router.put('/:id', verifyToken, interventionController.update);
router.delete('/:id', verifyToken, checkRole('admin'), interventionController.delete);

module.exports = router;
const express = require('express');
const stockController = require('../controllers/stockController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware(['admin']), stockController.create);
router.get('/', authMiddleware, stockController.getAll);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), stockController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), stockController.delete);
router.post('/:id/movement', authMiddleware, roleMiddleware(['admin', 'team_leader']), stockController.addMovement);
router.get('/low', authMiddleware, stockController.getLowStock);

module.exports = router;
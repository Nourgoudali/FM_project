const express = require('express');
const stockController = require('../controllers/stockController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, checkRole('admin'), stockController.create);
router.get('/', verifyToken, stockController.getAll);
router.get('/categories', verifyToken, stockController.getPdrCategories);
router.get('/low', verifyToken, stockController.getLowStock);
router.get('/:id', verifyToken, stockController.getById);
router.put('/:id', verifyToken, checkRole('admin'), stockController.update);
router.delete('/:id', verifyToken, checkRole('admin'), stockController.delete);
router.post('/:id/movement', verifyToken, checkRole(['admin', 'team_leader']), stockController.addMovement);

module.exports = router;
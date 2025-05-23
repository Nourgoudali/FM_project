const express = require('express');
const planningController = require('../controllers/planningController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, checkRole('admin'), planningController.create);
router.get('/', verifyToken, planningController.getAll);
router.get('/:id', verifyToken, planningController.getById);
router.put('/:id', verifyToken, checkRole('admin'), planningController.update);
router.delete('/:id', verifyToken, checkRole('admin'), planningController.delete);

module.exports = router;
const express = require('express');
const equipmentController = require('../controllers/equipmentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, checkRole('admin'), equipmentController.create);
router.get('/', verifyToken, equipmentController.getAll);
router.put('/:id', verifyToken, checkRole('admin'), equipmentController.update);
router.delete('/:id', verifyToken, checkRole('admin'), equipmentController.delete);

module.exports = router;
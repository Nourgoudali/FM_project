const express = require('express');
const equipmentController = require('../controllers/equipmentController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware.verifyToken, authMiddleware.checkRole('admin'), equipmentController.create);
router.get('/', authMiddleware.verifyToken, equipmentController.getAll);
router.get('/reference/:reference', authMiddleware.verifyToken, equipmentController.getByReference);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.checkRole('admin'), equipmentController.update);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.checkRole('admin'), equipmentController.delete);

module.exports = router;
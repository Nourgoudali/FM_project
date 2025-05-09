const express = require('express');
const equipmentController = require('../controllers/equipmentController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware(['admin']), equipmentController.create);
router.get('/', authMiddleware, equipmentController.getAll);
router.put('/:id', authMiddleware, roleMiddleware(['admin']), equipmentController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), equipmentController.delete);

module.exports = router;
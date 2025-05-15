const express = require('express');
const interventionController = require('../controllers/interventionController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, interventionController.create);
router.get('/', authMiddleware, interventionController.getAll);
router.get('/:id', authMiddleware, interventionController.getById);
router.put('/:id', authMiddleware, interventionController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), interventionController.delete);

module.exports = router;

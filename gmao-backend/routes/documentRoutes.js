const express = require('express');
const documentController = require('../controllers/documentController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware(['admin', 'team_leader']), documentController.create);
router.get('/', authMiddleware, documentController.getAll);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'team_leader']), documentController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), documentController.delete);

module.exports = router;
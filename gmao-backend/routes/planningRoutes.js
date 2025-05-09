const express = require('express');
const planningController = require('../controllers/planningController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware(['admin', 'team_leader']), planningController.create);
router.get('/', authMiddleware, planningController.getAll);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'team_leader']), planningController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), planningController.delete);

module.exports = router;
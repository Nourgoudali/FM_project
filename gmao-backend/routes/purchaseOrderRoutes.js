const express = require('express');
const purchaseOrderController = require('../controllers/purchaseOrderController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware(['admin', 'team_leader']), purchaseOrderController.create);
router.get('/', authMiddleware, purchaseOrderController.getAll);
router.put('/:id', authMiddleware, roleMiddleware(['admin', 'team_leader']), purchaseOrderController.update);
router.delete('/:id', authMiddleware, roleMiddleware(['admin']), purchaseOrderController.delete);

module.exports = router;
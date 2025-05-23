const express = require('express');
const purchaseOrderController = require('../controllers/purchaseOrderController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, checkRole('admin'), purchaseOrderController.create);
router.get('/', verifyToken, purchaseOrderController.getAll);
router.get('/:id', verifyToken, purchaseOrderController.getById);
router.put('/:id', verifyToken, checkRole('admin'), purchaseOrderController.update);
router.delete('/:id', verifyToken, checkRole('admin'), purchaseOrderController.delete);

module.exports = router;
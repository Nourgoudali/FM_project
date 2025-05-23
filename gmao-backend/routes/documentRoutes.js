const express = require('express');
const documentController = require('../controllers/documentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, checkRole('admin'), documentController.upload);
router.get('/', verifyToken, documentController.getAllDocuments);
router.get('/:id', verifyToken, documentController.getDocument);
router.delete('/:id', verifyToken, checkRole('admin'), documentController.deleteDocument);
router.get('/equipment/:equipmentId', verifyToken, documentController.getDocumentsByEquipment);

module.exports = router;
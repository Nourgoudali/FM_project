const express = require('express');
const documentController = require('../controllers/documentController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');
const { upload, handleUploadErrors } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Route pour créer un document avec upload de fichier
router.post(
  '/',
  verifyToken,
  checkRole('admin'),
  upload.single('file'), // 'file' est le nom du champ dans le formulaire
  handleUploadErrors,
  documentController.upload
);

// Routes pour la gestion des documents
router.get('/', verifyToken, documentController.getAllDocuments);
router.delete('/:id', verifyToken, checkRole('admin'), documentController.deleteDocument);

module.exports = router;
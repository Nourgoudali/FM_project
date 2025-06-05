const express = require('express');
const equipmentController = require('../controllers/equipmentController');
const authMiddleware = require('../middleware/authMiddleware');
const { upload } = require('../middleware/uploadMiddleware');

const router = express.Router();

// Configuration du middleware multer pour gérer les fichiers
const uploadFields = [
  { name: 'image', maxCount: 1 }
];

router.post('/', 
  authMiddleware.verifyToken, 
  authMiddleware.checkRole('admin'),
  upload.fields(uploadFields),
  equipmentController.create
);
router.get('/', authMiddleware.verifyToken, equipmentController.getAll);
router.get('/reference/:reference', authMiddleware.verifyToken, equipmentController.getByReference);
router.put('/:id', authMiddleware.verifyToken, authMiddleware.checkRole('admin'), equipmentController.update);
router.delete('/:id', authMiddleware.verifyToken, authMiddleware.checkRole('admin'), equipmentController.delete);

module.exports = router;
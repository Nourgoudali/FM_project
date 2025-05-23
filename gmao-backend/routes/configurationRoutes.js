const express = require('express');
const configurationController = require('../controllers/configurationController');
const { verifyToken, checkRole } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, checkRole('admin'), configurationController.createOrUpdate);
router.get('/', verifyToken, checkRole('admin'), configurationController.getAll);
router.delete('/:key', verifyToken, checkRole('admin'), configurationController.delete);

module.exports = router;
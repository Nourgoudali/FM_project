const express = require('express');
const configurationController = require('../controllers/configurationController');
const { authMiddleware, roleMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, roleMiddleware(['admin']), configurationController.createOrUpdate);
router.get('/', authMiddleware, roleMiddleware(['admin']), configurationController.getAll);
router.delete('/:key', authMiddleware, roleMiddleware(['admin']), configurationController.delete);

module.exports = router;
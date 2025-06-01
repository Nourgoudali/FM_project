const express = require('express');
const router = express.Router();
const commandeController = require('../controllers/commandeController');
const { verifyToken } = require('../middleware/authMiddleware');

// Routes pour les commandes
router.get('/', verifyToken, commandeController.getAllCommandes);
router.get('/:id', verifyToken, commandeController.getCommandeById);
router.post('/', verifyToken, commandeController.createCommande);
router.put('/:id', verifyToken, commandeController.updateCommande);
router.delete('/:id', verifyToken, commandeController.deleteCommande);

module.exports = router;

const express = require('express');
const router = express.Router();
const traitementController = require('../controllers/traitementController');
const { verifyToken } = require('../middleware/authMiddleware');

// Routes protégées par authentification
router.use(verifyToken);

// Route pour créer un nouveau traitement
router.post('/', traitementController.createTraitement);

// Route pour récupérer tous les traitements
router.get('/', traitementController.getAllTraitements);

// Route pour récupérer un traitement par ID
router.get('/:id', traitementController.getTraitementById);

// Route pour récupérer les traitements par commande
router.get('/commande/:commandeId', traitementController.getTraitementsByCommande);

// Route pour mettre à jour un traitement
router.put('/:id', traitementController.updateTraitement);

// Route pour supprimer un traitement
router.delete('/:id', traitementController.deleteTraitement);

module.exports = router;

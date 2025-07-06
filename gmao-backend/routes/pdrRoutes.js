const express = require('express');
const router = express.Router();
const initializePdrCategories = require('../middleware/pdrCategoriesMiddleware');

// Endpoint pour initialiser les catégories PDR
router.get('/initialize-categories', async (req, res) => {
  try {
    await initializePdrCategories(req, res, () => {
      res.status(200).json({ message: 'Catégories PDR initialisées avec succès' });
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de l\'initialisation des catégories PDR', error: error.message });
  }
});

module.exports = router;

const mongoose = require('mongoose');
const Stock = require('../models/Stock');

// Middleware pour définir les catégories PDR par défaut
const initializePdrCategories = async (req, res, next) => {
  try {
    // Les catégories PDR par défaut
    const defaultCategories = ['Fluidique', 'Électrotechnique', 'Maintenance générale'];
    
    // Vérifier si toutes les catégories existent déjà
    const existingCategories = await Stock.distinct('pdrCategory');
    const categoriesToCreate = defaultCategories.filter(category => !existingCategories.includes(category));
    
    // Créer les articles manquants pour chaque catégorie
    if (categoriesToCreate.length > 0) {
      console.log(`Création de ${categoriesToCreate.length} catégories manquantes`);
      for (const category of categoriesToCreate) {
        try {
          const stock = new Stock({
            name: `Article de ${category}`,
            pdrCategory: category,
            prixUnitaire: 0,
            stockActuel: 0,
            stockMin: 0,
            stockMax: 0,
            stockSecurite: 0,
            lieuStockage: 'Stock principal'
          });
          await stock.save();
          console.log(`Catégorie ${category} créée avec succès`);
        } catch (error) {
          console.error(`Erreur lors de la création de l'article pour ${category}:`, error);
          // Continuer même en cas d'erreur pour créer les autres catégories
        }
      }
    } else {
      console.log('Toutes les catégories PDR existent déjà');
    }
    
    next();
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des catégories PDR:', error);
    next(error);
  }
};

module.exports = initializePdrCategories;

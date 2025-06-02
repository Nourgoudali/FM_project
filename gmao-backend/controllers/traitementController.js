const Traitement = require('../models/Traitement');
const Commande = require('../models/Commande');
const Stock = require('../models/Stock');

// Créer un nouveau traitement
exports.createTraitement = async (req, res) => {
  try {
    const { commandeId, numeroBL, dateReception, produits } = req.body;

    // Vérifier si la commande existe
    const commande = await Commande.findById(commandeId).populate('produits.produit');
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }

    // Créer le traitement
    const traitement = new Traitement({
      commande: commandeId,
      numeroBL,
      dateReception,
      produits: produits.map(p => ({
        produit: p.produitId,
        quantiteCommandee: p.quantiteCommandee,
        quantiteRecue: p.quantiteRecue,
        raisonEcart: p.raisonEcart || 'Aucun écart'
      }))
    });

    // Enregistrer le traitement
    await traitement.save();

    // Mettre à jour le numéro de BL dans la commande si nécessaire
    if (numeroBL && (!commande.numeroBL || commande.numeroBL !== numeroBL)) {
      commande.numeroBL = numeroBL;
      await commande.save();
      console.log(`Numéro de BL mis à jour dans la commande ${commande._id}: ${numeroBL}`);
    }

    // Mettre à jour le stock pour chaque produit reçu
    for (const produit of produits) {
      const stockItem = await Stock.findById(produit.produitId);
      if (stockItem) {
        // Mettre à jour la quantité totale
        stockItem.quantite += produit.quantiteRecue;
        
        // Mettre à jour le stock actuel
        stockItem.stockActuel += produit.quantiteRecue;
        
        console.log(`Stock mis à jour pour ${stockItem.name}: +${produit.quantiteRecue} unités, nouveau stock actuel: ${stockItem.stockActuel}`);
        
        await stockItem.save();
      } else {
        console.warn(`Produit non trouvé dans le stock: ${produit.produitId}`);
      }
    }

    // Récupérer le traitement avec les relations pour le retourner
    const traitementComplet = await Traitement.findById(traitement._id)
      .populate({
        path: 'commande',
        populate: {
          path: 'fournisseur',
          model: 'Fournisseur'
        }
      })
      .populate('produits.produit');

    res.status(201).json(traitementComplet);
  } catch (error) {
    console.error('Erreur lors de la création du traitement:', error);
    res.status(500).json({ message: 'Erreur lors de la création du traitement', error: error.message });
  }
};

// Récupérer tous les traitements
exports.getAllTraitements = async (req, res) => {
  try {
    const traitements = await Traitement.find()
      .populate({
        path: 'commande',
        populate: {
          path: 'fournisseur',
          model: 'Fournisseur'
        }
      })
      .populate('produits.produit')
      .sort({ createdAt: -1 });
    res.status(200).json(traitements);
  } catch (error) {
    console.error('Erreur lors de la récupération des traitements:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des traitements', error: error.message });
  }
};

// Récupérer un traitement par ID
exports.getTraitementById = async (req, res) => {
  try {
    const traitement = await Traitement.findById(req.params.id)
      .populate({
        path: 'commande',
        populate: {
          path: 'fournisseur',
          model: 'Fournisseur'
        }
      })
      .populate('produits.produit');
    
    if (!traitement) {
      return res.status(404).json({ message: 'Traitement non trouvé' });
    }
    
    res.status(200).json(traitement);
  } catch (error) {
    console.error('Erreur lors de la récupération du traitement:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération du traitement', error: error.message });
  }
};

// Récupérer les traitements par commande
exports.getTraitementsByCommande = async (req, res) => {
  try {
    const traitements = await Traitement.find({ commande: req.params.commandeId })
      .populate({
        path: 'commande',
        populate: {
          path: 'fournisseur',
          model: 'Fournisseur'
        }
      })
      .populate('produits.produit')
      .sort({ createdAt: -1 });
    
    res.status(200).json(traitements);
  } catch (error) {
    console.error('Erreur lors de la récupération des traitements par commande:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des traitements par commande', 
      error: error.message 
    });
  }
};

// Mettre à jour un traitement
exports.updateTraitement = async (req, res) => {
  try {
    const { numeroBL, dateReception, produits } = req.body;
    
    const traitement = await Traitement.findById(req.params.id);
    if (!traitement) {
      return res.status(404).json({ message: 'Traitement non trouvé' });
    }
    
    // Mettre à jour les champs
    traitement.numeroBL = numeroBL;
    traitement.dateReception = dateReception;
    
    // Mettre à jour les produits
    if (produits && produits.length > 0) {
      // Récupérer les anciennes quantités pour ajuster le stock
      const anciensProduits = [...traitement.produits];
      
      // Mettre à jour les produits du traitement
      traitement.produits = produits.map(p => ({
        produit: p.produitId,
        quantiteCommandee: p.quantiteCommandee,
        quantiteRecue: p.quantiteRecue,
        raisonEcart: p.raisonEcart || 'Aucun écart'
      }));
      
      // Enregistrer les modifications
      await traitement.save();
      
      // Ajuster le stock pour chaque produit
      for (const nouveauProduit of produits) {
        const ancienProduit = anciensProduits.find(p => p.produit.toString() === nouveauProduit.produitId);
        const ancienneQuantite = ancienProduit ? ancienProduit.quantiteRecue : 0;
        const differenceQuantite = nouveauProduit.quantiteRecue - ancienneQuantite;
        
        if (differenceQuantite !== 0) {
          const stockItem = await Stock.findById(nouveauProduit.produitId);
          if (stockItem) {
            // Mettre à jour la quantité totale
            stockItem.quantite += differenceQuantite;
            
            // Mettre à jour le stock actuel
            stockItem.stockActuel += differenceQuantite;
            
            console.log(`Stock mis à jour pour ${stockItem.name}: ${differenceQuantite > 0 ? '+' : ''}${differenceQuantite} unités, nouveau stock actuel: ${stockItem.stockActuel}`);
            
            await stockItem.save();
          } else {
            console.warn(`Produit non trouvé dans le stock: ${nouveauProduit.produitId}`);
          }
        }
      }
    }
    
    res.status(200).json(traitement);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du traitement:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour du traitement', error: error.message });
  }
};

// Supprimer un traitement
exports.deleteTraitement = async (req, res) => {
  try {
    const traitement = await Traitement.findById(req.params.id);
    if (!traitement) {
      return res.status(404).json({ message: 'Traitement non trouvé' });
    }
    
    // Ajuster le stock pour chaque produit
    for (const produit of traitement.produits) {
      const stockItem = await Stock.findById(produit.produit);
      if (stockItem) {
        stockItem.quantite -= produit.quantiteRecue;
        await stockItem.save();
      }
    }
    
    await Traitement.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Traitement supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du traitement:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du traitement', error: error.message });
  }
};

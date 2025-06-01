const Inventaire = require('../models/Inventaire');
const Stock = require('../models/Stock');
const Commande = require('../models/Commande');
const Traitement = require('../models/Traitement');

// Créer un nouvel inventaire
exports.createInventaire = async (req, res) => {
  try {
    const { traitementId, produitIndex, quantite, stockTheorique, raisonEcart } = req.body;

    // Vérifier si le traitement existe
    const traitement = await Traitement.findById(traitementId).populate('produits.produit');
    if (!traitement) {
      return res.status(404).json({ message: 'Traitement non trouvé' });
    }

    // Vérifier si l'index du produit est valide
    if (produitIndex === undefined || produitIndex < 0 || produitIndex >= traitement.produits.length) {
      return res.status(400).json({ message: 'Index de produit invalide' });
    }

    // Vérifier si ce produit a déjà été inventorié
    const inventaireExistant = await Inventaire.findOne({
      traitement: traitementId,
      produitIndex: produitIndex
    });

    if (inventaireExistant) {
      return res.status(400).json({ message: 'Ce produit a déjà été inventorié pour ce traitement' });
    }

    // Récupérer les informations du produit
    const produitInfo = traitement.produits[produitIndex];
    if (!produitInfo || !produitInfo.produit) {
      return res.status(404).json({ message: 'Produit non trouvé dans le traitement' });
    }

    // Si stockTheorique n'est pas fourni, utiliser la quantité commandée du traitement
    const stockTheoriqueValue = stockTheorique !== undefined ? stockTheorique : produitInfo.quantiteCommandee;
    
    // Calculer l'écart
    const ecartValue = quantite - stockTheoriqueValue;
    
    // Déterminer la raison d'écart par défaut si non fournie
    let raisonEcartValue = raisonEcart;
    if (!raisonEcartValue) {
      raisonEcartValue = ecartValue === 0 ? 'Aucun écart' : 'Autre';
    }

    // Créer l'inventaire
    const inventaire = new Inventaire({
      traitement: traitementId,
      produitIndex: produitIndex,
      quantite,
      stockTheorique: stockTheoriqueValue,
      ecart: ecartValue,
      raisonEcart: raisonEcartValue
    });

    await inventaire.save();

    // Mettre à jour le stock du produit
    const produitId = produitInfo.produit._id;
    
    // Utiliser findByIdAndUpdate pour éviter les problèmes de validation
    // Cette méthode met à jour uniquement le champ spécifié sans vérifier les autres champs requis
    await Stock.findByIdAndUpdate(
      produitId,
      { $inc: { stockActuel: quantite } }, // Incrémenter le stock actuel avec la quantité comptée
      { new: true } // Retourner le document mis à jour
    );

    // Récupérer l'inventaire avec les détails du traitement
    const inventaireComplet = await Inventaire.findById(inventaire._id)
      .populate({
        path: 'traitement',
        populate: {
          path: 'produits.produit',
          model: 'Stock'
        }
      });

    res.status(201).json(inventaireComplet);
  } catch (error) {
    console.error('Erreur lors de la création de l\'inventaire:', error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'inventaire', error: error.message });
  }
};

// Récupérer tous les inventaires
exports.getAllInventaires = async (req, res) => {
  try {
    const inventaires = await Inventaire.find()
      .populate({
        path: 'traitement',
        populate: {
          path: 'produits.produit',
          model: 'Stock'
        }
      })
      .sort({ dateInventaire: -1 });

    res.status(200).json(inventaires);
  } catch (error) {
    console.error('Erreur lors de la récupération des inventaires:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des inventaires', error: error.message });
  }
};

// Récupérer un inventaire par ID
exports.getInventaireById = async (req, res) => {
  try {
    const inventaire = await Inventaire.findById(req.params.id)
      .populate({
        path: 'traitement',
        populate: {
          path: 'produits.produit',
          model: 'Stock'
        }
      });

    if (!inventaire) {
      return res.status(404).json({ message: 'Inventaire non trouvé' });
    }

    res.status(200).json(inventaire);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'inventaire:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'inventaire', error: error.message });
  }
};

// Mettre à jour un inventaire
exports.updateInventaire = async (req, res) => {
  try {
    const { quantite, stockTheorique, raisonEcart } = req.body;

    const inventaire = await Inventaire.findById(req.params.id);
    if (!inventaire) {
      return res.status(404).json({ message: 'Inventaire non trouvé' });
    }

    // Mettre à jour les champs
    if (quantite !== undefined) inventaire.quantite = quantite;
    if (stockTheorique !== undefined) inventaire.stockTheorique = stockTheorique;
    if (raisonEcart !== undefined) inventaire.raisonEcart = raisonEcart;
    
    // L'écart sera recalculé automatiquement dans le middleware pre-save

    await inventaire.save();

    // Récupérer l'inventaire mis à jour avec les détails du traitement
    const inventaireComplet = await Inventaire.findById(inventaire._id)
      .populate({
        path: 'traitement',
        populate: {
          path: 'produits.produit',
          model: 'Stock'
        }
      });

    res.status(200).json(inventaireComplet);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'inventaire:', error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'inventaire', error: error.message });
  }
};

// Supprimer un inventaire
exports.deleteInventaire = async (req, res) => {
  try {
    const inventaire = await Inventaire.findById(req.params.id);
    if (!inventaire) {
      return res.status(404).json({ message: 'Inventaire non trouvé' });
    }

    await Inventaire.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Inventaire supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de l\'inventaire:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'inventaire', error: error.message });
  }
};

// Récupérer les inventaires avec écart
exports.getInventairesAvecEcart = async (req, res) => {
  try {
    const inventaires = await Inventaire.find({ 
      ecart: { $ne: 0 } 
    })
      .populate({
        path: 'traitement',
        populate: {
          path: 'produits.produit',
          model: 'Stock'
        }
      })
      .sort({ dateInventaire: -1 });

    res.status(200).json(inventaires);
  } catch (error) {
    console.error('Erreur lors de la récupération des inventaires avec écart:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des inventaires avec écart', 
      error: error.message 
    });
  }
};

// Récupérer les raisons d'écart disponibles
exports.getRaisonsEcart = async (req, res) => {
  try {
    // Les raisons d'écart sont définies dans le modèle Inventaire
    const raisonsEcart = ['Aucun écart', 'Pertes', 'Casses', 'Vols', 'Erreurs de saisie', 'Autre'];
    
    res.status(200).json(raisonsEcart);
  } catch (error) {
    console.error('Erreur lors de la récupération des raisons d\'écart:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des raisons d\'écart', 
      error: error.message 
    });
  }
};

// Récupérer les traitements disponibles pour l'inventaire
exports.getTraitementsPourInventaire = async (req, res) => {
  try {
    // Récupérer tous les traitements avec leurs produits
    const traitements = await Traitement.find()
      .populate('produits.produit')
      .populate('commande')
      .lean();

    // Récupérer tous les inventaires existants pour filtrer les produits déjà inventoriés
    const inventaires = await Inventaire.find().lean();
    
    // Créer un ensemble de paires traitementId-index pour suivre les produits déjà inventoriés
    const produitsInventories = new Set();
    inventaires.forEach(inv => {
      if (inv.traitement) {
        produitsInventories.add(`${inv.traitement.toString()}-${inv.produitIndex || 0}`);
      }
    });

    // Filtrer et formater les données pour le frontend
    const traitementsPourInventaire = traitements
      .map(traitement => {
        // Filtrer les produits qui n'ont pas encore été inventoriés
        const produitsNonInventories = traitement.produits
          .map((p, index) => ({ ...p, index }))
          .filter((p, index) => !produitsInventories.has(`${traitement._id.toString()}-${index}`));
        
        // Si tous les produits ont été inventoriés, ne pas inclure ce traitement
        if (produitsNonInventories.length === 0) {
          return null;
        }
        
        // Si le traitement n'a qu'un seul produit, l'inclure normalement
        // Si le traitement a plusieurs produits, l'inclure avec les produits non inventoriés
        return {
          _id: traitement._id,
          numeroBL: traitement.numeroBL,
          dateReception: traitement.dateReception,
          commande: traitement.commande ? traitement.commande.numeroCommande : 'N/A',
          produits: produitsNonInventories.map(p => ({
            produit: p.produit,
            quantiteCommandee: p.quantiteCommandee,
            quantiteRecue: p.quantiteRecue,
            index: p.index // Conserver l'index original pour référence
          })),
          nombreTotalProduits: traitement.produits.length,
          nombreProduitsRestants: produitsNonInventories.length
        };
      })
      .filter(Boolean); // Supprimer les traitements null (entièrement inventoriés)

    res.status(200).json(traitementsPourInventaire);
  } catch (error) {
    console.error('Erreur lors de la récupération des traitements pour inventaire:', error);
    res.status(500).json({ 
      message: 'Erreur lors de la récupération des traitements pour inventaire', 
      error: error.message 
    });
  }
};
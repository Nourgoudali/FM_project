const mongoose = require('mongoose');
const Inventaire = require('../models/Inventaire');
const Stock = require('../models/Stock');
const Commande = require('../models/Commande');
const Traitement = require('../models/Traitement');

// Créer un nouvel inventaire
exports.createInventaire = async (req, res) => {
  try {
    const { produits, notes, utilisateur } = req.body;
    
    // Afficher les informations de débogage détaillées
    console.log('Données reçues pour création d\'inventaire:', { 
      produits: produits?.length || 0, 
      notes, 
      utilisateurId: utilisateur,
      utilisateurReq: req.user?._id,
      headers: req.headers['authorization'] ? 'Token présent' : 'Token absent'
    });

    // Vérifier si les produits sont fournis
    if (!produits || !Array.isArray(produits) || produits.length === 0) {
      return res.status(400).json({ message: 'Vous devez fournir au moins un produit pour l\'inventaire' });
    }

    // Préparer les données des produits
    const produitsInventaire = [];
    const miseAJourStocks = [];

    // Vérifier chaque produit et préparer les données
    for (const item of produits) {
      const { produitId, quantiteComptee, stockTheorique, raisonEcart } = item;

      // Vérifier si le produit existe
      const produit = await Stock.findById(produitId);
      if (!produit) {
        return res.status(404).json({ message: `Produit avec ID ${produitId} non trouvé` });
      }

      // Utiliser le stock actuel comme stock théorique si non fourni
      const stockTheoriqueValue = stockTheorique !== undefined ? stockTheorique : produit.stockActuel;
      
      // Calculer l'écart
      const ecartValue = quantiteComptee - stockTheoriqueValue;
      
      // Déterminer la raison d'écart par défaut si non fournie
      let raisonEcartValue = raisonEcart;
      if (!raisonEcartValue) {
        raisonEcartValue = ecartValue === 0 ? 'Aucun écart' : 'Autre';
      }

      // Ajouter le produit à l'inventaire
      produitsInventaire.push({
        produit: produitId,
        quantiteComptee,
        stockTheorique: stockTheoriqueValue,
        ecart: ecartValue,
        raisonEcart: raisonEcartValue
      });

      // Préparer la mise à jour du stock
      miseAJourStocks.push({
        produitId,
        ecart: ecartValue
      });
    }

    // Vérifier si l'utilisateur est valide (doit être un ObjectId valide)
    let userId = null;
    if (utilisateur && mongoose.Types.ObjectId.isValid(utilisateur)) {
      userId = utilisateur;
      console.log('ID utilisateur valide fourni:', userId);
    } else if (req.user && req.user._id) {
      userId = req.user._id;
      console.log('Utilisation de l\'ID utilisateur de la session:', userId);
    } else {
      console.warn('Aucun ID utilisateur valide n\'a été fourni ou trouvé dans la session');
    }

    // Créer l'inventaire avec l'utilisateur valide
    const inventaire = new Inventaire({
      produits: produitsInventaire,
      notes,
      utilisateur: userId
    });
    
    // Log détaillé pour débogage
    console.log('Inventaire créé:', {
      id: inventaire._id,
      utilisateurId: inventaire.utilisateur,
      produitsCount: inventaire.produits.length,
      notes: inventaire.notes ? 'Présent' : 'Absent'
    });

    await inventaire.save();

    // Mettre à jour le stock de chaque produit en fonction de l'écart
    for (const update of miseAJourStocks) {
      await Stock.findByIdAndUpdate(
        update.produitId,
        { $inc: { stockActuel: update.ecart } }, // Ajuster le stock en fonction de l'écart
        { new: true }
      );
    }

    // Récupérer l'inventaire complet avec les détails des produits
    const inventaireComplet = await Inventaire.findById(inventaire._id)
      .populate('produits.produit')
      .populate('utilisateur');

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
      .populate('produits.produit')
      .populate('utilisateur')
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
      .populate('produits.produit')
      .populate('utilisateur');

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
    const { produits, notes } = req.body;

    const inventaire = await Inventaire.findById(req.params.id);
    if (!inventaire) {
      return res.status(404).json({ message: 'Inventaire non trouvé' });
    }

    // Mettre à jour les notes si fournies
    if (notes !== undefined) {
      inventaire.notes = notes;
    }

    // Mettre à jour les produits si fournis
    if (produits && Array.isArray(produits) && produits.length > 0) {
      // Stocker les anciennes valeurs pour pouvoir ajuster les stocks
      const anciensProduits = [...inventaire.produits];
      
      // Mettre à jour les produits de l'inventaire
      inventaire.produits = [];
      
      for (const item of produits) {
        const { produitId, quantiteComptee, stockTheorique, raisonEcart, ecart } = item;
        
        // Vérifier si le produit existe
        const produit = await Stock.findById(produitId);
        if (!produit) {
          return res.status(404).json({ message: `Produit avec ID ${produitId} non trouvé` });
        }
        
        // Ajouter le produit à l'inventaire
        inventaire.produits.push({
          produit: produitId,
          quantiteComptee,
          stockTheorique,
          ecart,
          raisonEcart
        });
        
        // Trouver l'ancien produit correspondant
        const ancienProduit = anciensProduits.find(p => p.produit.toString() === produitId);
        
        // Calculer l'ajustement de stock nécessaire
        if (ancienProduit) {
          const ajustement = ecart - ancienProduit.ecart;
          
          // Mettre à jour le stock si nécessaire
          if (ajustement !== 0) {
            await Stock.findByIdAndUpdate(
              produitId,
              { $inc: { stockActuel: ajustement } },
              { new: true }
            );
          }
        } else {
          // Nouveau produit ajouté à l'inventaire, mettre à jour le stock
          await Stock.findByIdAndUpdate(
            produitId,
            { $inc: { stockActuel: ecart } },
            { new: true }
          );
        }
      }
      
      // Gérer les produits supprimés
      for (const ancienProduit of anciensProduits) {
        const produitExisteTjs = produits.some(p => p.produitId === ancienProduit.produit.toString());
        
        if (!produitExisteTjs) {
          // Produit supprimé de l'inventaire, annuler l'ajustement de stock
          await Stock.findByIdAndUpdate(
            ancienProduit.produit,
            { $inc: { stockActuel: -ancienProduit.ecart } },
            { new: true }
          );
        }
      }
    }

    await inventaire.save();

    // Récupérer l'inventaire mis à jour avec les détails des produits
    const inventaireComplet = await Inventaire.findById(inventaire._id)
      .populate('produits.produit')
      .populate('utilisateur');

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
    // Rechercher les inventaires qui ont au moins un produit avec un écart non nul
    const inventaires = await Inventaire.find({
      'produits.ecart': { $ne: 0 }
    })
      .populate('produits.produit')
      .populate('utilisateur')
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

    // Récupérer tous les inventaires existants
    const inventaires = await Inventaire.find().lean();
    
    // Créer un ensemble des produits déjà inventoriés (par ID)
    const produitsInventories = new Set();
    inventaires.forEach(inv => {
      if (inv.produits && inv.produits.length > 0) {
        inv.produits.forEach(p => {
          if (p.produit) {
            produitsInventories.add(p.produit.toString());
          }
        });
      }
    });

    // Filtrer et formater les données pour le frontend
    const traitementsPourInventaire = traitements
      .map(traitement => {
        // Filtrer les produits qui n'ont pas encore été inventoriés
        const produitsNonInventories = traitement.produits
          .filter(p => p.produit && !produitsInventories.has(p.produit._id.toString()));
        
        // Si tous les produits ont été inventoriés, ne pas inclure ce traitement
        if (produitsNonInventories.length === 0) {
          return null;
        }
        
        return {
          _id: traitement._id,
          numeroBL: traitement.numeroBL,
          dateReception: traitement.dateReception,
          commande: traitement.commande ? traitement.commande.numeroCommande : 'N/A',
          produits: produitsNonInventories.map(p => ({
            produit: p.produit,
            quantiteCommandee: p.quantiteCommandee,
            quantiteRecue: p.quantiteRecue,
            stockActuel: p.produit ? p.produit.stockActuel : 0
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
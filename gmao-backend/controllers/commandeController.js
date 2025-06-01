const Commande = require('../models/Commande');
const Stock = require('../models/Stock');
const mongoose = require('mongoose');

// Récupérer toutes les commandes
exports.getAllCommandes = async (req, res) => {
  try {
    const commandes = await Commande.find()
      .populate('fournisseur')
      .populate('produits.produit')
      .sort({ dateCommande: -1 });
    
    res.status(200).json(commandes);
  } catch (error) {
    console.error('Erreur lors de la récupération des commandes:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des commandes' });
  }
};

// Récupérer une commande par son ID
exports.getCommandeById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de commande invalide' });
    }
    
    const commande = await Commande.findById(id)
      .populate('fournisseur')
      .populate('produits.produit');
    
    if (!commande) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    
    res.status(200).json(commande);
  } catch (error) {
    console.error('Erreur lors de la récupération de la commande:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération de la commande' });
  }
};

// Créer une nouvelle commande
exports.createCommande = async (req, res) => {
  try {
    const { fournisseur, devise, tva, numeroBL, produits } = req.body;
    
    // Vérification des données obligatoires
    if (!fournisseur || !devise || tva === undefined || !produits || !produits.length) {
      return res.status(400).json({ message: 'Données manquantes pour créer la commande' });
    }
    
    // Création de la nouvelle commande
    const nouvelleCommande = new Commande({
      fournisseur,
      devise,
      tva,
      numeroBL,
      produits,
      dateCommande: new Date()
    });
    
    // Sauvegarde de la commande
    const commandeSauvegardee = await nouvelleCommande.save();
    
    // Récupération de la commande avec les relations peuplées
    const commandeComplete = await Commande.findById(commandeSauvegardee._id)
      .populate('fournisseur')
      .populate('produits.produit');
    
    res.status(201).json(commandeComplete);
  } catch (error) {
    console.error('Erreur lors de la création de la commande:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de la commande' });
  }
};

// Mettre à jour une commande
exports.updateCommande = async (req, res) => {
  try {
    const { id } = req.params;
    const { fournisseur, devise, tva, numeroBL, produits } = req.body;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de commande invalide' });
    }
    
    // Vérification de l'existence de la commande
    const commandeExistante = await Commande.findById(id);
    if (!commandeExistante) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    
    // Mise à jour de la commande
    const commandeMiseAJour = await Commande.findByIdAndUpdate(
      id,
      {
        fournisseur,
        devise,
        tva,
        numeroBL,
        produits,
        updatedAt: new Date()
      },
      { new: true }
    )
    .populate('fournisseur')
    .populate('produits.produit');
    
    res.status(200).json(commandeMiseAJour);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la commande:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour de la commande' });
  }
};

// Supprimer une commande
exports.deleteCommande = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'ID de commande invalide' });
    }
    
    // Vérification de l'existence de la commande
    const commandeExistante = await Commande.findById(id);
    if (!commandeExistante) {
      return res.status(404).json({ message: 'Commande non trouvée' });
    }
    
    // Suppression de la commande
    await Commande.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Commande supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la commande:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression de la commande' });
  }
};

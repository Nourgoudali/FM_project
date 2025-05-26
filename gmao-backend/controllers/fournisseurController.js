const Fournisseur = require('../models/Fournisseur');

const fournisseurController = {
  // Créer un nouveau fournisseur
  createFournisseur: async (req, res) => {
    try {
      const { nomEntreprise, nom, prenom, email, telephone, adresse } = req.body;
      
      // Vérifier si un fournisseur avec cet email existe déjà
      const existingFournisseur = await Fournisseur.findOne({ email });
      if (existingFournisseur) {
        return res.status(400).json({ message: 'Un fournisseur avec cet email existe déjà' });
      }
      
      const fournisseur = new Fournisseur({
        nomEntreprise,
        nom,
        prenom,
        email,
        telephone,
        adresse
      });
      
      await fournisseur.save();
      res.status(201).json(fournisseur);
    } catch (err) {
      console.error('Erreur lors de la création du fournisseur:', err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Récupérer tous les fournisseurs
  getAllFournisseurs: async (req, res) => {
    try {
      const fournisseurs = await Fournisseur.find().sort({ nomEntreprise: 1 });
      res.json(fournisseurs);
    } catch (err) {
      console.error('Erreur lors de la récupération des fournisseurs:', err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Récupérer un fournisseur par son ID
  getFournisseurById: async (req, res) => {
    try {
      const fournisseur = await Fournisseur.findById(req.params.id);
      
      if (!fournisseur) {
        return res.status(404).json({ message: 'Fournisseur non trouvé' });
      }
      
      res.json(fournisseur);
    } catch (err) {
      console.error('Erreur lors de la récupération du fournisseur:', err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Mettre à jour un fournisseur
  updateFournisseur: async (req, res) => {
    try {
      const { nomEntreprise, nom, prenom, email, telephone, adresse } = req.body;
      
      // Vérifier si un autre fournisseur utilise déjà cet email
      const existingFournisseur = await Fournisseur.findOne({ 
        email, 
        _id: { $ne: req.params.id } 
      });
      
      if (existingFournisseur) {
        return res.status(400).json({ message: 'Un autre fournisseur utilise déjà cet email' });
      }
      
      const fournisseur = await Fournisseur.findByIdAndUpdate(
        req.params.id,
        {
          nomEntreprise,
          nom,
          prenom,
          email,
          telephone,
          adresse,
          updatedAt: Date.now()
        },
        { new: true, runValidators: true }
      );
      
      if (!fournisseur) {
        return res.status(404).json({ message: 'Fournisseur non trouvé' });
      }
      
      res.json(fournisseur);
    } catch (err) {
      console.error('Erreur lors de la mise à jour du fournisseur:', err);
      res.status(500).json({ message: err.message });
    }
  },
  
  // Supprimer un fournisseur
  deleteFournisseur: async (req, res) => {
    try {
      const fournisseur = await Fournisseur.findByIdAndDelete(req.params.id);
      
      if (!fournisseur) {
        return res.status(404).json({ message: 'Fournisseur non trouvé' });
      }
      
      res.json({ message: 'Fournisseur supprimé avec succès' });
    } catch (err) {
      console.error('Erreur lors de la suppression du fournisseur:', err);
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = fournisseurController;

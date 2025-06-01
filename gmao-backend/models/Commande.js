const mongoose = require('mongoose');

const commandeSchema = new mongoose.Schema({
  fournisseur: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Fournisseur', 
    required: true
  },
  devise: { 
    type: String, 
    enum: ['MAD', 'USD', 'EUR'], 
    required: true 
  },
  tva: { 
    type: Number, 
    required: true 
  },
  numeroCommande: { 
    type: String, 
    unique: true 
  },
  numeroBL: { 
    type: String 
  },
  dateCommande: { 
    type: Date, 
    default: Date.now 
  },
  produits: [{
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
      required: true
    },
    quantiteSouhaitee: {
      type: Number,
      required: true
    },
    quantiteMinCommande: {
      type: Number,
      required: true
    },
    prixUnitaire: {
      type: Number,
      required: true
    },
    remise: {
      type: Number,
      default: 0
    },
    total: {
      type: Number,
      required: true
    },
    ttc: {
      type: Number,
      required: true
    }
  }],
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  }
});

// Hook pour générer automatiquement un numéro de commande unique
commandeSchema.pre('save', async function(next) {
  if (this.isNew && !this.numeroCommande) {
    try {
      const latestCommande = await mongoose.model('Commande')
        .findOne()
        .sort({ createdAt: -1 })
        .select('numeroCommande');
      
      let nextNumber;
      if (latestCommande) {
        const match = latestCommande.numeroCommande.match(/CMD-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        } else {
          nextNumber = 1;
        }
      } else {
        nextNumber = 1;
      }
      
      this.numeroCommande = `CMD-${String(nextNumber).padStart(3, '0')}`;
      next();
    } catch (err) {
      console.error('Erreur lors de la génération du numéro de commande:', err);
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Commande', commandeSchema);

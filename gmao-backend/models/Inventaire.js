const mongoose = require('mongoose');
const inventaireSchema = new mongoose.Schema({
  produits: [{
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
      required: true
    },
    quantiteComptee: {
      type: Number,
      required: true
    },
    stockTheorique: {
      type: Number,
      required: true
    },
    ecart: {
      type: Number,
      default: function() {
        return this.quantiteComptee - this.stockTheorique;
      }
    },
    raisonEcart: {
      type: String,
      enum: ['Pertes', 'Casses', 'Vols', 'Erreurs de saisie', 'Autre', 'Aucun écart'],
      default: 'Aucun écart'
    }
  }],
  dateInventaire: {
    type: Date,
    default: Date.now
  },
  reference: {
    type: String,
    unique: true
  },
  notes: {
    type: String,
    trim: true
  },

  utilisateur: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
}, {
  timestamps: true
});



// Middleware pre-save pour générer automatiquement une référence
inventaireSchema.pre('save', async function(next) {
  // Générer une référence automatique si elle n'existe pas
  if (this.isNew && !this.reference) {
    try {
      const latestInventaire = await mongoose.model('Inventaire')
        .findOne()
        .sort({ createdAt: -1 })
        .select('reference');
      
      let nextNumber;
      if (latestInventaire) {
        const match = latestInventaire.reference.match(/INV-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        } else {
          nextNumber = 1;
        }
      } else {
        nextNumber = 1;
      }
      
      this.reference = `INV-${String(nextNumber).padStart(3, '0')}`;
    } catch (err) {
      console.error('Erreur lors de la génération de la référence d\'inventaire:', err);
      return next(err);
    }
  }
  
  next();
});


module.exports = mongoose.model('Inventaire', inventaireSchema);

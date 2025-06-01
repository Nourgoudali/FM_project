const mongoose = require('mongoose');

const traitementSchema = new mongoose.Schema({
  commande: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Commande',
    required: true
  },
  numeroBL: {
    type: String,
    required: true
  },
  dateReception: {
    type: Date,
    required: true
  },
  produits: [{
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Stock',
      required: true
    },
    quantiteCommandee: {
      type: Number,
      required: true
    },
    quantiteRecue: {
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

// Hook pour mettre à jour la date de modification
traitementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Traitement', traitementSchema);

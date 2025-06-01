const mongoose = require('mongoose');
 inventaireSchema = new mongoose.Schema({
  quantite: {
    type: Number,
    required: true,
    default: 0
  },
  stockTheorique: {
    type: Number,
    required: true,
    default: 0
  },
  ecart: {
    type: Number,
    default: function() {
      return this.quantite - this.stockTheorique;
    }
  },
  raisonEcart: {
    type: String,
    enum: ['Pertes',
  'Casses',
  'Vols',
  'Erreurs de saisie',
  'Autre',
  'Aucun écart'],
    default: 'Aucun écart'
  },
  dateInventaire: {
    type: Date,
    default: Date.now
  },
  lieuStockage:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Stock',
    required: true
  },
  traitement:{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Traitement',
    required: true
  },
  produitIndex: {
    type: Number,
    required: true,
    min: 0
  },
}, {
  timestamps: true
});

// Méthode virtuelle pour obtenir le nom du produit via le traitement
inventaireSchema.virtual('nomProduit').get(function() {
  if (this.traitement && this.traitement.produits && this.produitIndex !== undefined) {
    const produit = this.traitement.produits[this.produitIndex];
    if (produit && produit.produit) {
      return produit.produit.name || produit.produit.nom || null;
    }
  }
  return null;
});

// Calcul automatique de l'écart avant la sauvegarde
inventaireSchema.pre('save', function(next) {
  this.ecart = this.quantite - this.stockTheorique;
  
  // Si l'écart est 0, mettre automatiquement la raison à 'Aucun écart'
  if (this.ecart === 0 && this.raisonEcart !== 'Aucun écart') {
    this.raisonEcart = 'Aucun écart';
  }
  // Si l'écart n'est pas 0 et que la raison est 'Aucun écart', la changer à 'Autre'
  else if (this.ecart !== 0 && this.raisonEcart === 'Aucun écart') {
    this.raisonEcart = 'Autre';
  }
  
  next();
});

// Assurez-vous que les virtuals sont inclus lors de la conversion en JSON
inventaireSchema.set('toJSON', { virtuals: true });
inventaireSchema.set('toObject', { virtuals: true });

const Inventaire = mongoose.model('Inventaire', inventaireSchema);

module.exports = Inventaire;

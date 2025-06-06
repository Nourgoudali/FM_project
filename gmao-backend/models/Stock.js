const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  reference: { type: String, unique: true }, // Retiré required car généré automatiquement
  name: { type: String, required: true },
  catégorie: { type: String, required: true },
  prixUnitaire: { type: Number, required: true },
  prixEuro: { type: Number, default: 0 }, // Ajout du champ pour le prix en euros
  stockActuel: { type: Number, required: true },
  stockMin: { type: Number, required: true },
  stockMax: { type: Number, required: true },
  stockSecurite: { type: Number, required: true },
  lieuStockage: { type: String, required: true, trim: true },
  createdAt: { type: Date, default: Date.now },
});

stockSchema.pre('save', async function (next) {
  if (this.isNew && !this.reference) {
    try {
      const latestStock = await mongoose.model('Stock')
        .findOne()
        .sort({ createdAt: -1 })
        .select('reference');
      
      let nextNumber;
      if (latestStock) {
        const match = latestStock.reference.match(/PRD-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        } else {
          nextNumber = 1;
        }
      } else {
        nextNumber = 1;
      }
      
      this.reference = `PRD-${String(nextNumber).padStart(3, '0')}`;
      next();
    } catch (err) {
      console.error('Error generating stock reference:', err);
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Stock', stockSchema);
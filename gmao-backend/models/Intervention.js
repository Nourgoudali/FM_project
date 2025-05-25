const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  equipment: { type: String, required: true },
  type: { type: String, enum: ['Préventive', 'Curative', 'Corrective'], required: true },
  priority: { type: String, enum: ['Basse', 'Normale', 'Haute', 'Critique'], required: true },
  status: { type: String, enum: ['Planifiée', 'En cours', 'Terminée', 'Reportée'], default: 'Planifiée' },
  technician: {
    initials: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String, required: true }
  },
  date: { type: Date, required: true },
  description: { type: String },
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  strictPopulate: false
});

// Hook pour générer automatiquement une référence unique
interventionSchema.pre('save', async function (next) {
  if (this.isNew && !this.reference) {
    try {
      const latestIntervention = await mongoose.model('Intervention')
        .findOne()
        .sort({ createdAt: -1 })
        .select('reference');
      
      let nextNumber;
      if (latestIntervention) {
        const match = latestIntervention.reference.match(/INT-(\d+)/);
        if (match) {
          nextNumber = parseInt(match[1], 10) + 1;
        }
      } else {
        nextNumber = 1;
      }
      
      this.reference = `INT-${String(nextNumber).padStart(3, '0')}`;
      next();
    } catch (err) {
      console.error('Error generating intervention reference:', err);
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Intervention', interventionSchema);
const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  equipment: {type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true},
  type: { type: String, enum: ['Préventive', 'Curative', 'Corrective'], required: true },
  priority: { type: String, enum: ['Basse', 'Normale', 'Haute', 'Critique'], required: true },
  status: { type: String, enum: ['Planifiée', 'En cours', 'Terminée', 'Reportée'], default: 'Planifiée' },
  technician: {
    initials: { type: String, required: true },
    name: { type: String, required: true },
    color: { type: String, required: true }
  },
  startDate: { type: Date, required: true }, // Date de début obligatoire
  endDate: { type: Date }, // Date de fin facultative
  description: { type: String },
  location: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  strictPopulate: false
});

// Hook pour générer automatiquement une référence unique et déterminer le statut
interventionSchema.pre('save', async function (next) {
  // Génération de référence automatique pour les nouvelles interventions
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
        } else {
          nextNumber = 1;
        }
      } else {
        nextNumber = 1;
      }
      
      this.reference = `INT-${String(nextNumber).padStart(3, '0')}`;
    } catch (err) {
      console.error('Error generating intervention reference:', err);
      return next(err);
    }
  }
  
  // Détermination automatique du statut en fonction des dates
  const now = new Date();
  
  // Si la date de fin est définie, l'intervention est terminée
  if (this.endDate) {
    this.status = 'Terminée';
  } 
  // Si la date de début est dans le futur, l'intervention est planifiée
  else if (this.startDate > now) {
    this.status = 'Planifiée';
  } 
  // Si la date de début est passée ou aujourd'hui et pas de date de fin, l'intervention est en cours
  else {
    this.status = 'En cours';
  }
  
  next();
}
);

module.exports = mongoose.model('Intervention', interventionSchema);
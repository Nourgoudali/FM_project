const mongoose = require('mongoose');

const interventionSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  type: { type: String, enum: ['curative', 'preventive'], required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'delayed'], default: 'pending' },
  assignedTechnician: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  date: { type: Date, required: true },
  comment: { type: String },
  delayJustification: { type: String },
  createdAt: { type: Date, default: Date.now },
});

// Hook pour générer automatiquement une référence unique
interventionSchema.pre('save', async function (next) {
  if (this.isNew && !this.reference) {
    try {
      const count = await mongoose.model('Intervention').countDocuments();
      const nextNumber = count + 1;
      this.reference = `INT-${String(nextNumber).padStart(3, '0')}`;
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

module.exports = mongoose.model('Intervention', interventionSchema);
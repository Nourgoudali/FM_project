const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['maintenance', 'optimization', 'alert'], required: true },
  action: { type: String, enum: ['Planifier', 'Voir détails', 'Appliquer'], required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'planned', 'completed'], default: 'pending' },
  optimizationParams: [{
    name: String,
    currentValue: String,
    newValue: String,
    impact: String
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

recommendationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Recommendation', recommendationSchema);

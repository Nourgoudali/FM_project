const mongoose = require('mongoose');

const maintenanceTaskSchema = new mongoose.Schema({
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  description: { type: String, required: true },
  frequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'yearly'], required: true },
  lastPerformed: { type: Date },
  nextDue: { type: Date },
  priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
  status: { type: String, enum: ['pending', 'planned', 'completed', 'overdue'], default: 'pending' },
  requiredParts: [{
    name: String,
    reference: String,
    quantity: Number,
    inStock: Boolean,
    stockLevel: { type: String, enum: ['low', 'available'] }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

maintenanceTaskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('MaintenanceTask', maintenanceTaskSchema);

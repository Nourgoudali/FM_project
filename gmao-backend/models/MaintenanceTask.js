const mongoose = require('mongoose');

const MaintenanceTaskSchema = new mongoose.Schema({
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  periodicity: {
    type: String,
    required: true,
    enum: ['Mensuelle', 'Trimestrielle', 'Annuelle']
  },
  status: {
    type: String,
    required: true,
    enum: ['planned', 'completed'],
    default: 'planned'
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  validationDate: {
    type: Date
  }
}, { timestamps: true });

MaintenanceTaskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('MaintenanceTask', maintenanceTaskSchema);

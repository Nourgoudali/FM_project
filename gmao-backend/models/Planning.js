const mongoose = require('mongoose');

const planningSchema = new mongoose.Schema({
  intervention: {
    type: {
      title: { type: String, required: true },
      equipment: { type: String, required: true },
      provider: { type: String, required: true }
    },
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { 
    type: String, 
    enum: ['planned', 'completed', 'overdue'], 
    default: 'planned' 
  },
  color: { type: String, default: '#D3D3D3' }, // Default gray for planned
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Planning', planningSchema);
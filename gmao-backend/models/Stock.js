const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
  quantity: { type: Number, required: true, min: 0 },
  minThreshold: { type: Number, required: true, min: 0 },
  supplier: { type: String },
  leadTime: { type: Number }, // In days
  movements: [{
    type: { type: String, enum: ['entry', 'exit'], required: true },
    quantity: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    comment: { type: String },
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Stock', stockSchema);
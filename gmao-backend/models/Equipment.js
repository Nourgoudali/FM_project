const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  category: { type: String, required: true },
  location: { type: String, required: true },
  status: { type: String, enum: ['operational', 'maintenance', 'out_of_service'], default: 'operational' },
  brand: { type: String },
  comment: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Equipment', equipmentSchema);
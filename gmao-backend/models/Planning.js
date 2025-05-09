const mongoose = require('mongoose');

const planningSchema = new mongoose.Schema({
  intervention: { type: mongoose.Schema.Types.ObjectId, ref: 'Intervention', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['upcoming', 'in_progress', 'completed'], default: 'upcoming' },
  color: { type: String, default: '#FFFF00' }, // Yellow for upcoming, customizable
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Planning', planningSchema);
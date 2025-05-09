const mongoose = require('mongoose');

const logSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., "create_intervention"
  details: { type: String },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Log', logSchema);
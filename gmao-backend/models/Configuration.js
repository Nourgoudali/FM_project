const mongoose = require('mongoose');

const configurationSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true }, // e.g., "role_permissions", "ui_theme"
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // Flexible for JSON or strings
  description: { type: String },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Configuration', configurationSchema);
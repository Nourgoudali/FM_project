const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, required: true }, // e.g., manual, safety_sheet, certificate
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment' },
  fileUrl: { type: String, required: true }, // URL to stored file
  qrCode: { type: String, unique: true }, // QR code for access
  version: { type: Number, default: 1 },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Document', documentSchema);
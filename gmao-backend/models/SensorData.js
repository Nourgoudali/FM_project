const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
  equipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Equipment', required: true },
  metric: { type: String, required: true }, // e.g., temperature, vibration
  value: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
  alert: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('SensorData', sensorDataSchema);
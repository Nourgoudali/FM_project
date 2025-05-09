const mongoose = require('mongoose');

const kpiSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  interventionStats: {
    pending: { type: Number, default: 0 },
    inProgress: { type: Number, default: 0 },
    completed: { type: Number, default: 0 },
    delayed: { type: Number, default: 0 },
  },
  equipmentStats: {
    operational: { type: Number, default: 0 },
    maintenance: { type: Number, default: 0 },
    outOfService: { type: Number, default: 0 },
    averageUptime: { type: Number, default: 0 },
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('KPI', kpiSchema);
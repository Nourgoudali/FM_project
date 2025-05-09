const KPI = require('../models/KPI');
const Intervention = require('../models/Intervention');
const Equipment = require('../models/Equipment');

const kpiController = {
  generate: async (req, res) => {
    try {
      const interventionStats = await Intervention.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]).then(results => results.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {}));

      const equipmentStats = await Equipment.aggregate([
        { $group: { 
            _id: '$status', 
            count: { $sum: 1 },
            averageUptime: { $avg: '$availabilityScore.uptime' }
          } },
      ]).then(results => results.reduce((acc, { _id, count, averageUptime }) => ({
        ...acc,
        [_id]: count,
        averageUptime: averageUptime || 0,
      }), {}));

      const kpi = new KPI({
        interventionStats: {
          pending: interventionStats.pending || 0,
          inProgress: interventionStats.in_progress || 0,
          completed: interventionStats.completed || 0,
          delayed: interventionStats.delayed || 0,
        },
        equipmentStats: {
          operational: equipmentStats.operational || 0,
          maintenance: equipmentStats.maintenance || 0,
          outOfService: equipmentStats.out_of_service || 0,
          averageUptime: equipmentStats.averageUptime || 0,
        },
      });

      await kpi.save();
      res.status(201).json(kpi);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getLatest: async (req, res) => {
    try {
      const kpi = await KPI.findOne().sort({ createdAt: -1 });
      if (!kpi) return res.status(404).json({ message: 'No KPI data found' });
      res.json(kpi);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = kpiController;
const SensorData = require('../models/SensorData');

const sensorController = {
  create: async (req, res) => {
    const { equipment, metric, value } = req.body;
    try {
      const sensorData = new SensorData({
        equipment,
        metric,
        value,
        alert: value > 100, // Example threshold for alert
      });
      await sensorData.save();
      res.status(201).json(sensorData);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  getByEquipment: async (req, res) => {
    const { equipmentId } = req.params;
    try {
      const sensorData = await SensorData.find({ equipment: equipmentId }).sort({ timestamp: -1 });
      res.json(sensorData);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getAlerts: async (req, res) => {
    try {
      const alerts = await SensorData.find({ alert: true }).populate('equipment');
      res.json(alerts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = sensorController;
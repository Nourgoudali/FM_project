const Log = require('../models/Log');

const logController = {
  getAll: async (req, res) => {
    try {
      const logs = await Log.find().populate('user').sort({ timestamp: -1 });
      res.json(logs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getSystemLogs: async (req, res) => {
    try {
      const systemLogs = await Log.find({ type: 'system' }).sort({ timestamp: -1 });
      res.json(systemLogs);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = logController;
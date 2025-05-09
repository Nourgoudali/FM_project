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
};

module.exports = logController;
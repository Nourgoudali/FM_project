const Configuration = require('../models/Configuration');

const configurationController = {
  createOrUpdate: async (req, res) => {
    const { key, value, description } = req.body;
    try {
      const configuration = await Configuration.findOneAndUpdate(
        { key },
        { value, description, updatedBy: req.user.id, updatedAt: new Date() },
        { upsert: true, new: true }
      );
      res.json(configuration);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const configurations = await Configuration.find().populate('updatedBy');
      res.json(configurations);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const { key } = req.params;
    try {
      const configuration = await Configuration.findOneAndDelete({ key });
      if (!configuration) return res.status(404).json({ message: 'Configuration not found' });
      res.json({ message: 'Configuration deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = configurationController;
const Planning = require('../models/Planning');

const planningController = {
  create: async (req, res) => {
    const { intervention, startDate, endDate, status, color } = req.body;
    try {
      const planning = new Planning({ intervention, startDate, endDate, status, color });
      await planning.save();
      res.status(201).json(planning);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const plannings = await Planning.find().populate('intervention');
      res.json(plannings);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      const planning = await Planning.findByIdAndUpdate(id, updates, { new: true });
      if (!planning) return res.status(404).json({ message: 'Planning not found' });
      res.json(planning);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const planning = await Planning.findByIdAndDelete(id);
      if (!planning) return res.status(404).json({ message: 'Planning not found' });
      res.json({ message: 'Planning deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = planningController;
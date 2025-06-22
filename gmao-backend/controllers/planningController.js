const Planning = require('../models/Planning');

const planningController = {
  create: async (req, res) => {
    try {
      const planning = new Planning(req.body);
      await planning.save();
      res.status(201).json(planning);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const plannings = await Planning.find();
      res.json(plannings);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getById: async (req, res) => {
    const { id } = req.params;
    try {
      const planning = await Planning.findById(id);
      if (!planning) return res.status(404).json({ message: 'Planning not found' });
      res.json(planning);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    
    try {
      // Update status and calculate color based on status
      const planning = await Planning.findById(id);
      if (!planning) return res.status(404).json({ message: 'Planning not found' });

      // Update status
      planning.status = updates.status;
      
      // Update color based on status
      switch (updates.status) {
        case 'completed':
          planning.color = '#90EE90'; // Green
          break;
        case 'overdue':
          planning.color = '#FF6666'; // Red
          break;
        case 'planned':
          planning.color = '#D3D3D3'; // Gray
          break;
      }

      planning.updatedAt = new Date();
      await planning.save();
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
      res.json({ message: 'Planning deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = planningController;
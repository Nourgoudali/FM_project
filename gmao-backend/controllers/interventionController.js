const Intervention = require('../models/Intervention');

const interventionController = {
  create: async (req, res) => {
    const { reference, equipment, type, priority, date, comment } = req.body;
    try {
      const intervention = new Intervention({
        reference,
        equipment,
        type,
        priority,
        date,
        comment,
        assignedTechnician: req.user.role === 'technician' ? req.user.id : null,
      });
      await intervention.save();
      res.status(201).json(intervention);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const interventions = await Intervention.find().populate('equipment assignedTechnician');
      res.json(interventions);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const { status, delayJustification, ...updates } = req.body;
    try {
      if (status === 'delayed' && !delayJustification) {
        return res.status(400).json({ message: 'Delay justification is required' });
      }
      const intervention = await Intervention.findByIdAndUpdate(
        id,
        { ...updates, status, delayJustification },
        { new: true }
      );
      if (!intervention) return res.status(404).json({ message: 'Intervention not found' });
      res.json(intervention);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const intervention = await Intervention.findByIdAndDelete(id);
      if (!intervention) return res.status(404).json({ message: 'Intervention not found' });
      res.json({ message: 'Intervention deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = interventionController;
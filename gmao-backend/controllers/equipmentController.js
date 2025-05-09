const Equipment = require('../models/Equipment');

const equipmentController = {
  create: async (req, res) => {
    const { reference, name, category, location, status, brand, comment, image } = req.body;
    try {
      const equipment = new Equipment({ reference, name, category, location, status, brand, comment, image });
      await equipment.save();
      res.status(201).json(equipment);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const equipment = await Equipment.find();
      res.json(equipment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      const equipment = await Equipment.findByIdAndUpdate(id, updates, { new: true });
      if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
      res.json(equipment);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const equipment = await Equipment.findByIdAndDelete(id);
      if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
      res.json({ message: 'Equipment deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = equipmentController;
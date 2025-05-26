const Stock = require('../models/Stock');

const stockController = {
  create: async (req, res) => {
    const { name, equipment, quantity, minThreshold, supplier, leadTime } = req.body;
    try {
      const stock = new Stock({ name, equipment, quantity, minThreshold, supplier, leadTime });
      await stock.save();
      res.status(201).json(stock);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const stocks = await Stock.find().populate('equipment');
      res.json(stocks);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getById: async (req, res) => {
    const { id } = req.params;
    try {
      const stock = await Stock.findById(id).populate('equipment');
      if (!stock) return res.status(404).json({ message: 'Stock not found' });
      res.json(stock);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      const stock = await Stock.findByIdAndUpdate(id, updates, { new: true });
      if (!stock) return res.status(404).json({ message: 'Stock not found' });
      res.json(stock);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const stock = await Stock.findByIdAndDelete(id);
      if (!stock) return res.status(404).json({ message: 'Stock not found' });
      res.json({ message: 'Stock deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  addMovement: async (req, res) => {
    const { id } = req.params;
    const { type, quantity, comment } = req.body;
    try {
      const stock = await Stock.findById(id);
      if (!stock) return res.status(404).json({ message: 'Stock not found' });
      stock.movements.push({ type, quantity, comment });
      stock.quantity = type === 'entry' ? stock.quantity + quantity : stock.quantity - quantity;
      if (stock.quantity < 0) return res.status(400).json({ message: 'Insufficient stock' });
      await stock.save();
      res.json(stock);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  getLowStock: async (req, res) => {
    try {
      const lowStocks = await Stock.find({ quantity: { $lte: mongoose.Types.Long.fromString('$minThreshold') } });
      res.json(lowStocks);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = stockController;
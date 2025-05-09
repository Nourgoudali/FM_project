const PurchaseOrder = require('../models/PurchaseOrder');

const purchaseOrderController = {
  create: async (req, res) => {
    const { reference, stock, supplier, quantity, expectedDeliveryDate } = req.body;
    try {
      const purchaseOrder = new PurchaseOrder({
        reference,
        stock,
        supplier,
        quantity,
        expectedDeliveryDate,
        createdBy: req.user.id,
      });
      await purchaseOrder.save();
      res.status(201).json(purchaseOrder);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const purchaseOrders = await PurchaseOrder.find().populate('stock createdBy');
      res.json(purchaseOrders);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      const purchaseOrder = await PurchaseOrder.findByIdAndUpdate(id, updates, { new: true });
      if (!purchaseOrder) return res.status(404).json({ message: 'Purchase order not found' });
      res.json(purchaseOrder);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const purchaseOrder = await PurchaseOrder.findByIdAndDelete(id);
      if (!purchaseOrder) return res.status(404).json({ message: 'Purchase order not found' });
      res.json({ message: 'Purchase order deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = purchaseOrderController;
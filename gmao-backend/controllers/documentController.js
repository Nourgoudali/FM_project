const Document = require('../models/Document');

const documentController = {
  create: async (req, res) => {
    const { title, category, equipment, fileUrl, qrCode } = req.body;
    try {
      const document = new Document({ title, category, equipment, fileUrl, qrCode, uploadedBy: req.user.id });
      await document.save();
      res.status(201).json(document);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const documents = await Document.find().populate('equipment uploadedBy');
      res.json(documents);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      const document = await Document.findByIdAndUpdate(id, { ...updates, version: updates.version || 1 }, { new: true });
      if (!document) return res.status(404).json({ message: 'Document not found' });
      res.json(document);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const document = await Document.findByIdAndDelete(id);
      if (!document) return res.status(404).json({ message: 'Document not found' });
      res.json({ message: 'Document deleted' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};

module.exports = documentController;
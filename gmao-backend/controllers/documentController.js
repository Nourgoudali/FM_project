const Document = require('../models/Document');

const documentController = {
  // Fonction pour uploader un document
  upload: async (req, res) => {
    const { title, category, equipment, fileUrl, qrCode } = req.body;
    try {
      const document = new Document({ 
        title, 
        category, 
        equipment, 
        fileUrl, 
        qrCode, 
        uploadedBy: req.user._id,
        uploadDate: new Date()
      });
      await document.save();
      res.status(201).json(document);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  // Fonction pour récupérer tous les documents
  getAllDocuments: async (req, res) => {
    try {
      const documents = await Document.find().populate('equipment uploadedBy');
      res.json(documents);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Fonction pour récupérer un document par son ID
  getDocument: async (req, res) => {
    const { id } = req.params;
    try {
      const document = await Document.findById(id).populate('equipment uploadedBy');
      if (!document) return res.status(404).json({ message: 'Document not found' });
      res.json(document);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Fonction pour supprimer un document
  deleteDocument: async (req, res) => {
    const { id } = req.params;
    try {
      const document = await Document.findByIdAndDelete(id);
      if (!document) return res.status(404).json({ message: 'Document not found' });
      res.json({ message: 'Document deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Fonction pour récupérer les documents par équipement
  getDocumentsByEquipment: async (req, res) => {
    const { equipmentId } = req.params;
    try {
      const documents = await Document.find({ equipment: equipmentId }).populate('uploadedBy');
      res.json(documents);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // Anciennes fonctions conservées pour compatibilité
  create: async (req, res) => {
    return documentController.upload(req, res);
  },

  getAll: async (req, res) => {
    return documentController.getAllDocuments(req, res);
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
    return documentController.deleteDocument(req, res);
  }
};

module.exports = documentController;
const Document = require("../models/Document");
const Equipment = require("../models/Equipment");

const documentController = {
  // Créer un document avec fichier
  upload: async (req, res) => {
    try {
      const { title, description, category, equipment } = req.body;

      // Validation des champs obligatoires
      if (!title || !category) {
        return res.status(400).json({
          success: false,
          message: "Le titre et la catégorie sont obligatoires",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Aucun fichier n'a été téléchargé",
        });
      }

      // Vérifier l'équipement si fourni
      if (equipment) {
        const equipmentExists = await Equipment.findById(equipment);
        if (!equipmentExists) {
          return res.status(400).json({
            success: false,
            message: "L'équipement spécifié n'existe pas",
          });
        }
      }

      // Construire l'URL du fichier
      const fileUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

      // Créer le document
      const document = new Document({
        title,
        description: description || "",
        category,
        equipment: equipment || null,
        fileUrl,

        uploadedBy: req.user._id,
      });

      await document.save();

      // Populer les références
      const savedDocument = await Document.findById(document._id)
        .populate("equipment", "name reference")
        .populate("uploadedBy", "firstName lastName");

      res.status(201).json({
        success: true,
        data: savedDocument,
      });
    } catch (err) {
      console.error("Erreur lors de l'upload du document:", err);

      if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((val) => val.message);
        return res.status(400).json({
          success: false,
          message: "Erreur de validation",
          errors: messages,
        });
      }

      if (err.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Une erreur de duplication s'est produite",
        });
      }

      res.status(500).json({
        success: false,
        message: "Erreur serveur lors de la création du document",
      });
    }
  },

  // Récupérer tous les documents avec populate des équipements
  getAllDocuments: async (req, res) => {
    try {
      const documents = await Document.find({})
        .populate({
          path: 'equipment',
          select: 'name reference status',
          match: { archived: { $ne: true } } // Ne pas inclure les équipements archivés
        })
        .populate({
          path: 'uploadedBy',
          select: 'firstName lastName email'
        })
        .sort({ createdAt: -1 }); // Plus récents en premier

      // Filtrer les documents avec équipement null (si l'équipement a été supprimé ou archivé)
      const filteredDocuments = documents.filter(doc => 
        !doc.equipment || (doc.equipment && !doc.equipment.archived)
      );

      res.json({ 
        success: true, 
        count: filteredDocuments.length,
        data: filteredDocuments 
      });
    } catch (err) {
      console.error('Erreur lors de la récupération des documents:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des documents',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  // Récupérer un document par ID avec populate
  getDocumentById: async (req, res) => {
    try {
      const document = await Document.findById(req.params.id)
        .populate({
          path: 'equipment',
          select: 'name reference status location',
          match: { archived: { $ne: true } }
        })
        .populate('uploadedBy', 'firstName lastName email');

      if (!document) {
        return res.status(404).json({ 
          success: false, 
          message: 'Document non trouvé' 
        });
      }

      res.json({ success: true, data: document });
    } catch (err) {
      console.error('Erreur lors de la récupération du document:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération du document',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  // Récupérer les documents par équipement
  getDocumentsByEquipment: async (req, res) => {
    try {
      const { equipmentId } = req.params;
      
      // Vérifier que l'équipement existe et n'est pas archivé
      const equipment = await Equipment.findOne({ 
        _id: equipmentId, 
        archived: { $ne: true } 
      });

      if (!equipment) {
        return res.status(404).json({ 
          success: false, 
          message: 'Équipement non trouvé ou archivé' 
        });
      }

      const documents = await Document.find({ equipment: equipmentId })
        .populate('uploadedBy', 'firstName lastName')
        .sort({ createdAt: -1 });

      res.json({ 
        success: true, 
        count: documents.length,
        data: documents 
      });
    } catch (err) {
      console.error('Erreur lors de la récupération des documents par équipement:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la récupération des documents',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },

  // Supprimer un document
  deleteDocument: async (req, res) => {
    try {
      const document = await Document.findByIdAndDelete(req.params.id);
      
      if (!document) {
        return res.status(404).json({ 
          success: false, 
          message: 'Document non trouvé' 
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Document supprimé avec succès',
        data: { id: document._id }
      });
    } catch (err) {
      console.error('Erreur lors de la suppression du document:', err);
      res.status(500).json({ 
        success: false, 
        message: 'Erreur lors de la suppression du document',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
  },
};

module.exports = documentController;
const Equipment = require('../models/Equipment');

const equipmentController = {
  create: async (req, res) => {
    try {
      // Extraire les données du corps de la requête
      const { name, category, location, status, brand, model, serialNumber, purchaseDate, warrantyEnd, comment, description } = req.body;
      
      // Gérer l'image si elle est présente dans la requête
      let imagePath = null;
      if (req.files && req.files.length > 0) {
        // Trouver le fichier image dans les fichiers téléchargés
        const imageFile = req.files.find(file => file.fieldname === 'image');
        if (imageFile) {
          imagePath = `/uploads/${imageFile.filename}`;
        }
      }
      
      // Créer l'équipement avec les champs requis
      const equipment = new Equipment({ 
        name, 
        category, 
        location, 
        status: status || 'operational',
        brand,
        model,
        serialNumber,
        purchaseDate,
        warrantyEnd,
        comment,
        description,
        image: imagePath
      });

      // Save will trigger the pre-save hook that generates the reference
      await equipment.save();
      res.status(201).json(equipment);
    } catch (err) {
      console.error('Erreur lors de la création de l\'équipement:', err);
      res.status(400).json({ message: err.message });
    }
  },

  getAll: async (req, res) => {
    try {
      const equipment = await Equipment.find().lean(); // Use lean() to get plain JavaScript objects
      
      // Add healthScore to each equipment if it doesn't exist
      const equipmentWithHealth = equipment.map(eq => {
        if (!eq.healthScore) {
          // Generate a random health score for now (you should implement actual health calculation)
          eq.healthScore = Math.floor(Math.random() * 100);
        }
        return eq;
      });
      
      res.json(equipmentWithHealth);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const updates = { ...req.body };
    
    // Ensure reference is not being updated
    if (updates.reference) {
      return res.status(400).json({ message: 'Cannot update equipment reference' });
    }

    try {
      // Gérer l'image si elle est présente dans la requête
      if (req.files && req.files.length > 0) {
        // Trouver le fichier image dans les fichiers téléchargés
        const imageFile = req.files.find(file => file.fieldname === 'image');
        if (imageFile) {
          updates.image = `/uploads/${imageFile.filename}`;
        }
      }

      const equipment = await Equipment.findByIdAndUpdate(id, updates, { new: true });
      if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
      res.json(equipment);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'\u00e9quipement:', err);
      res.status(400).json({ message: err.message });
    }
  },

  // Add a new function to get equipment by reference
  getByReference: async (req, res) => {
    const { reference } = req.params;
    try {
      const equipment = await Equipment.findOne({ reference });
      if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
      res.json(equipment);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const equipment = await Equipment.findByIdAndDelete(id);
      if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
      res.json({ message: 'Equipment deleted' });
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  }
};

module.exports = equipmentController;
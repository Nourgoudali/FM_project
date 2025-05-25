const Equipment = require('../models/Equipment');

const equipmentController = {
  create: async (req, res) => {
    try {
      // Get form data
      const reference = req.body instanceof FormData 
        ? req.body.get('reference') 
        : req.body.reference;
      const name = req.body instanceof FormData 
        ? req.body.get('name') 
        : req.body.name;
      const category = req.body instanceof FormData 
        ? req.body.get('category') 
        : req.body.category;
      const location = req.body instanceof FormData 
        ? req.body.get('location') 
        : req.body.location;
      const status = req.body instanceof FormData 
        ? req.body.get('status') 
        : req.body.status || 'operational';
      const brand = req.body instanceof FormData 
        ? req.body.get('brand') 
        : req.body.brand || '';
      const comment = req.body instanceof FormData 
        ? req.body.get('description') 
        : req.body.description || '';
      const image = req.files?.image;

      // Validate required fields
      if (!reference || !name || !category || !location) {
        return res.status(400).json({ 
          message: 'Données manquantes',
          errors: {
            reference: !reference ? 'La référence est requise' : null,
            name: !name ? 'Le nom est requis' : null,
            category: !category ? 'La catégorie est requise' : null,
            location: !location ? 'La localisation est requise' : null
          }
        });
      }

      // Validate status
      if (!['operational', 'maintenance', 'out_of_service'].includes(status)) {
        return res.status(400).json({ 
          message: 'Status invalide',
          errors: {
            status: 'Le status doit être operational, maintenance ou out_of_service'
          }
        });
      }

      // Check if reference already exists
      const existingEquipment = await Equipment.findOne({ reference });
      if (existingEquipment) {
        return res.status(400).json({ 
          message: 'Référence déjà utilisée',
          errors: {
            reference: 'Cette référence est déjà utilisée par un autre équipement'
          }
        });
      }

      // Create equipment object
      const equipment = new Equipment({
        reference,
        name,
        category,
        location,
        status,
        brand,
        comment: comment || '',
        image: image ? image.path : undefined
      });

      await equipment.save();
      res.status(201).json(equipment);
    } catch (err) {
      console.error('Erreur lors de la création de l\'équipement:', err);
      
      res.status(500).json({ 
        message: 'Erreur lors de la création de l\'équipement',
        error: err.message
      });
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
    
    // Process FormData similar to create function
    const reference = req.body instanceof FormData 
      ? req.body.get('reference') 
      : req.body.reference;
    const name = req.body instanceof FormData 
      ? req.body.get('name') 
      : req.body.name;
    const category = req.body instanceof FormData 
      ? req.body.get('category') 
      : req.body.category;
    const location = req.body instanceof FormData 
      ? req.body.get('location') 
      : req.body.location;
    const status = req.body instanceof FormData 
      ? req.body.get('status') 
      : req.body.status;
    const brand = req.body instanceof FormData 
      ? req.body.get('brand') 
      : req.body.brand;
    const comment = req.body instanceof FormData 
      ? req.body.get('description') 
      : req.body.description;
    const image = req.files?.image;

    // Create updates object
    const updates = {
      reference,
      name,
      category,
      location,
      status,
      brand,
      comment,
      image: image ? image.path : undefined
    };

    // Remove undefined values
    Object.keys(updates).forEach(key => updates[key] === undefined && delete updates[key]);

    try {
      // Check if reference exists and belongs to a different equipment
      if (reference) {
        const existingEquipment = await Equipment.findOne({ reference });
        if (existingEquipment && existingEquipment._id.toString() !== id) {
          return res.status(400).json({ 
            message: 'Référence déjà utilisée',
            errors: {
              reference: 'Cette référence est déjà utilisée par un autre équipement'
            }
          });
        }
      }

      const equipment = await Equipment.findByIdAndUpdate(id, updates, { new: true });
      if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
      res.json(equipment);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'équipement:', err);
      res.status(500).json({ 
        message: 'Erreur lors de la mise à jour de l\'équipement',
        error: err.message
      });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;
    try {
      const equipment = await Equipment.findByIdAndDelete(id);
      if (!equipment) {
        return res.status(404).json({ message: 'Equipment not found' });
      }
      res.json({ message: 'Equipment deleted' });
    } catch (err) {
      console.error('Error deleting equipment:', err);
      res.status(500).json({ 
        message: 'Error deleting equipment',
        error: err.message
      });
    }
  },
};

module.exports = equipmentController;
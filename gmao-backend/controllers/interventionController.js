const Intervention = require('../models/Intervention');
const Equipment = require('../models/Equipment');

const interventionController = {
  create: async (req, res) => {
    console.log('Données reçues:', req.body);
    
    const {
      equipment,
      type,
      priority,
      startDate,
      endDate,
      description,
      location,
      technician
    } = req.body;

    try {
      // Validation des champs requis
      if (!equipment || !type || !priority || !startDate || !technician) {
        console.error('Validation failed:', {
          equipment: !equipment,
          type: !type,
          priority: !priority,
          startDate: !startDate,
          technician: !technician
        });
        return res.status(400).json({ 
          message: 'Données manquantes',
          errors: {
            equipment: !equipment ? 'L\'équipement est requis' : null,
            type: !type ? 'Le type est requis' : null,
            priority: !priority ? 'La priorité est requise' : null,
            startDate: !startDate ? 'La date de début est requise' : null,
            technician: !technician ? 'Le technicien est requis' : null
          }
        });
      }

      // Validation des types
      if (!['Préventive', 'Curative', 'Corrective'].includes(type)) {
        return res.status(400).json({ 
          message: 'Type invalide',
          errors: {
            type: 'Le type doit être Préventive, Curative ou Corrective'
          }
        });
      }

      // Validate priority
      if (!['Basse', 'Normale', 'Haute', 'Critique'].includes(priority)) {
        return res.status(400).json({ 
          message: 'Priorité invalide',
          errors: {
            priority: 'La priorité doit être Basse, Normale, Haute ou Critique'
          }
        });
      }

      // Validation du technicien
      if (!technician?.initials || !technician?.name || !technician?.color) {
        return res.status(400).json({ 
          message: 'Format invalide pour le technicien',
          errors: {
            technician: 'Le technicien doit avoir des initiales, un nom et une couleur'
          }
        });
      }

      // Validation de la date de début
      const parsedStartDate = new Date(startDate);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({ 
          message: 'Date de début invalide',
          errors: {
            startDate: 'La date de début n\'est pas valide'
          }
        });
      }
      
      // Validation de la date de fin si elle est fournie
      if (endDate) {
        const parsedEndDate = new Date(endDate);
        if (isNaN(parsedEndDate.getTime())) {
          return res.status(400).json({ 
            message: 'Date de fin invalide',
            errors: {
              endDate: 'La date de fin n\'est pas valide'
            }
          });
        }
        
        // Vérifier que la date de fin est après la date de début
        if (parsedEndDate < parsedStartDate) {
          return res.status(400).json({ 
            message: 'Date de fin invalide',
            errors: {
              endDate: 'La date de fin doit être après la date de début'
            }
          });
        }
      }

      // Create intervention object with required fields
      const intervention = new Intervention({
        equipment,
        type,
        priority,
        technician,
        startDate,
        endDate,
        description,
        location,
        status: 'Planifiée'
      });

      // Manually generate reference if not present
      if (!intervention.reference) {
        try {
          const latestIntervention = await Intervention.findOne()
            .sort({ createdAt: -1 })
            .select('reference');
          
          let nextNumber;
          if (latestIntervention) {
            const match = latestIntervention.reference.match(/INT-(\d+)/);
            if (match) {
              nextNumber = parseInt(match[1], 10) + 1;
            }
          } else {
            nextNumber = 1;
          }
          
          intervention.reference = `INT-${String(nextNumber).padStart(3, '0')}`;
        } catch (err) {
          console.error('Error generating intervention reference:', err);
          throw new Error('Failed to generate reference');
        }
      }

      // Save the intervention with the generated reference
      await intervention.save();
      
      // Récupérer l'intervention avec les données complètes de l'équipement peuplées
      const savedIntervention = await Intervention.findById(intervention._id)
        .populate('equipment');

      console.log('Intervention sauvegardée:', savedIntervention);
      res.status(201).json(savedIntervention);
    } catch (err) {
      console.error('Intervention creation error:', err);
      res.status(400).json({ 
        message: 'Failed to create intervention',
        error: err.message 
      });
    }
  },

  // Add KPI generation endpoint
  generateKPI: async (req, res) => {
    try {
      // Logique pour générer les KPIs
      const kpiData = await generateKPIs();
      res.status(200).json(kpiData);
    } catch (err) {
      console.error('KPI generation error:', err);
      res.status(500).json({ message: 'Failed to generate KPIs' });
    }
  },

  // Add get latest KPI endpoint
  getLatestKPI: async (req, res) => {
    try {
      // Logique pour récupérer les derniers KPIs
      const latestKPI = await getLatestKPIs();
      res.status(200).json(latestKPI);
    } catch (err) {
      console.error('KPI retrieval error:', err);
      res.status(500).json({ message: 'Failed to retrieve KPIs' });
    }
  },

  getAll: async (req, res) => {
    try {
      const interventions = await Intervention.find()
        .populate('equipment');
      res.json(interventions);
    } catch (err) {
      console.error('Error fetching interventions:', err);
      res.status(500).json({ 
        message: 'Error fetching interventions',
        error: err.message 
      });
    }
  },

  getById: async (req, res) => {
    const { id } = req.params;
    try {
      const intervention = await Intervention.findById(id)
        .populate('equipment');
      if (!intervention) return res.status(404).json({ message: 'Intervention not found' });
      res.json(intervention);
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

      // Ajouter updatedAt pour suivre les mises à jour
      const intervention = await Intervention.findByIdAndUpdate(
        id,
        { ...updates, status, delayJustification, updatedAt: Date.now() },
        { new: true }
      ).populate('equipment');

      if (!intervention) return res.status(404).json({ message: 'Intervention not found' });
      console.log('Intervention mise à jour:', intervention);
      res.json(intervention);
    } catch (err) {
      console.error('Erreur lors de la mise à jour de l\'intervention:', err);
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
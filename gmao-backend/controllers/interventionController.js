const Intervention = require('../models/Intervention');

const interventionController = {
  create: async (req, res) => {
    console.log('Données reçues:', req.body);
    
    const {
      equipment,
      type,
      priority,
      date,
      description,
      location,
      technician
    } = req.body;

    try {
      // Validation des champs requis
      if (!equipment || !type || !priority || !date || !technician) {
        console.error('Validation failed:', {
          equipment: !equipment,
          type: !type,
          priority: !priority,
          date: !date,
          technician: !technician
        });
        return res.status(400).json({ 
          message: 'Données manquantes',
          errors: {
            equipment: !equipment ? 'L\'équipement est requis' : null,
            type: !type ? 'Le type est requis' : null,
            priority: !priority ? 'La priorité est requise' : null,
            date: !date ? 'La date est requise' : null,
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

      // Validation de la date
      const parsedDate = new Date(date);
      if (isNaN(parsedDate.getTime())) {
        return res.status(400).json({ 
          message: 'Date invalide',
          errors: {
            date: 'La date n\'est pas valide'
          }
        });
      }

      // Create intervention object with required fields
      const intervention = new Intervention({
        equipment,
        type,
        priority,
        technician,
        date,
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

      console.log('Intervention sauvegardée:', intervention);
      res.status(201).json(intervention);
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
      const intervention = await Intervention.findById(id).populate('equipment');
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
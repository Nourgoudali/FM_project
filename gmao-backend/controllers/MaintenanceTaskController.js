const MaintenanceTask = require('../models/MaintenanceTask');
const Equipment = require('../models/Equipment');
const User = require('../models/User');

exports.createTask = async (req, res) => {
  try {
    const { equipmentId, description, frequency, requiredParts } = req.body;
    
    // Vérifier si l'équipement existe
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return res.status(404).json({ message: 'Équipement non trouvé' });
    }

    // Calculer la date de la prochaine maintenance
    const nextDue = new Date();
    switch (frequency.toLowerCase()) {
      case 'daily':
        nextDue.setDate(nextDue.getDate() + 1);
        break;
      case 'weekly':
        nextDue.setDate(nextDue.getDate() + 7);
        break;
      case 'monthly':
        nextDue.setMonth(nextDue.getMonth() + 1);
        break;
      case 'yearly':

      await maintenanceTask.save();
      res.status(201).json({ message: 'Maintenance créée avec succès', task: maintenanceTask });
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la création de la maintenance', error: error.message });
    }
  },

  getTasks: async (req, res) => {
    try {
      const tasks = await MaintenanceTask.find()
        .sort({ startDate: 1 });
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: 'Erreur lors de la récupération des tâches', error: error.message });
    }
  },

  validateTask: async (req, res) => {
    try {
      const { taskId } = req.params;
      const { userId } = req.body;
      console.log('Validation task:', { taskId, userId });

      // Vérifier que l'utilisateur est authentifié
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          message: 'Non authentifié'
        });
      }

      // Récupération de la tâche
      const task = await MaintenanceTask.findById(taskId);
      if (!task) {
        return res.status(404).json({ 
          status: 'error', 
          message: 'Tâche non trouvée' 
        });
      }

      // Vérification du statut
      if (task.status === 'completed') {
        return res.status(400).json({ 
          status: 'error', 
          message: 'Cette tâche est déjà validée' 
        });
      }

      // Vérification de la date
      const now = new Date();
      if (task.startDate < now) {
        return res.status(400).json({ 
          status: 'error', 
          message: 'La date de la tâche est déjà passée' 
        });
      }

      // Mise à jour du statut et des informations de validation
      task.status = 'completed';
      task.validatedBy = userId;
      task.validationDate = new Date();
      await task.save();

      res.json({ 
        status: 'success', 
        message: 'Tâche validée avec succès' 
      });
    } catch (error) {
      console.error('Erreur dans validateTask:', error);
      res.status(500).json({ 
        status: 'error', 
        message: 'Erreur lors de la validation de la tâche', 
        error: error.message 
      });
    }
  }
};

module.exports = MaintenanceTaskController;

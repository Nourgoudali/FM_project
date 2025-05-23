const KPI = require('../models/KPI');
const Intervention = require('../models/Intervention');
const Equipment = require('../models/Equipment');

const kpiController = {
  generate: async (req, res) => {
    try {
      const interventionStats = await Intervention.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]).then(results => results.reduce((acc, { _id, count }) => ({ ...acc, [_id]: count }), {}));

      const equipmentStats = await Equipment.aggregate([
        { $group: { 
            _id: '$status', 
            count: { $sum: 1 },
            averageUptime: { $avg: '$availabilityScore.uptime' }
          } },
      ]).then(results => results.reduce((acc, { _id, count, averageUptime }) => ({
        ...acc,
        [_id]: count,
        averageUptime: averageUptime || 0,
      }), {}));

      const kpi = new KPI({
        interventionStats: {
          pending: interventionStats.pending || 0,
          inProgress: interventionStats.in_progress || 0,
          completed: interventionStats.completed || 0,
          delayed: interventionStats.delayed || 0,
        },
        equipmentStats: {
          operational: equipmentStats.operational || 0,
          maintenance: equipmentStats.maintenance || 0,
          outOfService: equipmentStats.out_of_service || 0,
          averageUptime: equipmentStats.averageUptime || 0,
        },
      });

      await kpi.save();
      res.status(201).json(kpi);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getLatest: async (req, res) => {
    try {
      const kpi = await KPI.findOne().sort({ createdAt: -1 });
      if (!kpi) return res.status(404).json({ message: 'No KPI data found' });
      res.json(kpi);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // KPI spécifique à un équipement
  getEquipmentKPI: async (req, res) => {
    const { id } = req.params;
    try {
      // Obtenir les données de l'équipement
      const equipment = await Equipment.findById(id);
      if (!equipment) return res.status(404).json({ message: 'Equipment not found' });
      
      // Obtenir les interventions liées à cet équipement
      const interventions = await Intervention.find({ equipment: id });
      
      // Calculer les KPIs spécifiques à cet équipement
      const totalInterventions = interventions.length;
      const preventiveInterventions = interventions.filter(i => i.type === 'preventive').length;
      const correctiveInterventions = interventions.filter(i => i.type === 'corrective').length;
      const completedInterventions = interventions.filter(i => i.status === 'completed').length;
      
      // Calculer le MTBF (Mean Time Between Failures) si possible
      let mtbf = 0;
      if (correctiveInterventions > 1) {
        const failures = interventions
          .filter(i => i.type === 'corrective')
          .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
        
        if (failures.length > 1) {
          let totalTimeBetween = 0;
          for (let i = 1; i < failures.length; i++) {
            const timeDiff = new Date(failures[i].startDate) - new Date(failures[i-1].endDate);
            totalTimeBetween += timeDiff;
          }
          mtbf = totalTimeBetween / (failures.length - 1) / (1000 * 60 * 60 * 24); // en jours
        }
      }
      
      res.json({
        equipmentId: id,
        equipmentName: equipment.name,
        status: equipment.status,
        installDate: equipment.installDate,
        totalInterventions,
        preventiveInterventions,
        correctiveInterventions,
        completedInterventions,
        availabilityRate: equipment.availabilityScore?.uptime || 0,
        mtbf
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // KPIs liés à la fiabilité
  getReliabilityKPI: async (req, res) => {
    try {
      // Extraire les données d'intervention
      const interventions = await Intervention.find().populate('equipment');
      const equipments = await Equipment.find();
      
      // Calculer le MTBF global
      const correctiveInterventions = interventions.filter(i => i.type === 'corrective');
      const totalOperationalTime = equipments.reduce((sum, eq) => 
        sum + ((eq.availabilityScore?.uptime || 0) * 24 * 365), 0); // en heures sur une année
      
      const mtbf = correctiveInterventions.length > 0 
        ? totalOperationalTime / correctiveInterventions.length
        : totalOperationalTime;
        
      // Calculer le taux d'échec (nombre de pannes / nombre total d'équipements)
      const failureRate = equipments.length > 0 
        ? correctiveInterventions.length / equipments.length
        : 0;
        
      // Calculer l'efficacité de la maintenance préventive
      const preventiveInterventions = interventions.filter(i => i.type === 'preventive').length;
      const preventiveRatio = interventions.length > 0 
        ? preventiveInterventions / interventions.length
        : 0;
        
      res.json({
        mtbf,
        failureRate,
        preventiveMaintenanceRatio: preventiveRatio,
        totalEquipments: equipments.length,
        totalCorrectiveInterventions: correctiveInterventions.length,
        totalPreventiveInterventions: preventiveInterventions
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  // KPIs liés à la maintenance
  getMaintenanceKPI: async (req, res) => {
    try {
      // Obtenir toutes les interventions
      const interventions = await Intervention.find();
      
      // Calculer le temps moyen de réparation (MTTR)
      let totalRepairTime = 0;
      let completedInterventions = 0;
      
      interventions.forEach(intervention => {
        if (intervention.status === 'completed' && intervention.startDate && intervention.endDate) {
          const repairTime = (new Date(intervention.endDate) - new Date(intervention.startDate)) / (1000 * 60 * 60); // en heures
          totalRepairTime += repairTime;
          completedInterventions++;
        }
      });
      
      const mttr = completedInterventions > 0 ? totalRepairTime / completedInterventions : 0;
      
      // Taux de résolution au premier niveau
      const firstLevelInterventions = interventions.filter(i => i.level === 'level1').length;
      const firstLevelResolved = interventions.filter(i => i.level === 'level1' && i.status === 'completed').length;
      const firstLevelResolutionRate = firstLevelInterventions > 0 
        ? firstLevelResolved / firstLevelInterventions
        : 0;
        
      // Coût moyen des interventions
      const totalCost = interventions.reduce((sum, i) => sum + (i.cost || 0), 0);
      const averageCost = interventions.length > 0 ? totalCost / interventions.length : 0;
      
      res.json({
        mttr,
        firstLevelResolutionRate,
        averageInterventionCost: averageCost,
        totalInterventions: interventions.length,
        completedInterventions,
        pendingInterventions: interventions.filter(i => i.status === 'pending').length,
        inProgressInterventions: interventions.filter(i => i.status === 'in_progress').length
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

module.exports = kpiController;
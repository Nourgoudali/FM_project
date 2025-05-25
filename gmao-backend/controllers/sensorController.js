const SensorData = require('../models/SensorData');
const Recommendation = require('../models/Recommendation');

const sensorController = {
  create: async (req, res) => {
    const { equipment, metric, value } = req.body;
    try {
      const sensorData = new SensorData({
        equipment,
        metric,
        value,
        alert: value > 100, // Example threshold for alert
        timestamp: new Date()
      });
      await sensorData.save();
      
      // Generate recommendations based on sensor data
      await generateRecommendations(equipment, metric, value);
      
      res.status(201).json(sensorData);
    } catch (err) {
      console.error('Error creating sensor data:', err);
      res.status(500).json({ message: err.message });
    }
  },

  getSensorsByEquipment: async (req, res) => {
    const { equipmentId } = req.params;
    try {
      const query = { equipment: equipmentId };
      
      // Get all sensor data for this equipment
      const sensorData = await SensorData.find(query)
        .sort({ timestamp: -1 })
        .lean();

      res.json(sensorData);
    } catch (err) {
      console.error('Error fetching sensor data:', err);
      res.status(500).json({ message: 'Error fetching sensor data' });
    }
  },

  getAlerts: async (req, res) => {
    try {
      const alerts = await SensorData.find({ alert: true })
        .sort({ timestamp: -1 })
        .lean();

      res.json(alerts);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      res.status(500).json({ message: 'Error fetching alerts' });
    }
  },

  getRecommendationsForEquipment: async (req, res) => {
    const { equipmentId } = req.params;
    try {
      const recommendations = await Recommendation.find({ equipment: equipmentId })
        .sort({ timestamp: -1 })
        .lean();

      res.json(recommendations);
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      res.status(500).json({ message: 'Error fetching recommendations' });
    }
  },

  applyOptimization: async (req, res) => {
    const { equipmentId } = req.params;
    const { parameters } = req.body;
    try {
      // Create a new recommendation
      const recommendation = new Recommendation({
        equipment: equipmentId,
        type: 'optimization',
        parameters,
        timestamp: new Date()
      });

      await recommendation.save();
      res.json(recommendation);
    } catch (err) {
      console.error('Error applying optimization:', err);
      res.status(500).json({ message: 'Error applying optimization' });
    }
  },

  getSensorData: async (req, res) => {
    const { equipmentId } = req.params;
    try {
      const query = { equipment: equipmentId };
      const sort = { timestamp: -1 };

      const sensorData = await SensorData.find(query)
        .sort(sort)
        .populate('equipment');
      
      // Organize data by metric
      const organizedData = {
        vibration: [],
        temperature: [],
        current: []
      };
      
      sensorData.forEach(reading => {
        organizedData[reading.metric].push({
          value: reading.value,
          timestamp: reading.timestamp
        });
      });
      
      res.json(organizedData);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getRecommendationsForEquipment: async (req, res) => {
    const { equipmentId } = req.params;
    try {
      const recommendations = await Recommendation.find({ equipment: equipmentId })
        .sort({ createdAt: -1 })
        .populate('equipment');
      res.json(recommendations);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  applyOptimization: async (req, res) => {
    const { equipmentId } = req.params;
    const { optimizationParams } = req.body;
    
    try {
      // Apply optimization logic here
      // This is a placeholder for actual optimization implementation
      const response = {
        message: 'Optimization applied successfully',
        equipmentId,
        parametersUpdated: optimizationParams.map(param => ({
          name: param.name,
          oldValue: param.currentValue,
          newValue: param.newValue,
          status: 'success'
        }))
      };
      
      // Create optimization recommendation
      const recommendation = new Recommendation({
        equipment: equipmentId,
        title: 'Optimization Applied',
        description: 'Energy optimization parameters have been successfully updated',
        type: 'optimization',
        action: 'Appliquer',
        status: 'completed',
        optimizationParams
      });
      
      await recommendation.save();
      
      res.json(response);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  getAlerts: async (req, res) => {
    try {
      const alerts = await SensorData.find({ alert: true })
        .populate('equipment')
        .sort({ timestamp: -1 });
      res.json(alerts);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
};

// Helper function to generate recommendations based on sensor data
const generateRecommendations = async (equipmentId, metric, value) => {
  try {
    // Basic threshold-based recommendations
    if (metric === 'vibration' && value > 1.5) {
      const recommendation = new Recommendation({
        equipment: equipmentId,
        title: 'High Vibration Detected',
        description: 'Vibration levels have exceeded normal thresholds',
        type: 'maintenance',
        action: 'Planifier',
        priority: 'high',
        optimizationParams: []
      });
      await recommendation.save();
    }
    
    if (metric === 'temperature' && value > 60) {
      const recommendation = new Recommendation({
        equipment: equipmentId,
        title: 'Temperature Warning',
        description: 'Temperature has exceeded safe operating limits',
        type: 'maintenance',
        action: 'Planifier',
        priority: 'high',
        optimizationParams: []
      });
      await recommendation.save();
    }
    
    if (metric === 'current' && value > 12) {
      const recommendation = new Recommendation({
        equipment: equipmentId,
        title: 'High Current Consumption',
        description: 'Current consumption is above normal levels',
        type: 'optimization',
        action: 'Appliquer',
        priority: 'medium',
        optimizationParams: [
          { name: 'Current Limit', currentValue: '12A', newValue: '10A', impact: '-20%' }
        ]
      });
      await recommendation.save();
    }
  } catch (err) {
    console.error('Error generating recommendations:', err);
  }
};

module.exports = sensorController;
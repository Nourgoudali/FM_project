const express = require('express');
const router = express.Router();
const KPI = require('../models/KPI');
const auth = require('../middleware/auth');

// Récupérer les derniers KPIs
router.get('/latest', auth, async (req, res) => {
  try {
    const kpis = await KPI.find()
      .sort({ createdAt: -1 })
      .limit(10); // Limite à 10 derniers KPIs
    
    res.json(kpis);
  } catch (error) {
    console.error('Erreur lors de la récupération des KPIs:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;

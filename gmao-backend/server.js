const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const multer = require('multer');
const userRoutes = require('./routes/userRoutes');
const interventionRoutes = require('./routes/interventionRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');
const stockRoutes = require('./routes/stockRoutes');
const planningRoutes = require('./routes/planningRoutes');
const documentRoutes = require('./routes/documentRoutes');
const purchaseOrderRoutes = require('./routes/purchaseOrderRoutes');
const kpiRoutes = require('./routes/kpiRoutes');
const sensorRoutes = require('./routes/sensorRoutes');
const logRoutes = require('./routes/logRoutes');
const configurationRoutes = require('./routes/configurationRoutes');
const fournisseurRoutes = require('./routes/fournisseursRoutes');
const commandeRoutes = require('./routes/commandeRoutes');
const traitementRoutes = require('./routes/traitementRoutes');
const inventaireRoutes = require('./routes/inventaireRoutes');
const initializePdrCategories = require('./middleware/pdrCategoriesMiddleware');
const pdrRoutes = require('./routes/pdrRoutes');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Configuration CORS mise à jour
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'], // List your frontend URLs here
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers'],
  exposedHeaders: ['Access-Control-Allow-Origin', 'Access-Control-Allow-Methods', 'Access-Control-Allow-Headers'],
  credentials: true
}));

app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Middleware pour gérer les requêtes OPTIONS et les en-têtes CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Gérer les requêtes OPTIONS (préflight)
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Configuration pour servir les fichiers statiques
app.use('/uploads', express.static('uploads'));

// Middleware pour parser le JSON et les données de formulaire
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully');
    // Initialiser les catégories PDR après la connexion réussie
    app.use('/', initializePdrCategories);
  })
  .catch(() => console.error('MongoDB connection failed'));

// Apply Routes
app.use('/api/users', userRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/kpi', kpiRoutes);
app.use('/api/sensors', sensorRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/configurations', configurationRoutes);
app.use('/api/fournisseurs', fournisseurRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/traitements', traitementRoutes);
app.use('/api/inventaires', inventaireRoutes);
app.use('/api/pdr', pdrRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Server Setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
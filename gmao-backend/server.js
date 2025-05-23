const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
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

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// ✅ Correct CORS configuration
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'], // List your frontend URLs here
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json());

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected successfully'))
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

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Server Setup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
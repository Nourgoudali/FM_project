# Documentation Technique GMAO

## Architecture Backend

### Structure des Controllers
```javascript
// stockController.js
const stockController = {
  create: async (req, res) => { /* Création d'article */ },
  getAll: async (req, res) => { /* Récupération de tous les articles */ },
  getById: async (req, res) => { /* Récupération d'un article par ID */ },
  update: async (req, res) => { /* Mise à jour d'un article */ },
  delete: async (req, res) => { /* Suppression d'un article */ },
  getPdrCategories: async (req, res) => { /* Récupération des catégories PDR */ }
};
```

### Modèles de Données
```javascript
// Stock.js
const StockSchema = new mongoose.Schema({
  name: { type: String, required: true },
  pdrCategory: { 
    type: String, 
    required: true,
    enum: ['Fluidique', 'Électrotechnique', 'Maintenance générale']
  },
  prixUnitaire: { type: Number, required: true },
  stockActuel: { type: Number, required: true },
  stockMin: { type: Number, required: true },
  stockMax: { type: Number, required: true },
  stockSecurite: { type: Number, required: true },
  lieuStockage: { type: String, required: true },
  prixEuro: { type: Number, default: 0 },
  reference: { type: String, unique: true }
});
```

## Architecture Frontend

### Structure des Composants
```jsx
// AddStockItemForm.jsx
function AddStockItemForm({ item = null, onSubmit, onCancel, isEdit = false }) {
  const pdrCategories = ['Fluidique', 'Électrotechnique', 'Maintenance générale'];
  // ...
  return (
    <form onSubmit={handleSubmit}>
      {/* Formulaire avec champs pour tous les attributs */}
    </form>
  );
}
```

### Gestion des États
```jsx
// StockManagementPage.jsx
const StockManagementPage = () => {
  const [stockItems, setStockItems] = useState([]);
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    minQuantity: "",
    maxQuantity: ""
  });
  // ...
};
```

## Services API
```javascript
// api.js
const stockAPI = {
  createStock: async (data) => await axios.post('/api/stock', data),
  getAllStocks: async () => await axios.get('/api/stock'),
  updateStock: async (id, data) => await axios.put(`/api/stock/${id}`, data),
  deleteStock: async (id) => await axios.delete(`/api/stock/${id}`),
  getPdrCategories: async () => await axios.get('/api/stock/categories')
};
```

## Middleware
```javascript
// pdrCategoriesMiddleware.js
const initializePdrCategories = async (req, res, next) => {
  try {
    const defaultCategories = ['Fluidique', 'Électrotechnique', 'Maintenance générale'];
    const existingCategories = await Stock.distinct('pdrCategory');
    
    // Créer les catégories manquantes
    const missingCategories = defaultCategories.filter(
      category => !existingCategories.includes(category)
    );

    if (missingCategories.length > 0) {
      console.log(`Création des catégories PDR manquantes: ${missingCategories.join(', ')}`);
      // Créer des articles "dummy" pour chaque catégorie manquante
      for (const category of missingCategories) {
        await Stock.create({
          name: `Article ${category} (Dummy)`,
          pdrCategory: category,
          prixUnitaire: 0,
          stockActuel: 0,
          stockMin: 0,
          stockMax: 0,
          stockSecurite: 0,
          lieuStockage: `Magasin ${category}`
        });
      }
    }
    next();
  } catch (error) {
    console.error('Erreur lors de l\'initialisation des catégories PDR:', error);
    next();
  }
};
```

## Validation des Données
```javascript
// Validation des catégories PDR
const validCategories = ['Fluidique', 'Électrotechnique', 'Maintenance générale'];

// Validation côté frontend
if (!validCategories.includes(formData.pdrCategory)) {
  throw new Error("Catégorie PDR invalide");
}

// Validation côté backend
if (!validCategories.includes(req.body.pdrCategory)) {
  return res.status(400).json({ message: 'Catégorie PDR invalide' });
}
```

## Gestion des Erreurs
```javascript
// Gestion des erreurs API
try {
  const response = await apiCall();
  // ...
} catch (error) {
  toast.error(error.response?.data?.message || "Une erreur est survenue");
  throw error;
}

// Middleware d'erreur Express
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});
```

## Déploiement

### Variables d'Environnement
```bash
# .env
PORT=5000
MONGO_URI=mongodb://localhost:27017/gmao
JWT_SECRET=votre-secret-jwt
```

### Scripts NPM
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "client": "cd client && npm start",
    "dev:full": "concurrently \"npm run dev\" \"npm run client\""
  }
}
```

## Tests

### Tests Unitaires
```javascript
// stockController.test.js
describe('Stock Controller', () => {
  it('should create a new stock item', async () => {
    const mockData = {
      name: 'Test Item',
      pdrCategory: 'Fluidique',
      // ... autres champs
    };
    const result = await stockController.create(mockData);
    expect(result).toBeDefined();
  });
});
```

### Tests d'API
```javascript
// api.test.js
it('should get all stock items', async () => {
  const response = await request(app).get('/api/stock');
  expect(response.status).toBe(200);
  expect(response.body).toBeInstanceOf(Array);
});
```

## Maintenance

### Logs
```javascript
// Logging
const logger = require('winston');
logger.info('Opération réussie');
logger.error('Erreur lors de l\'opération');
```

### Backup
```bash
# Script de backup MongoDB
mongodump --uri="mongodb://localhost:27017/gmao" --out=/backup/gmao
```

## Mises à Jour

### Migration de la Base de Données
```javascript
// migrations/20250706_add_new_field.js
module.exports = {
  up: async (db) => {
    await db.collection('stocks').updateMany({}, {
      $set: { newField: defaultValue }
    });
  },
  down: async (db) => {
    await db.collection('stocks').updateMany({}, {
      $unset: { newField: 1 }
    });
  }
};
```

### Versioning
```json
{
  "version": "1.0.0",
  "name": "gmao-system",
  "description": "Système de Gestion de Maintenance Assistée par Ordinateur",
  "main": "server.js"
}
```

## Documentation API

### Documentation Swagger
```yaml
# swagger.yaml
openapi: 3.0.0
info:
  title: GMAO API
  version: 1.0.0
paths:
  /api/stock:
    get:
      summary: Récupère tous les articles en stock
      responses:
        '200':
          description: Liste des articles
```

## Sécurité

### Configuration Helmet
```javascript
// Security middleware
app.use(helmet());
app.use(cors());
app.use(xss());
app.use(rateLimit());
```

### Validation des Données
```javascript
// Validation middleware
const validateStock = (req, res, next) => {
  const { error } = Joi.validate(req.body, stockSchema);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};
```

## Monitoring

### Métriques
```javascript
// Monitoring middleware
const metrics = require('express-metrics');
app.use(metrics());
```

### Logs d'Application
```javascript
// Logging configuration
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});
```

## Optimisation

### Caching
```javascript
// Redis caching
const redis = require('redis');
const client = redis.createClient();

app.get('/api/stock', async (req, res) => {
  const cacheKey = 'stock_items';
  const cachedData = await client.get(cacheKey);
  if (cachedData) {
    return res.json(JSON.parse(cachedData));
  }
  // ... logique pour récupérer les données
});
```

### Compression
```javascript
// Compression middleware
app.use(compression());
```

## Débogage

### Debug Mode
```javascript
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
```

### Profiling
```javascript
// Performance profiling
const profiler = require('v8-profiler-next');
profiler.startProfiling('profile');
// ... code à profiler
const profile = profiler.stopProfiling('profile');
profile.export().then(data => {
  console.log(data);
});
```

## Développement

### Scripts Utiles
```json
{
  "scripts": {
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "jest",
    "test:watch": "jest --watch",
    "coverage": "jest --coverage"
  }
}
```

### Configuration ESLint
```json
{
  "extends": "airbnb",
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "warn"
  }
}
```

### Configuration Prettier
```json
{
  "semi": true,
  "tabWidth": 2,
  "printWidth": 100,
  "singleQuote": true
}
```

## Déploiement Continu

### Configuration CI/CD
```yaml
# .github/workflows/ci.yml
name: CI
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Dependencies
        run: npm install
      - name: Run Tests
        run: npm test
      - name: Build
        run: npm run build
```

### Déploiement
```bash
# Script de déploiement
npm run build
scp -r build/ user@server:/var/www/gmao
```

## Support et Maintenance

### Documentation des Erreurs
```javascript
// Error handling
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
};
```

### Monitoring des Erreurs
```javascript
// Error tracking
const sentry = require('@sentry/node');
sentry.init({
  dsn: 'your-sentry-dsn',
  environment: process.env.NODE_ENV
});
```

## Optimisations Futures

### Points d'Amélioration
1. **Performance**:
   - Implémenter un système de pagination
   - Optimiser les requêtes MongoDB
   - Ajouter un système de cache plus robuste

2. **Sécurité**:
   - Ajouter une authentification plus robuste
   - Implémenter des politiques de sécurité plus strictes
   - Ajouter des tests de sécurité

3. **Extensibilité**:
   - Ajouter des plugins pour des fonctionnalités personnalisées
   - Créer une API REST complète
   - Ajouter des intégrations avec d'autres systèmes

4. **Maintenance**:
   - Ajouter des scripts d'automatisation
   - Améliorer la documentation
   - Ajouter des tests unitaires et d'intégration

import axios from 'axios';

// Configuration de base d'axios
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000 // 10 second timeout
});

// Ajouter un intercepteur pour les requêtes
API.interceptors.request.use(
  async config => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }

      return config;
    } catch (error) {
      console.error('Erreur lors de la configuration de la requête:', error);
      return config;
    }
  },
  error => {
    console.error('Erreur dans l\'intercepteur de requête:', error);
    return Promise.reject(error);
  }
);

// Ajouter un intercepteur pour les réponses
API.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    if (error.response) {
      console.error('Erreur API:', error.response.status, error.response.data);
      
      // Si c'est une erreur 401 et qu'on a un refresh token
      if (error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;
        
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          
          if (user.refreshToken) {
            const refreshResponse = await API.post('/auth/refresh', {
              refreshToken: user.refreshToken
            });

            const updatedUser = { ...user, token: refreshResponse.data.token };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            originalRequest.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            return API(originalRequest);
          }
        } catch (refreshError) {
          console.error('Erreur lors du refresh du token:', refreshError);
          localStorage.removeItem('user');
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    } else {
      console.error('Erreur réseau:', error.message);
    }

    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs
API.interceptors.response.use(
  response => response,
  error => {
    console.error('Erreur API:', error.message);
    return Promise.reject(error);
  }
);

// Intercepteur pour ajouter le token JWT à chaque requête
API.interceptors.request.use(
  config => {
    try {
      // Récupérer l'objet utilisateur complet du localStorage
      const userData = localStorage.getItem('user');
      
      if (userData) {
        const user = JSON.parse(userData);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
          // Ajouter le refresh token si présent
          if (user.refreshToken) {
            config.headers['X-Refresh-Token'] = user.refreshToken;
          }
        }
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du token:', error);
    }
    
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
API.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Si l'erreur est 401 et qu'on a un refresh token
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          if (user.refreshToken) {
            // Appel à l'endpoint de refresh token
            const response = await API.post('/auth/refresh', {
              refreshToken: user.refreshToken
            });
            
            // Mettre à jour le token dans localStorage
            const updatedUser = { ...user, token: response.data.token };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            // Réessayer la requête avec le nouveau token
            originalRequest.headers.Authorization = `Bearer ${response.data.token}`;
            return API(originalRequest);
          }
        }
      } catch (refreshError) {
        // Si le refresh échoue, déconnecter l'utilisateur
        localStorage.removeItem('user');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    
    // Pour les autres erreurs, on affiche le message
    console.error('Erreur API:', error.message);
    return Promise.reject(error);
  }
);

// API pour les utilisateurs
export const userAPI = {
  // Authentification
  login: (credentials) => API.post('/users/login', credentials),
  // Inscription
  register: (userData) => API.post('/users/register', userData),
  // Récupérer le profil utilisateur
  getProfile: () => API.get('/users/profile'),
  // Récupérer l'utilisateur actuel
  getCurrentUser: () => API.get('/users/me'),
  // Mettre à jour le profil de l'utilisateur actuel
  updateCurrentUser: (userData) => API.put('/users/me', userData),
  // Changer le mot de passe
  changePassword: (passwordData) => API.post('/users/change-password', passwordData),
  // Changer le mot de passe d'un utilisateur (admin uniquement)
  adminChangeUserPassword: (userId, passwordData) => API.post(`/users/${userId}/password`, passwordData),
  // Attribuer un rôle à un utilisateur (admin uniquement)
  assignRole: (userId, roleData) => API.post(`/users/${userId}/role`, roleData),
  // Récupérer tous les utilisateurs (pour administration)
  getAllUsers: () => API.get('/users'),
  // Récupérer un utilisateur par ID
  getUserById: (id) => API.get(`/users/${id}`),
  // Mettre à jour un utilisateur
  updateUser: (id, userData) => API.put(`/users/${id}`, userData),
  // Supprimer un utilisateur
  deleteUser: (id) => API.delete(`/users/${id}`),
  // Changer le statut d'un utilisateur (activer/désactiver)
  changeUserStatus: (id, status) => API.patch(`/users/${id}/status`, { status }),
  // Récupérer les rôles disponibles
  getRoles: () => API.get('/users/roles'),
  // Récupérer les départements disponibles
  getDepartments: () => API.get('/users/departments'),
  // Mettre à jour l'avatar de l'utilisateur
  updateAvatar: (avatarData) => {
    const formData = new FormData();
    if (avatarData.file) {
      formData.append('avatar', avatarData.file);
    }
    return API.post('/users/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
};

// API pour les interventions
export const interventionAPI = {
  // Récupérer toutes les interventions
  getAllInterventions: () => API.get('/interventions'),
  // Récupérer une intervention par ID
  getInterventionById: (id) => API.get(`/interventions/${id}`),
  // Créer une nouvelle intervention
  createIntervention: (interventionData) => API.post('/interventions', interventionData),
  // Mettre à jour une intervention
  updateIntervention: (id, interventionData) => API.put(`/interventions/${id}`, interventionData),
  // Supprimer une intervention
  deleteIntervention: (id) => API.delete(`/interventions/${id}`),
  // Récupérer les tâches de maintenance pour un équipement
  getMaintenanceTasks: (equipmentId) => API.get(`/interventions/tasks/${equipmentId}`),
  // Récupérer les pièces nécessaires pour la maintenance d'un équipement
  getMaintenanceParts: (equipmentId) => API.get(`/interventions/parts/${equipmentId}`)
};

// API pour les équipements
export const equipmentAPI = {
  // Récupérer tous les équipements
  getAllEquipments: async () => API.get('/equipment'),
  // Récupérer un équipement par ID
  getEquipment: async (id) => API.get(`/equipment/${id}`),
  // Créer un nouvel équipement
  createEquipment: async (equipmentData) => {
    // Create FormData object
    const formData = new FormData();
    
    // Add all fields to FormData
    Object.keys(equipmentData).forEach(key => {
      if (key === 'image' && equipmentData[key]) {
        formData.append(key, equipmentData[key]);
      } else if (equipmentData[key] !== undefined) {
        formData.append(key, String(equipmentData[key]));
      }
    });

    return API.post('/equipment', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : ''}`
      }
    });
  },
  // Mettre à jour un équipement
  updateEquipment: async (id, equipmentData) => {
    // Create FormData object
    const formData = new FormData();
    
    // Add all fields to FormData
    Object.keys(equipmentData).forEach(key => {
      if (key === 'image' && equipmentData[key]) {
        formData.append(key, equipmentData[key]);
      } else if (equipmentData[key] !== undefined) {
        formData.append(key, String(equipmentData[key]));
      }
    });

    return API.put(`/equipment/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')).token : ''}`
      }
    });
  },
  // Supprimer un équipement
  deleteEquipment: async (id) => API.delete(`/equipment/${id}`),
  // Récupérer les équipements avec leurs données de maintenance prédictive
  getPredictiveEquipments: () => API.get('/equipment'),
};

// API pour la planification
export const planningAPI = {
  // Récupérer tous les plannings
  getAllPlannings: () => API.get('/planning'),
  // Récupérer un planning par ID
  getPlanningById: (id) => API.get(`/planning/${id}`),
  // Créer un nouveau planning
  createPlanning: (planningData) => API.post('/planning', planningData),
  // Mettre à jour un planning
  updatePlanning: (id, planningData) => API.put(`/planning/${id}`, planningData),
  // Supprimer un planning
  deletePlanning: (id) => API.delete(`/planning/${id}`),
};

// API pour le stock
export const stockAPI = {
  // Récupérer tous les stocks
  getAllStocks: () => API.get('/stock'),
  // Récupérer un stock par ID
  getStockById: (id) => API.get(`/stock/${id}`),
  // Créer un nouveau stock
  createStock: (stockData) => API.post('/stock', stockData),
  // Mettre à jour un stock
  updateStock: (id, stockData) => API.put(`/stock/${id}`, stockData),
  // Supprimer un stock
  deleteStock: (id) => API.delete(`/stock/${id}`),
  // Obtenir les stocks bas
  getLowStock: () => API.get('/stock/low'),
};

// API pour les bons de commande
export const purchaseOrderAPI = {
  // Récupérer tous les bons de commande
  getAllPurchaseOrders: () => API.get('/purchase-orders'),
  // Récupérer un bon de commande par ID
  getPurchaseOrderById: (id) => API.get(`/purchase-orders/${id}`),
  // Créer un nouveau bon de commande
  createPurchaseOrder: (purchaseOrderData) => API.post('/purchase-orders', purchaseOrderData),
  // Mettre à jour un bon de commande
  updatePurchaseOrder: (id, purchaseOrderData) => API.put(`/purchase-orders/${id}`, purchaseOrderData),
  // Supprimer un bon de commande
  deletePurchaseOrder: (id) => API.delete(`/purchase-orders/${id}`),
};

// API pour les capteurs
export const sensorAPI = {
  // Récupérer tous les capteurs par équipement
  getSensorsByEquipment: (equipmentId) => API.get(`/sensors/${equipmentId}`),
  // Récupérer les alertes
  getAlerts: () => API.get('/sensors/alerts'),
  // Créer un nouveau capteur
  createSensor: (sensorData) => API.post('/sensors', sensorData),
  // Récupérer les recommandations pour un équipement
  getRecommendationsForEquipment: (equipmentId) => API.get(`/sensors/${equipmentId}/recommendations`),
  // Appliquer l'optimisation énergétique
  applyOptimization: (equipmentId, params) => API.post(`/sensors/${equipmentId}/optimization`, params),
};

// API pour les indicateurs de performance (KPI)
export const kpiAPI = {
  // Générer des KPIs
  generateKPI: () => API.post('generate'),
  // Obtenir les derniers KPIs
  getLatestKPI: () => API.get('/latest'),
  // Obtenir les KPIs pour un équipement spécifique
  getEquipmentKPI: (id) => API.get(`/equipment/${id}`),
  // Obtenir les KPIs de fiabilité
  getReliabilityKPI: () => API.get('/reliability'),
  // Obtenir les KPIs de maintenance
  getMaintenanceKPI: () => API.get('/maintenance'),
};

// API pour les journaux d'activité (logs)
export const logAPI = {
  // Récupérer tous les logs
  getAllLogs: () => API.get('/logs'),
  // Récupérer les logs système
  getSystemLogs: () => API.get('/logs/system'),
};

// API pour les configurations
export const configurationAPI = {
  // Récupérer toutes les configurations
  getAllConfigurations: () => API.get('/configurations'),
  // Créer ou mettre à jour une configuration
  createOrUpdateConfiguration: (configData) => API.post('/configurations', configData),
  // Supprimer une configuration
  deleteConfiguration: (key) => API.delete(`/configurations/${key}`),
};

// API pour les documents
export const documentAPI = {
  // Récupérer tous les documents
  getAllDocuments: () => API.get('/documents'),
  // Récupérer un document par ID
  getDocumentById: (id) => API.get(`/documents/${id}`),
  // Télécharger un document
  uploadDocument: (documentData, file) => {
    const formData = new FormData();
    
    // Ajouter les données du document
    Object.keys(documentData).forEach(key => {
      if (documentData[key] !== null && documentData[key] !== undefined) {
        formData.append(key, documentData[key]);
      }
    });
    
    // Ajouter le fichier si présent
    if (file) {
      formData.append('file', file);
    }
    
    return API.post('/documents', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  // Supprimer un document
  deleteDocument: (id) => API.delete(`/documents/${id}`),
  // Générer un QR code pour un document
  generateQRCode: (documentId) => API.post(`/documents/${documentId}/qr-code`),
  // Récupérer les documents par équipement
  getDocumentsByEquipment: (equipmentId) => API.get(`/documents/equipment/${equipmentId}`),
};

// API pour les fournisseurs
export const fournisseurAPI = {
  // Récupérer tous les fournisseurs
  getAllFournisseurs: () => API.get('/fournisseurs'),
  
  // Récupérer un fournisseur par ID
  getFournisseurById: (id) => API.get(`/fournisseurs/${id}`),
  
  // Créer un nouveau fournisseur
  createFournisseur: (fournisseurData) => API.post('/fournisseurs', fournisseurData),
  
  // Mettre à jour un fournisseur
  updateFournisseur: (id, fournisseurData) => API.put(`/fournisseurs/${id}`, fournisseurData),
  
  // Supprimer un fournisseur
  deleteFournisseur: (id) => API.delete(`/fournisseurs/${id}`),
};

export default {
  userAPI,
  interventionAPI,
  fournisseurAPI,
  equipmentAPI,
  planningAPI,
  stockAPI,
  purchaseOrderAPI,
  sensorAPI,
  kpiAPI,
  logAPI,
  configurationAPI,
  documentAPI,
}; 

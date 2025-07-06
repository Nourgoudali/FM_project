import axios from 'axios';
import moment from 'moment';

// Configuration de base d'axios
const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Permet d'envoyer les cookies avec les requêtes cross-origin
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper function to get color based on status
const getColorForStatus = (status) => {
  switch (status) {
    case 'completed':
      return '#4CAF50'; // Green for completed
    case 'planned':
      return '#D3D3D3'; // Gray for planned
    case 'overdue':
      return '#f44336'; // Red for overdue
    default:
      return '#D3D3D3';
  }
};

// Maintenance API functions
export const maintenanceAPI = {
  createTask: async (data) => {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid data format');
    }

    try {
      // Calculate end date based on periodicity
      let endDate;
      switch (data.periodicity.toLowerCase()) {
        case 'mensuelle':
          endDate = moment(data.startDate).add(1, 'month').toDate();
          break;
        case 'trimestrielle':
          endDate = moment(data.startDate).add(3, 'months').toDate();
          break;
        case 'annuelle':
          endDate = moment(data.startDate).add(1, 'year').toDate();
          break;
        default:
          endDate = moment(data.startDate).add(1, 'month').toDate();
      }

      const response = await API.post('/planning', {
        intervention: {
          title: data.description,
          equipment: data.equipment,
          provider: data.provider
        },
        startDate: data.startDate,
        endDate: endDate,
        status: 'planned',
        color: getColorForStatus('planned')
      });
      return response.data;
    } catch (error) {
      console.error('Error creating maintenance task:', error);
      throw error;
    }
  },

  getTasks: async () => {
    try {
      const response = await API.get('/planning');
      if (!response.data || !Array.isArray(response.data)) {
        throw new Error('Invalid response format');
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching maintenance tasks:', error);
      throw error;
    }
  },

  updateTask: async (id, data) => {
    if (!id || typeof id !== 'string') {
      throw new Error('Invalid task ID');
    }
    if (!data || typeof data !== 'object' || !data.status) {
      throw new Error('Invalid update data');
    }

    try {
      const response = await API.put(`/planning/${id}`, {
        status: data.status,
        color: getColorForStatus(data.status)
      });
      return response.data;
    } catch (error) {
      console.error('Error updating maintenance task:', error);
      throw error;
    }
  },

  validateTask: async (taskId, userId) => {
    try {
      if (!taskId) {
        throw new Error('ID de tâche manquant');
      }

      console.log('ID de tâche:', taskId);
      console.log('ID utilisateur:', userId);

      // Construire l'URL avec la bonne structure
      const url = `/maintenance/planning/${taskId}/validate`;
      console.log('URL de validation:', url);

      // Ajouter un délai pour voir les logs
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await API.put(url, { userId });
      
      console.log('Réponse de validation:', response.data);
      
      if (response.data?.status === 'success') {
        return { status: 'success', message: response.data.message };
      } else {
        throw new Error(response.data?.message || 'Erreur lors de la validation');
      }
    } catch (error) {
      console.error('Erreur détaillée:', {
        error,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      const errorMessage = error.response?.data?.message || 
        error.response?.status === 401 ? 'Non authentifié' :
        error.response?.status === 404 ? 'La tâche de maintenance n\'existe pas ou n\'est pas accessible' :
        error.message || 'Erreur lors de la validation de la maintenance';
      
      throw new Error(errorMessage);
    }
  }
};

// Ajouter un intercepteur pour les requêtes
API.interceptors.request.use(
  async config => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      if (user && user.token) {
        config.headers = {
          ...config.headers,
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        };
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
    console.error('Erreur interceptée:', {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      config: error.config
    });

    if (error.response) {
      console.error('Réponse d\'erreur:', error.response);
      
      // Si c'est une erreur 401 et qu'on a un refresh token
      if (error.response.status === 401 && !error.config._retry) {
        error.config._retry = true;
        
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          
          if (user.refreshToken) {
            const refreshResponse = await API.post('/auth/refresh', {
              refreshToken: user.refreshToken
            });

            const updatedUser = { ...user, token: refreshResponse.data.token };
            localStorage.setItem('user', JSON.stringify(updatedUser));
            
            error.config.headers.Authorization = `Bearer ${refreshResponse.data.token}`;
            return API(error.config);
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

// Intercepteur pour gérer les erreurs d'authentification
API.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;
    
    // Vérifier si error.response existe
    if (error.response) {
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
          // Commenter cette ligne pour éviter les redirections non désirées
          // window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }
    }
    
    // Pour les erreurs réseau (pas de réponse du serveur)
    if (error.message && error.message.includes('Network Error')) {
      console.error('Erreur réseau: Impossible de se connecter au serveur.');
      // Vous pouvez ajouter ici une notification à l'utilisateur
    } else {
      // Pour les autres erreurs, on affiche le message
      console.error('Erreur API:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// API pour les utilisateurs
export const userAPI = {
  // Authentification
  login: (credentials) => API.post('/users/login', credentials),
  // Inscription
  register: (userData) => API.post('/users/register', userData),
  // Ajouter un utilisateur (admin uniquement)
  addUser: (userData) => API.post('/users/add', userData),
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
  // Déconnexion (mise à jour de lastLogin)
  logout: () => API.post('/users/logout'),
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
  // Récupérer les traitements pour inventaire
  getTraitementsPourInventaire: () => API.get('/inventaires/traitements-pour-inventaire'),
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
  generateKPI: () => API.post('/kpi/generate'),
  // Obtenir les derniers KPIs
  getLatestKPI: () => API.get('/kpi/latest'),
  // Obtenir les KPIs pour un équipement spécifique
  getEquipmentKPI: (id) => API.get(`/kpi/equipment/${id}`),
  // Obtenir les KPIs de fiabilité
  getReliabilityKPI: () => API.get('/kpi/reliability'),
  // Obtenir les KPIs de maintenance
  getMaintenanceKPI: () => API.get('/kpi/maintenance'),
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
  getAllDocuments: () => API.get("/documents"),
  upload: (formData) => {
    console.log("Configuration de la requête d'upload:", {
      headers: {
        "Content-Type": "multipart/form-data"
      }
    });
    
    return API.post("/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data"
      },
      transformRequest: [(data) => {
        console.log("Données avant transformation:", data);
        return data;
      }]
    });
  },
  deleteDocument: (id) => API.delete(`/documents/${id}`),
  generateQRCode: (documentId) => API.post(`/documents/${documentId}/qr-code`),
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

// API pour les commandes
export const commandeAPI = {
  // Récupérer toutes les commandes
  getAllCommandes: () => API.get('/commandes'),
  // Récupérer une commande par ID
  getCommandeById: (id) => API.get(`/commandes/${id}`),
  // Créer une nouvelle commande
  createCommande: (commandeData) => API.post('/commandes', commandeData),
  // Mettre à jour une commande
  updateCommande: (id, commandeData) => API.put(`/commandes/${id}`, commandeData),
  // Supprimer une commande
  deleteCommande: (id) => API.delete(`/commandes/${id}`),
};

// API pour les traitements de commande
export const traitementAPI = {
  // Récupérer tous les traitements
  getAllTraitements: () => API.get('/traitements'),
  // Récupérer un traitement par ID
  getTraitementById: (id) => API.get(`/traitements/${id}`),
  // Récupérer les traitements par commande
  getTraitementsByCommande: (commandeId) => API.get(`/traitements/commande/${commandeId}`),
  // Créer un nouveau traitement
  createTraitement: (traitementData) => API.post('/traitements', traitementData),
  // Mettre à jour un traitement
  updateTraitement: (id, traitementData) => API.put(`/traitements/${id}`, traitementData),
  // Supprimer un traitement
  deleteTraitement: (id) => API.delete(`/traitements/${id}`),
};

// API pour les inventaires
export const inventaireAPI = {
  createInventaire: (data) => API.post('/inventaires', data),
  getAllInventaires: () => API.get('/inventaires'),
  getInventaireById: (id) => API.get(`/inventaires/${id}`),
  getInventairesByProduit: (produitId) => API.get(`/inventaires/produit/${produitId}`),
  getInventairesByLieuStockage: (lieu) => API.get(`/inventaires/lieu/${lieu}`),
  getInventairesAvecEcart: () => API.get('/inventaires/ecarts'),
  getRaisonsEcart: () => API.get('/inventaires/raisons-ecart'),
  updateInventaire: (id, data) => API.put(`/inventaires/${id}`, data),
  deleteInventaire: (id) => API.delete(`/inventaires/${id}`),
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
  commandeAPI,
  traitementAPI,
  inventaireAPI,
};

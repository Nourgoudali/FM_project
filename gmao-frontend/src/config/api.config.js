const API_BASE_URL = 'http://localhost:5000/api';

export const API_ENDPOINTS = {
    // Auth
    LOGIN: `${API_BASE_URL}/users/login`,
    REGISTER: `${API_BASE_URL}/users/register`,
    
    // Users
    USERS: `${API_BASE_URL}/users`,
    
    // Interventions
    INTERVENTIONS: `${API_BASE_URL}/interventions`,
    
    // Equipment
    EQUIPMENT: `${API_BASE_URL}/equipment`,
    
    // Stock
    STOCK: `${API_BASE_URL}/stock`,
    
    // Planning
    PLANNING: `${API_BASE_URL}/planning`,
    
    // Documents
    DOCUMENTS: `${API_BASE_URL}/documents`,
    
    // Purchase Orders
    PURCHASE_ORDERS: `${API_BASE_URL}/purchase-orders`,
    
    // KPI
    KPI: `${API_BASE_URL}/kpi`,
    
    // Sensors
    SENSORS: `${API_BASE_URL}/sensors`,
    
    // Logs
    LOGS: `${API_BASE_URL}/logs`,
    
    // Configurations
    CONFIGURATIONS: `${API_BASE_URL}/configurations`
}; 
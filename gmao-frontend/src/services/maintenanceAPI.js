import axios from 'axios';
import moment from 'moment';

const API = axios.create({
  baseURL: 'http://localhost:5000/api',
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add authentication interceptor
API.interceptors.request.use(config => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  if (user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

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
        color: '#D3D3D3' // Default color for planned tasks
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
  }
};

// Helper function to get color based on status
const getColorForStatus = (status) => {
  switch (status) {
    case 'completed':
      return '#90EE90'; // Green
    case 'overdue':
      return '#FF6666'; // Red
    case 'planned':
      return '#FFFF99'; // Yellow
    default:
      return '#D3D3D3'; // Gray
  }
}

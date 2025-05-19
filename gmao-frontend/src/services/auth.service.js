import axios from 'axios';
import { API_ENDPOINTS } from '../config/api.config';

// Create axios instance with base URL
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add request interceptor to add token to all requests
api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user?.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle token expiration
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('401 error on:', error.config?.url, 'Response:', error.response, 'Error:', error);
            // localStorage.removeItem('user'); // Comment out or remove
            // window.location.href = '/login'; // Comment out or remove
             // Instead of redirecting, maybe trigger a logout action or show an error message
             // Example: 
             // if (error.config.url !== '/users/login') { // Avoid infinite loop on login page itself
             //   AuthService.logout(); // Trigger frontend logout without redirecting immediately
             // }
        }
        return Promise.reject(error);
    }
);

const AuthService = {
    login: async (email, password) => {
        try {
            const response = await api.post('/users/login', { email, password });
            if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Une erreur est survenue' };
        }
    },

    logout: () => {
        localStorage.removeItem('user');
        window.location.href = '/login';
    },

    register: async (userData) => {
        try {
            const response = await api.post('/users/register', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Une erreur est survenue' };
        }
    },

    getCurrentUser: () => {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    isAuthenticated: () => {
        const user = localStorage.getItem('user');
        if (!user) return false;
        
        try {
            const parsedUser = JSON.parse(user);
            return !!parsedUser?.token;
        } catch {
            return false;
        }
    }
};

export { AuthService, api }; 
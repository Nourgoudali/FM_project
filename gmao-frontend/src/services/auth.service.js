import axios from 'axios';
import { API_ENDPOINTS } from '../config/api.config';

const AuthService = {
    login: async (email, password) => {
        try {
            const response = await axios.post(API_ENDPOINTS.LOGIN, { email, password });
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
    },

    register: async (userData) => {
        try {
            const response = await axios.post(API_ENDPOINTS.REGISTER, userData);
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
        return !!localStorage.getItem('user');
    }
};

export default AuthService; 
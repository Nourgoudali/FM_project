"use client"

import React, { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Vérifier si l'utilisateur est déjà connecté au chargement
        const currentUser = AuthService.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            setError(null);
            const response = await AuthService.login(email, password);
            setUser(response.user);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const logout = () => {
        AuthService.logout();
        setUser(null);
    };

    const register = async (userData) => {
        try {
            setError(null);
            const response = await AuthService.register(userData);
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        logout,
        register,
        isAuthenticated: !!user
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
    }
    return context;
};

export default AuthContext;

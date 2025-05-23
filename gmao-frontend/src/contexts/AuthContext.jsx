"use client"

import React, { createContext, useState, useContext, useEffect } from 'react';
import { userAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = getCurrentUser();
        console.log('AuthContext useState: État initial de l\'utilisateur vérifié');
        return storedUser;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fonctions utilitaires pour l'authentification
    function getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    function isAuthenticated() {
        const user = localStorage.getItem('user');
        if (!user) return false;
        
        try {
            const parsedUser = JSON.parse(user);
            return !!parsedUser?.token;
        } catch {
            return false;
        }
    }

    useEffect(() => {
        console.log('AuthContext: Vérification initiale de l\'authentification');

        const timer = setTimeout(() => {
            try {
                const authenticated = isAuthenticated();
                console.log('AuthContext: État authentifié =', authenticated);

                if (authenticated) {
                    console.log('AuthContext: Utilisateur authentifié');
                    setUser(getCurrentUser());
                } else {
                    console.log('AuthContext: Utilisateur non authentifié');
                }
            } catch (err) {
                console.error('AuthContext: Erreur lors de la vérification de l\'authentification:', err.message);
            } finally {
                setLoading(false);
                console.log('AuthContext: Vérification terminée, chargement terminé');
            }
        }, 50);
        
        return () => clearTimeout(timer);

    }, []);

    useEffect(() => {
        console.log('AuthContext: État utilisateur mis à jour, chargement =', loading);
    }, [user, loading]);

    const login = async (email, password) => {
        try {
            setError(null);
            setLoading(true);
            const response = await userAPI.login({ email, password });
            if (response.data.token) {
                localStorage.setItem('user', JSON.stringify(response.data));
                setUser(response.data);
            }
            return response.data;
        } catch (err) {
            console.error('Erreur de connexion:', err.response?.status, err.response?.data);
            
            // Récupérer le message d'erreur du backend ou utiliser un message par défaut
            const errorMessage = err.response?.data?.message || 'Problème de connexion au serveur. Veuillez réessayer.';
            setError(errorMessage);
            
            // Pour que l'erreur soit plus facilement capturée par le composant LoginPage
            const error = new Error(errorMessage);
            error.status = err.response?.status;
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        try {
            console.log('AuthContext: Déconnexion en cours');
            localStorage.removeItem('user');
            window.location.href = '/';
            setUser(null);
        } catch (err) {
            console.error('Erreur pendant la déconnexion:', err.message);
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            setLoading(true);
            const response = await userAPI.register(userData);
            return response.data;
        } catch (err) {
            setError(err.response?.data?.message || 'Échec de l\'inscription');
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        currentUser: user?.user,
        loading,
        error,
        login,
        logout,
        register,
        isAuthenticated: !!user && !!user.token
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
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

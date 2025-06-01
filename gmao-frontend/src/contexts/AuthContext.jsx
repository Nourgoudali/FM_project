"use client"

import React, { createContext, useState, useContext, useEffect } from 'react';
import { userAPI } from '../services/api';

// Fonctions utilitaires pour l'authentification
const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
};

const isAuthenticated = () => {
    const user = localStorage.getItem('user');
    if (!user) return false;
    
    try {
        const parsedUser = JSON.parse(user);
        return !!parsedUser?.token;
    } catch {
        return false;
    }
};

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = getCurrentUser();
        console.log('AuthContext useState: État initial de l\'utilisateur vérifié');
        return storedUser;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
            // Gérer différents types d'erreurs
            if (err.message && err.message.includes('Network Error')) {
                console.error('Erreur réseau lors de la connexion:', err.message);
                setError('Impossible de se connecter au serveur. Vérifiez votre connexion internet ou réessayez plus tard.');
                throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet ou réessayez plus tard.');
            } else if (err.response) {
                // Erreur avec réponse du serveur
                console.error('Erreur de connexion:', err.response.status, err.response.data);
                const errorMessage = err.response.data?.message || 'Identifiants incorrects ou problème de serveur.';
                setError(errorMessage);
                const error = new Error(errorMessage);
                error.status = err.response.status;
                throw error;
            } else {
                // Autres erreurs
                console.error('Erreur inconnue lors de la connexion:', err);
                setError('Une erreur s\'est produite. Veuillez réessayer.');
                throw new Error('Une erreur s\'est produite. Veuillez réessayer.');
            }
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
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
    }
    return context;
};

export default AuthContext;

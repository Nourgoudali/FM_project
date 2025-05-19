"use client"

import React, { createContext, useState, useContext, useEffect } from 'react';
import { AuthService } from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const storedUser = AuthService.getCurrentUser();
        console.log('AuthContext useState: Initial user from localStorage', storedUser);
        return storedUser;
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        console.log('AuthContext useEffect: Running initial check');

        const timer = setTimeout(() => {
            try {
                const currentUser = AuthService.getCurrentUser();
                const isAuthenticated = AuthService.isAuthenticated();
                console.log('AuthContext useEffect check delayed:', { currentUser, isAuthenticated });

                if (currentUser && isAuthenticated) {
                    console.log('AuthContext useEffect: User found and authenticated');
                    setUser(currentUser);
                } else {
                    console.log('AuthContext useEffect: No user or not authenticated on delayed check');
                }
            } catch (err) {
                console.error('AuthContext useEffect: Error checking auth state (delayed):', err);
            } finally {
                setLoading(false);
                console.log('AuthContext useEffect: Finished check (delayed), loading set to false');
            }
        }, 50);
        
        return () => clearTimeout(timer);

    }, []);

    useEffect(() => {
        console.log('AuthContext user state changed:', user, 'loading:', loading);
    }, [user, loading]);

    const login = async (email, password) => {
        try {
            setError(null);
            setLoading(true);
            const response = await AuthService.login(email, password);
            if (response) {
                setUser(response);
            }
            return response;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        try {
            console.log('AuthContext: Calling logout function');
            AuthService.logout();
            setUser(null);
        } catch (err) {
            console.error('Error during logout:', err);
        }
    };

    const register = async (userData) => {
        try {
            setError(null);
            setLoading(true);
            const response = await AuthService.register(userData);
            return response;
        } catch (err) {
            setError(err.message);
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

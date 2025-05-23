import React, { createContext, useState, useContext, useEffect } from 'react';

const SidebarContext = createContext(null);

export const SidebarProvider = ({ children }) => {
    const [sidebarOpen, setSidebarOpen] = useState(() => {
        const storedState = localStorage.getItem('sidebarOpen');
        // Si une valeur est stockée, la convertir en booléen, sinon true par défaut
        return storedState !== null ? storedState === 'true' : true;
    });

    // Mettre à jour localStorage quand l'état change
    useEffect(() => {
        localStorage.setItem('sidebarOpen', sidebarOpen);
    }, [sidebarOpen]);

    const toggleSidebar = () => {
        setSidebarOpen(prev => !prev);
    };

    const value = {
        sidebarOpen,
        setSidebarOpen,
        toggleSidebar
    };

    return (
        <SidebarContext.Provider value={value}>
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar doit être utilisé à l\'intérieur d\'un SidebarProvider');
    }
    return context;
};

export default SidebarContext; 
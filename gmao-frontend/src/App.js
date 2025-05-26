import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "./App.css"

// Pages
import LoginPage from "./pages/Login/LoginPage"
import DashboardPage from "./pages/Dashboard/DashboardPage"
import UserManagementPage from "./pages/UserManagement/UserManagementPage"
import InterventionManagementPage from "./pages/InterventionManagement/InterventionManagementPage"
import EquipmentManagementPage from "./pages/EquipmentManagement/EquipmentManagementPage"
import StockManagementPage from "./pages/StockManagement/StockManagementPage"
import SupplierManagementPage from "./pages/SupplierManagement/SupplierManagementPage"
import DocumentationPage from "./pages/Documentation/DocumentationPage"
import PredictiveMaintenancePage from "./pages/PredictiveMaintenance/PredictiveMaintenancePage"
import ProfilePage from "./pages/Profile/ProfilePage"
import NotFoundPage from "./pages/NotFound/NotFoundPage"
import HomePage from "./pages/Home/HomePage"

// Components
import NotificationSystem from "./components/Notifications/NotificationSystem"

// Context
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { SidebarProvider } from "./contexts/SidebarContext"

// Composant pour les routes protégées (utilisateurs authentifiés uniquement)
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="loading-container">Chargement...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return children;
};

// Composant pour les routes publiques (redirection des utilisateurs authentifiés)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div className="loading-container">Chargement...</div>;
    }

    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <SidebarProvider>
                <Router future={{ 
                    v7_relativeSplatPath: true,
                    v7_startTransition: true 
                }}>
                    <Routes>
                        {/* Routes publiques - redirigent vers le tableau de bord si déjà authentifié */}
                        <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />
                        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

                        {/* Routes protégées */}
                        <Route
                            path="/dashboard"
                            element={
                                <ProtectedRoute>
                                    <DashboardPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/users"
                            element={
                                <ProtectedRoute>
                                    <UserManagementPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/equipments"
                            element={
                                <ProtectedRoute>
                                    <EquipmentManagementPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/interventions"
                            element={
                                <ProtectedRoute>
                                    <InterventionManagementPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/stock"
                            element={
                                <ProtectedRoute>
                                    <StockManagementPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/fournisseurs"
                            element={
                                <ProtectedRoute>
                                    <SupplierManagementPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/documentation"
                            element={
                                <ProtectedRoute>
                                    <DocumentationPage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/predictive"
                            element={
                                <ProtectedRoute>
                                    <PredictiveMaintenancePage />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <ProfilePage />
                                </ProtectedRoute>
                            }
                        />

                        {/* Redirection par défaut */}
                        <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                    <NotificationSystem />
                </Router>
            </SidebarProvider>
        </AuthProvider>
    )
}

export default App

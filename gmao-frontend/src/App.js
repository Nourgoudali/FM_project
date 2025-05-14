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
import DocumentationPage from "./pages/Documentation/DocumentationPage"
import PredictiveMaintenancePage from "./pages/PredictiveMaintenance/PredictiveMaintenancePage"
import SettingsPage from "./pages/Settings/SettingsPage"
import ProfilePage from "./pages/Profile/ProfilePage"
import NotFoundPage from "./pages/NotFound/NotFoundPage"
import HomePage from "./pages/Home/HomePage"

// Components
import NotificationSystem from "./components/Notifications/NotificationSystem"

// Context
import { AuthProvider, useAuth } from "./contexts/AuthContext"

// Composant pour les routes protégées
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    if (loading) {
        return <div>Chargement...</div>;
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }

    return children;
};

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Routes publiques */}
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />

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
                        path="/settings"
                        element={
                            <ProtectedRoute>
                                <SettingsPage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Redirection par défaut */}
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
                <NotificationSystem />
            </Router>
        </AuthProvider>
    )
}

export default App

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import "./App.css"

// Pages
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/Dashboard"
import UserManagementPage from "./pages/UserManagement"
import InterventionManagementPage from "./pages/InterventionManagement"
import EquipmentManagementPage from "./pages/EquipmentManagement"
import StockManagementPage from "./pages/StockManagement"
import DocumentationPage from "./pages/DocumentationPage"
import PredictiveMaintenancePage from "./pages/PredictiveMaintenance"
import SettingsPage from "./pages/SettingsPage"
import ProfilePage from "./pages/ProfilePage"
import NotFoundPage from "./pages/NotFoundPage"
import HomePage from "./pages/HomePage"

// Components
import NotificationSystem from "./components/NotificationSystem"

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
                    <Route
                        path="/profile"
                        element={
                            <ProtectedRoute>
                                <ProfilePage />
                            </ProtectedRoute>
                        }
                    />

                    {/* Route pour 404 */}
                    <Route path="*" element={<NotFoundPage />} />
                </Routes>
                <NotificationSystem />
            </Router>
        </AuthProvider>
    )
}

export default App

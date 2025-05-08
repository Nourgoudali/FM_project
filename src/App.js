import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import "./App.css"

// Pages
import LoginPage from "./pages/Login/LoginPage"
import HomePage from "./pages/Home/HomePage"
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

// Components
import NotificationSystem from "./components/Notifications/NotificationSystem"

// Context
import { AuthProvider } from "./contexts/AuthContext"

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/users" element={<UserManagementPage />} />
          <Route path="/interventions" element={<InterventionManagementPage />} />
          <Route path="/equipments" element={<EquipmentManagementPage />} />
          <Route path="/stock" element={<StockManagementPage />} />
          <Route path="/documentation" element={<DocumentationPage />} />
          <Route path="/predictive" element={<PredictiveMaintenancePage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <NotificationSystem />
      </Router>
    </AuthProvider>
  )
}

export default App

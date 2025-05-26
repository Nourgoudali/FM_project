"use client"
import { Link, useLocation, useNavigate } from "react-router-dom"
import "./Sidebar.css"
import logoFM from "../../assets/images/logo-fm.png";
import {
  FaUser, 
  FaBox, 
  FaCalendarAlt, 
  FaTools, 
  FaHandsHelping,
  FaSignOutAlt,
  FaChevronLeft,
  FaBars
} from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import { IoDocumentText } from "react-icons/io5";
import { GrVmMaintenance } from "react-icons/gr";
import { useAuth } from "../../contexts/AuthContext";
import { useSidebar } from "../../contexts/SidebarContext";

function Sidebar({ isOpen }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth() // Utiliser le hook useAuth pour accéder à la fonction logout
  const { sidebarOpen, toggleSidebar } = useSidebar()

  const menuItems = [
    { path: "/dashboard", name: "Tableau de bord", icon: <MdSpaceDashboard /> },
    { path: "/users", name: "Utilisateurs", icon: <FaUser /> },
    { path: "/interventions", name: "Interventions", icon: <FaCalendarAlt /> },
    { path: "/equipments", name: "Équipements", icon: <FaTools /> },
    { path: "/stock", name: "Stock", icon: <FaBox /> },
    { path: "/documentation", name: "Documentation", icon: <IoDocumentText /> },
    { path: "/predictive", name: "Maintenance Prédictive", icon: <GrVmMaintenance /> },
    { divider: true },
    { path: "/profile", name: "Profil", icon: <FaUser /> },
  ]

  const handleLogout = () => {
    // Supprimer les informations d'authentification
    logout()
    
    // Rediriger vers la page de connexion
    navigate('/login')
  }

  return (
    <div className={`admin-container ${sidebarOpen ? "" : "admin-collapsed"}`}>
      <button className="admin-toggle-button" onClick={toggleSidebar}>
        {sidebarOpen ? <FaChevronLeft /> : <FaBars />}
      </button>
      
      <nav className="admin-sidebar">
        <div className="admin-content">
          {sidebarOpen && (
            <div className="admin-logo-container">
              <Link to="/dashboard" className="sidebar-logo">
                <img src={logoFM || "/placeholder.svg"} alt="FM Logo" className="logo-image" />
                <h1 className="admin-logo">GMAO</h1>
              </Link>
            </div>
          )}

          <ul className="admin-nav-list">
            {menuItems.map((item, index) =>
              item.divider ? (
                <li key={`divider-${index}`} className="nav-divider"></li>
              ) : (
                <li key={`nav-${item.path.toLowerCase().replace(/\//g, '-')}` } className="nav-item">
                  <Link to={item.path} className={`admin-nav-link ${location.pathname === item.path ? "active" : ""}`}>
                    <span className="admin-nav-icon">{item.icon}</span>
                    {sidebarOpen && <span className="admin-nav-text">{item.name}</span>}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="admin-logout-container">
          <button className="admin-logout-button" onClick={handleLogout}>
            <span className="admin-logout-icon">
              <FaSignOutAlt />
            </span>
            {sidebarOpen && <span className="admin-logout-text">Se Déconnecter</span>}
          </button>
        </div>
      </nav>
    </div>
  )
}

export default Sidebar

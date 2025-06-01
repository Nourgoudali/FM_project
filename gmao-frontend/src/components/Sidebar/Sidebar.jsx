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
  FaChevronRight,
  FaBars,
  FaBuilding,
  FaChevronDown,
  FaShoppingCart,
  FaWarehouse,
  FaFileInvoice,
  FaCogs
} from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import { IoDocumentText } from "react-icons/io5";
import { GrVmMaintenance } from "react-icons/gr";
import { useAuth } from "../../contexts/AuthContext";
import { useSidebar } from "../../contexts/SidebarContext";
import { useState } from "react";

function Sidebar({ isOpen }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { logout } = useAuth() // Utiliser le hook useAuth pour accéder à la fonction logout
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const [openDropdown, setOpenDropdown] = useState(null)

  const menuItems = [
    { path: "/dashboard", name: "Tableau de bord", icon: <MdSpaceDashboard /> },
    { path: "/users", name: "Utilisateurs", icon: <FaUser /> },
    { path: "/interventions", name: "Interventions", icon: <FaCalendarAlt /> },
    { path: "/equipments", name: "Équipements", icon: <FaTools /> },
    { path: "/achat", name: "Achat", icon: <FaShoppingCart />, hasSubmenu: true },
    { path: "/documentation", name: "Documentation", icon: <IoDocumentText /> },
    { path: "/predictive", name: "Maintenance Prédictive", icon: <GrVmMaintenance /> },
    { path: "/inventaires", name: "Inventaire", icon: <FaBox /> },
    { divider: true },
    { path: "/profile", name: "Profil", icon: <FaUser /> },
  ]

  const subMenus = {
    "/achat": [
      { path: "/fournisseurs", name: "Fournisseur", icon: <FaBuilding /> },
      { path: "/stock", name: "Stock", icon: <FaWarehouse /> },
      { path: "/commandes", name: "Commande", icon: <FaFileInvoice /> },
      { path: "/traitements", name: "Traitement", icon: <FaCogs /> },
    ]
  }

  const handleLogout = () => {
    // Supprimer les informations d'authentification
    logout()
    
    // Rediriger vers la page de connexion
    navigate('/login')
  }

  // Fonction pour gérer les clics sur les menus déroulants
  const handleDropdownClick = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  return (
    <div className={`sidebar-container ${sidebarOpen ? "" : "sidebar-collapsed"}`}>
      <button className="sidebar-toggle-button" onClick={toggleSidebar}>
        {sidebarOpen ? <FaChevronLeft /> : <FaBars />}
      </button>
      
      <nav className="sidebar-sidebar">
        <div className="sidebar-content">
          {sidebarOpen && (
            <div className="sidebar-logo-container">
              <Link to="/dashboard" className="sidebar-logo">
                <img src={logoFM || "/placeholder.svg"} alt="FM Logo" className="logo-image" />
                <h1 className="sidebar-logo-text">GMAO</h1>
              </Link>
            </div>
          )}

          <ul className="sidebar-nav-list">
            {menuItems.map((item, index) =>
              item.divider ? (
                <li key={`divider-${index}`} className="nav-divider"></li>
              ) : item.hasSubmenu ? (
                <li key={`nav-${item.path.toLowerCase().replace(/\//g, '-')}` } className="nav-item">
                  <Link 
                    to={item.path} 
                    className={`sidebar-nav-link ${location.pathname === item.path || (subMenus[item.path] && subMenus[item.path].some(subItem => location.pathname === subItem.path)) ? "active" : ""}`}
                    onClick={(e) => {
                      e.preventDefault();
                      handleDropdownClick(item.name);
                    }}
                  >
                    <span className="sidebar-nav-icon">{item.icon}</span>
                    {sidebarOpen && <span className="sidebar-nav-text">{item.name}</span>}
                    {sidebarOpen && (
                      <span className={`dropdown-icon ${openDropdown === item.name ? "open" : ""}`}>
                        <FaChevronRight />
                      </span>
                    )}
                  </Link>
                  <ul className={`submenu ${openDropdown === item.name ? "open" : ""}`}>
                    {subMenus[item.path].map((subItem, subIndex) => (
                      <li key={`subnav-${subIndex}`} className="submenu-item">
                        <Link 
                          to={subItem.path} 
                          className={`submenu-link ${location.pathname === subItem.path ? "active" : ""}`}
                        >
                          <span className="submenu-icon">{subItem.icon}</span>
                          <span className="submenu-text">{subItem.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              ) : (
                <li key={`nav-${item.path?.toLowerCase().replace(/\//g, '-') || index}` } className="nav-item">
                  <Link to={item.path} className={`sidebar-nav-link ${location.pathname === item.path ? "active" : ""}`}>
                    <span className="sidebar-nav-icon">{item.icon}</span>
                    {sidebarOpen && <span className="sidebar-nav-text">{item.name}</span>}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="sidebar-logout-container">
          <button className="sidebar-logout-button" onClick={handleLogout}>
            <span className="sidebar-logout-icon">
              <FaSignOutAlt />
            </span>
            {sidebarOpen && <span className="sidebar-logout-text">Se Déconnecter</span>}
          </button>
        </div>
      </nav>
    </div>
  )
}

export default Sidebar

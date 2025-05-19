"use client"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import "./Sidebar.css"
import logoFM from "../../assets/images/logo-fm.jpg"

function Sidebar() {
  const location = useLocation()
  const { currentUser } = useAuth()

  const menuItems = [
    { path: "/dashboard", name: "Tableau de bord", icon: "dashboard" },
    { path: "/users", name: "Utilisateurs", icon: "user" },
    { path: "/interventions", name: "Interventions", icon: "intervention" },
    { path: "/equipments", name: "Équipements", icon: "equipment" },
    { path: "/stock", name: "Stock", icon: "stock" },
    { path: "/documentation", name: "Documentation", icon: "document" },
    { path: "/predictive", name: "Maintenance Prédictive", icon: "chart" },
    { path: "/settings", name: "Paramètres", icon: "settings" },
    { divider: true },
    { path: "/profile", name: "Profil", icon: "user" },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Link to="/" className="sidebar-logo">
          <img src={logoFM || "/placeholder.svg"} alt="FM Logo" className="logo-image" />
          <span className="logo-text">GMAO</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav-list">
          {menuItems.map((item, index) =>
            item.divider ? (
              <li key={`divider-${index}`} className="nav-divider"></li>
            ) : (
              <li key={item.path} className="nav-item">
                <Link to={item.path} className={`nav-link ${location.pathname === item.path ? "active" : ""}`}>
                  <span className={`nav-icon icon-${item.icon}`}></span>
                  <span className="nav-text">{item.name}</span>
                </Link>
              </li>
            ),
          )}
        </ul>
      </nav>

      {currentUser && (
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{currentUser.name ? currentUser.name.charAt(0) : (currentUser.email ? currentUser.email.charAt(0) : 'U')}</div>
            <div className="user-details">
              <div className="user-name">{currentUser.name || currentUser.email || 'Utilisateur'}</div>
              <div className="user-role">{currentUser.role || ''}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}

export default Sidebar

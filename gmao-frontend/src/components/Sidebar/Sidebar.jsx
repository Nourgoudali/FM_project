"use client"
import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import "./Sidebar.css"
import logoFM from "../../assets/images/logo-fm.png";
import {FaUser, FaBox, FaCalendarAlt, FaTools, FaHandsHelping} from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import { IoDocumentText } from "react-icons/io5";
import { GrVmMaintenance } from "react-icons/gr";
import { IoMdSettings } from "react-icons/io";

function Sidebar({ isOpen }) {
  const location = useLocation()
  const { currentUser } = useAuth()

  const menuItems = [
    { path: "/dashboard", name: "Tableau de bord", icon: <MdSpaceDashboard /> },
    { path: "/users", name: "Utilisateurs", icon: <FaUser /> },
    { path: "/interventions", name: "Interventions", icon: <FaCalendarAlt /> },
    { path: "/equipments", name: "Équipements", icon: <FaTools /> },
    { path: "/stock", name: "Stock", icon: <FaBox /> },
    { path: "/documentation", name: "Documentation", icon: <IoDocumentText /> },
    { path: "/predictive", name: "Maintenance Prédictive", icon: <GrVmMaintenance /> },
    { path: "/settings", name: "Paramètres", icon: <IoMdSettings /> },
    { divider: true },
    { path: "/profile", name: "Profil", icon: <FaUser /> },
  ]

  return (
    <aside className={`sidebar ${isOpen ? "open" : "closed"}`}>
      <div className="sidebar-header">
        <Link to="/dashboard" className="sidebar-logo">
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
              <li key={`nav-${item.path.toLowerCase().replace(/\//g, '-')}`} className="nav-item">
                <Link to={item.path} className={`nav-link ${location.pathname === item.path ? "active" : ""}`}>
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.name}</span>
                </Link>
              </li>
            ),
          )}
        </ul>
      </nav>

      
    </aside>
  )
}

export default Sidebar

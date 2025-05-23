import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import GlobalSearch from "../Search/GlobalSearch"
import "./Header.css"

function Header({ title, onToggleSidebar }) {
  const { currentUser, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
    if (showNotifications) setShowNotifications(false)
  }

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications)
    if (showUserMenu) setShowUserMenu(false)
  }

  const handleLogout = () => {
    logout()
  }

  // Notifications simulées
  const notifications = [
    {
      id: 1,
      type: "intervention",
      message: "Nouvelle intervention assignée: Maintenance Pompe P-10",
      time: "Il y a 10 minutes",
      read: false,
    },
    {
      id: 2,
      type: "equipment",
      message: "Alerte: Compresseur C-123 nécessite une maintenance",
      time: "Il y a 2 heures",
      read: false,
    },
    {
      id: 3,
      type: "stock",
      message: "Stock bas: Filtres hydrauliques (5 restants)",
      time: "Il y a 1 jour",
      read: true,
    },
  ]

  return (
    <header className="header">
      <div className="header-left">
        <button className="sidebar-toggle" onClick={onToggleSidebar}>
          <span className="toggle-icon"></span>
        </button>
        <h1 className="page-title">{title}</h1>
      </div>

      <div className="header-center">
        <GlobalSearch />
      </div>

      <div className="header-right">
        <div className="notifications-container">
          <button className="notifications-button" onClick={toggleNotifications}>
            <span className="notifications-icon"></span>
            {notifications.filter((n) => !n.read).length > 0 && (
              <span className="notifications-badge">{notifications.filter((n) => !n.read).length}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notifications-dropdown">
              <div className="dropdown-header">
                <h3>Notifications</h3>
                <button className="mark-all-read">Tout marquer comme lu</button>
              </div>
              <div className="notifications-list">
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <div key={`notif-${notification.id || notification._id || `${notification.type}-${notification.time}`.toLowerCase().replace(/\s+/g, '-')}`} className={`notification-item ${!notification.read ? "unread" : ""}`}>
                      <div className={`notification-icon ${notification.type}-icon`}></div>
                      <div className="notification-content">
                        <p className="notification-message">{notification.message}</p>
                        <span className="notification-time">{notification.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-notifications">Aucune notification</div>
                )}
              </div>
              <div className="dropdown-footer">
                <Link to="/notifications" className="view-all">
                  Voir toutes les notifications
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="user-menu-container">
          <button className="user-menu-button" onClick={toggleUserMenu}>
            <div className="user-avatar">{currentUser?.name?.charAt(0) || "U"}</div>
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <div className="user-info">
                <div className="user-avatar dropdown-avatar">{currentUser?.name?.charAt(0) || "U"}</div>
                <div className="user-details">
                  <h3 className="user-name">{currentUser?.name || "Utilisateur"}</h3>
                  <p className="user-role">{currentUser?.role || "Rôle non défini"}</p>
                </div>
              </div>
              <div className="dropdown-divider"></div>
              <ul className="dropdown-menu">
                <li>
                  <Link to="/profile" className="dropdown-item">
                    <span className="item-icon profile-icon"></span>
                    Mon profil
                  </Link>
                </li>
                <li>
                  <Link to="/settings" className="dropdown-item">
                    <span className="item-icon settings-icon"></span>
                    Paramètres
                  </Link>
                </li>
                <li>
                  <Link to="/documentation" className="dropdown-item">
                    <span className="item-icon help-icon"></span>
                    Aide et documentation
                  </Link>
                </li>
                <li className="dropdown-divider"></li>
                <li>
                  <button className="dropdown-item logout-item" onClick={handleLogout}>
                    <span className="item-icon logout-icon"></span>
                    Déconnexion
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

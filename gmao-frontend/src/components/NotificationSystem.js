import React, { useState, useEffect } from 'react';
import '../styles/NotificationSystem.css';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Simuler la réception de notifications
    const demoNotifications = [
      { id: 1, type: 'info', message: 'Bienvenue sur l\'application GMAO FM', read: false },
      { id: 2, type: 'warning', message: 'Maintenance planifiée pour demain', read: false },
      { id: 3, type: 'error', message: 'Panne détectée sur la Machine B', read: false }
    ];
    
    // Ajouter les notifications après un délai pour simuler une réception en temps réel
    const timer = setTimeout(() => {
      setNotifications(demoNotifications);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  const [showNotifications, setShowNotifications] = useState(false);

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const markAsRead = (id) => {
    setNotifications(
      notifications.map(notification => 
        notification.id === id 
          ? { ...notification, read: true } 
          : notification
      )
    );
  };

  const deleteNotification = (id) => {
    setNotifications(
      notifications.filter(notification => notification.id !== id)
    );
  };

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <div className="notification-system">
      <button 
        className="notification-trigger" 
        onClick={toggleNotifications}
      >
        <span className="notification-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </button>
      
      {showNotifications && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            {notifications.length > 0 && (
              <button 
                className="mark-all-read"
                onClick={() => setNotifications(
                  notifications.map(notification => ({ ...notification, read: true }))
                )}
              >
                Tout marquer comme lu
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {notifications.length === 0 ? (
              <p className="no-notifications">Aucune notification</p>
            ) : (
              notifications.map(notification => (
                <div 
                  key={notification.id} 
                  className={`notification-item ${notification.type} ${notification.read ? 'read' : 'unread'}`}
                >
                  <div className="notification-content" onClick={() => markAsRead(notification.id)}>
                    <p>{notification.message}</p>
                  </div>
                  <button 
                    className="delete-notification"
                    onClick={() => deleteNotification(notification.id)}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationSystem; 
"use client"

import { useState, useEffect } from "react"
import "./NotificationSystem.css"

function NotificationSystem() {
  const [showToast, setShowToast] = useState(false)
  const [currentToast, setCurrentToast] = useState(null)

  // Simuler la réception de notifications en temps réel
  useEffect(() => {
    // Dans un environnement réel, cela serait remplacé par une connexion WebSocket
    const simulateNotifications = () => {
      const notificationTypes = [
        {
          type: "intervention",
          title: "Nouvelle intervention",
          messages: [
            "Intervention #INT-2024-005 assignée",
            "Intervention #INT-2024-006 en retard",
            "Intervention #INT-2024-007 terminée",
          ],
        },
        {
          type: "equipment",
          title: "Alerte équipement",
          messages: [
            "Compresseur C-123 nécessite une maintenance",
            "Pompe P-10 en panne",
            "Moteur M-405 en surchauffe",
          ],
        },
        {
          type: "stock",
          title: "Alerte stock",
          messages: [
            "Stock bas: Filtres hydrauliques (5 restants)",
            "Commande de pièces reçue",
            "Seuil critique: Joints toriques (2 restants)",
          ],
        },
        {
          type: "system",
          title: "Système",
          messages: [
            "Sauvegarde automatique effectuée",
            "Mise à jour du système disponible",
            "Maintenance planifiée ce weekend",
          ],
        },
      ]

      // Générer une notification aléatoire toutes les 30-60 secondes
      const interval = setInterval(
        () => {
          if (Math.random() > 0.7) {
            // 30% de chance de recevoir une notification
            const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
            const randomMessage = randomType.messages[Math.floor(Math.random() * randomType.messages.length)]

            const newNotification = {
              id: Date.now(),
              type: randomType.type,
              title: randomType.title,
              message: randomMessage,
              timestamp: new Date(),
              read: false,
            }

            showNotificationToast(newNotification)
          }
        },
        Math.random() * 30000 + 30000,
      ) // Entre 30 et 60 secondes

      return () => clearInterval(interval)
    }

    const timer = setTimeout(simulateNotifications, 5000) // Démarrer après 5 secondes

    return () => clearTimeout(timer)
  }, [])

  const showNotificationToast = (notification) => {
    setCurrentToast(notification)
    setShowToast(true)

    // Masquer le toast après 5 secondes
    setTimeout(() => {
      setShowToast(false)
    }, 5000)
  }

  const dismissToast = () => {
    setShowToast(false)
  }

  return (
    <>
      {/* Toast de notification */}
      {showToast && currentToast && (
        <div className={`notification-toast ${currentToast.type}`}>
          <div className="toast-icon"></div>
          <div className="toast-content">
            <h4 className="toast-title">{currentToast.title}</h4>
            <p className="toast-message">{currentToast.message}</p>
          </div>
          <button className="toast-close" onClick={dismissToast}>
            ×
          </button>
        </div>
      )}
    </>
  )
}

export default NotificationSystem

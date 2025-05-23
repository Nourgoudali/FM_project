"use client"

import { FaTimes, FaTools, FaCalendarAlt, FaUser, FaMapMarkerAlt } from "react-icons/fa"
import "./InterventionDetailsModal.css"

function InterventionDetailsModal({ intervention, onClose }) {
  if (!intervention) return null

  // Fonction pour obtenir la classe CSS en fonction de la priorité
  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Critique":
        return "priority-critical"
      case "Haute":
        return "priority-high"
      case "Moyenne":
        return "priority-medium"
      case "Basse":
        return "priority-low"
      default:
        return ""
    }
  }

  // Fonction pour obtenir la classe CSS en fonction du statut
  const getStatusClass = (status) => {
    switch (status) {
      case "En cours":
        return "status-in-progress"
      case "Planifiée":
        return "status-planned"
      case "Terminée":
        return "status-completed"
      case "En retard":
        return "status-late"
      default:
        return ""
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container details-modal">
        <div className="modal-header">
          <h2>Détails de l'intervention</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-content details-content">
          <div className="intervention-reference-section">
            <span className="intervention-id">{intervention.id}</span>
            <div className="intervention-badges">
              <span className={`type-badge ${intervention.type === "Curative" ? "curative" : "preventive"}`}>
                {intervention.type}
              </span>
              <span className={`priority-badge ${getPriorityClass(intervention.priority)}`}>{intervention.priority}</span>
              <span className={`status-badge ${getStatusClass(intervention.status)}`}>{intervention.status}</span>
            </div>
          </div>

          <div className="details-section">
            <div className="detail-item">
              <div className="detail-icon">
                <FaTools />
              </div>
              <div className="detail-content">
                <span className="detail-label">Équipement</span>
                <span className="detail-value">{intervention.equipment}</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <FaCalendarAlt />
              </div>
              <div className="detail-content">
                <span className="detail-label">Date prévue</span>
                <span className="detail-value">{intervention.date || "Non spécifiée"}</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <FaUser />
              </div>
              <div className="detail-content">
                <span className="detail-label">Technicien</span>
                <div className="technician-info">
                  <div
                    className="technician-avatar"
                    style={{ backgroundColor: intervention.technician.color }}
                  >
                    {intervention.technician.initials}
                  </div>
                  <span>{intervention.technician.name}</span>
                </div>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="detail-content">
                <span className="detail-label">Localisation</span>
                <span className="detail-value">{intervention.location || "Non spécifiée"}</span>
              </div>
            </div>
          </div>

          <div className="description-section">
            <h3>Description</h3>
            <p className="description-text">
              {intervention.description || "Aucune description disponible pour cette intervention."}
            </p>
          </div>

          <div className="modal-footer">
            <button className="cancel-btn" onClick={onClose}>
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InterventionDetailsModal 
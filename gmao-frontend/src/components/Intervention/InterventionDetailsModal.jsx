import { useState, useEffect } from "react"
import { FaTimes, FaTools, FaCalendarAlt, FaUser, FaMapMarkerAlt } from "react-icons/fa"
import { interventionAPI } from "../../services/api"
import "./InterventionDetailsModal.css"
import { toast } from "react-hot-toast";

function InterventionDetailsModal({ interventionId, intervention: initialData, onClose }) {
  const [intervention, setIntervention] = useState(initialData)
  const [loading, setLoading] = useState(!initialData && !!interventionId)
  
  useEffect(() => {
    // Si nous avons déjà les données ou pas d'ID, ne pas charger
    if (initialData || !interventionId) return
    
    const fetchInterventionData = async () => {
      try {
        setLoading(true)
        const response = await interventionAPI.getInterventionById(interventionId)
        setIntervention(response.data)
      } catch (err) {
        console.error("Erreur lors de la récupération des détails de l'intervention:", err)
        toast.error("Impossible de charger les détails de l'intervention.")
      } finally {
        setLoading(false)
      }
    }
    
    fetchInterventionData()
  }, [interventionId, initialData])
  
  if (loading) return (
    <div className="modal-overlay">
      <div className="modal-container details-modal">
        <div className="modal-header">
          <h2>Détails de l'intervention</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-content details-content">
          <div className="loading-spinner">Chargement...</div>
        </div>
      </div>
    </div>
  )
    
  if (!intervention) return null

  // Fonction pour obtenir la classe CSS en fonction de la priorité
  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Critique": return "intv-priority-critical"
      case "Haute": return "intv-priority-high"
      case "Normale": return "intv-priority-medium"
      case "Basse": return "intv-priority-low"
      default: return ""
    }
  }

  // Fonction pour obtenir la classe CSS en fonction du statut
  const getStatusClass = (status) => {
    switch (status) {
      case "En cours": return "intv-status-in-progress"
      case "Planifiée": return "intv-status-planned"
      case "Terminée": return "intv-status-completed"
      case "Reportée": return "intv-status-late"
      default: return ""
    }
  }
  
  // Fonction pour obtenir la classe CSS en fonction du type
  const getTypeClass = (type) => {
    switch (type) {
      case "Curative": return "curative"
      case "Préventive": return "preventive"
      case "Corrective": return "corrective"
      default: return ""
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
              <span className={`intv-type-badge ${getTypeClass(intervention.type)}`}>
                {intervention.type}
              </span>
              <span className={`intv-priority-badge ${getPriorityClass(intervention.priority)}`}>{intervention.priority}</span>
              <span className={`intv-status-badge ${getStatusClass(intervention.status)}`}>{intervention.status}</span>
            </div>
          </div>

          <div className="details-section">
            <div className="detail-item">
              <div className="detail-icon">
                <FaTools />
              </div>
              <div className="detail-content">
                <span className="detail-label">Équipement</span>
                <span className="detail-value">{intervention.equipment && typeof intervention.equipment === 'object' ? intervention.equipment.name : intervention.equipment}</span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <FaCalendarAlt />
              </div>
              <div className="detail-content">
                <span className="detail-label">Date de début</span>
                <span className="detail-value">
                  {intervention.startDate 
                    ? new Date(intervention.startDate).toLocaleDateString() 
                    : "Non spécifiée"}
                </span>
              </div>
            </div>
            
            <div className="detail-item">
              <div className="detail-icon">
                <FaCalendarAlt />
              </div>
              <div className="detail-content">
                <span className="detail-label">Date de fin</span>
                <span className="detail-value">
                  {intervention.endDate 
                    ? new Date(intervention.endDate).toLocaleDateString() 
                    : "Non spécifiée"}
                </span>
              </div>
            </div>

            <div className="detail-item">
              <div className="detail-icon">
                <FaUser />
              </div>
              <div className="detail-content">
                <span className="detail-label">Technicien</span>
                <div className="technician-info">
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
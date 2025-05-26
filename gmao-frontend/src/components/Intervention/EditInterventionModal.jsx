"use client"

import { useState, useEffect } from "react"
import "./NewInterventionModal.css" // Réutilisation du CSS
import { FaTimes } from "react-icons/fa"

function EditInterventionModal({ intervention, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    equipment: "",
    type: "Préventive",
    priority: "Normale",
    status: "En cours",
    technician: "",
    description: "",
    location: ""
  })

  // Initialiser le formulaire avec les données de l'intervention
  useEffect(() => {
    if (intervention) {
      console.log('Données d\'intervention reçues:', intervention);
      setFormData({
        equipment: intervention.equipment?.reference || "",
        type: intervention.type || "Préventive",
        priority: intervention.priority || "Normale",
        status: intervention.status || "En cours",
        technician: intervention.technician?.name || "",
        description: intervention.description || "",
        location: intervention.location || ""
      })
    }
  }, [intervention])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (onSubmit) {
      // Préserver l'ID de l'équipement original
      onSubmit({
        ...intervention,
        ...formData,
        // Conserver l'équipement original (ObjectId) au lieu de la référence
        equipment: intervention.equipment?._id || intervention.equipment,
        technician: {
          ...intervention.technician,
          name: formData.technician,
          initials: formData.technician.slice(0, 1).toUpperCase(),
        }
      })
    }
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Modifier l'intervention</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="equipment">Équipement</label>
              <input
                type="text"
                id="equipment"
                name="equipment"
                value={formData.equipment}
                onChange={handleChange}
                disabled
                title="La référence d'équipement ne peut pas être modifiée"
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Type</label>
                <div className="select-container">
                  <select id="type" name="type" value={formData.type} onChange={handleChange} className="blue-select">
                    <option value="Préventive">Préventive</option>
                    <option value="Curative">Curative</option>
                  </select>
                  <span className="select-arrow">▼</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priorité</label>
                <div className="select-container">
                  <select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
                    <option value="Normale">Normale</option>
                    <option value="Basse">Basse</option>
                    <option value="Haute">Haute</option>
                    <option value="Critique">Critique</option>
                  </select>
                  <span className="select-arrow">▼</span>
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="status">Statut</label>
                <div className="select-container">
                  <select id="status" name="status" value={formData.status} onChange={handleChange}>
                    <option value="En cours">En cours</option>
                    <option value="Planifiée">Planifiée</option>
                    <option value="Terminée">Terminée</option>
                    <option value="En retard">En retard</option>
                  </select>
                  <span className="select-arrow">▼</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="technician">Technicien</label>
                <input
                  type="text"
                  id="technician"
                  name="technician"
                  value={formData.technician}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
              ></textarea>
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="submit-btn edit-submit-btn">
                Enregistrer les modifications
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditInterventionModal 
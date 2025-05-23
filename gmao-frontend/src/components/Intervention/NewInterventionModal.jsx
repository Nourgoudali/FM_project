"use client"

import { useState } from "react"
import "./NewInterventionModal.css"
import { FaTimes } from "react-icons/fa"

function NewInterventionModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    equipment: "",
    type: "Préventive",
    priority: "Normale",
    technician: "",
    date: "",
    description: "",
    location: "",
  })

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
      onSubmit(formData)
    }
    onClose()
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Nouvelle intervention</h2>
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
                placeholder="Nom de l'équipement"
                value={formData.equipment}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Type</label>
                <div className="select-container">
                  <select id="type" name="type" value={formData.type} onChange={handleChange}>
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
                <label htmlFor="technician">Technicien</label>
                <input
                  type="text"
                  id="technician"
                  name="technician"
                  placeholder="Nom du technicien"
                  value={formData.technician}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input type="date" id="date" name="date" value={formData.date} onChange={handleChange} />
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

            <div className="form-group">
              <label htmlFor="location">Localisation</label>
              <input
                type="text"
                id="location"
                name="location"
                placeholder="Localisation de l'équipement"
                value={formData.location}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-btn" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="submit-btn">
                Créer l'intervention
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default NewInterventionModal 
"use client"

import { useState, useEffect } from "react"
import "./AddInterventionForm.css"

function AddInterventionForm({ onClose, onSubmit }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    // Informations générales
    reference: "",
    type: "Préventive",
    priority: "Normale",
    status: "Planifiée",
    description: "",

    // Planification
    startDate: "",
    endDate: "",
    estimatedDuration: "",
    technician: "",

    // Équipement et pièces
    equipment: "",
    location: "",
    parts: [],

    // Informations complémentaires
    instructions: "",
    documents: [],
    notes: "",
  })

  const [equipments, setEquipments] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [parts, setParts] = useState([])
  const [selectedParts, setSelectedParts] = useState([])
  const [errors, setErrors] = useState({})

  // Simuler le chargement des données
  useEffect(() => {
    // Dans un environnement réel, ces données viendraient de l'API
    setEquipments([
      { id: 1, name: "Pompe P-10", location: "Bâtiment A - Salle 101" },
      { id: 2, name: "Compresseur C-123", location: "Bâtiment B - Salle 203" },
      { id: 3, name: "Moteur M-405", location: "Bâtiment A - Salle 105" },
      { id: 4, name: "Convoyeur CV-200", location: "Bâtiment C - Zone 3" },
    ])

    setTechnicians([
      { id: 1, name: "Jean Dupont" },
      { id: 2, name: "Marie Martin" },
      { id: 3, name: "Pierre Durand" },
      { id: 4, name: "Sophie Lefebvre" },
    ])

    setParts([
      { id: 1, reference: "P001", name: "Filtre hydraulique", stock: 15 },
      { id: 2, reference: "P002", name: "Joint torique", stock: 42 },
      { id: 3, reference: "P003", name: "Courroie de transmission", stock: 8 },
      { id: 4, reference: "P004", name: "Roulement à billes", stock: 23 },
    ])
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Mise à jour automatique de la localisation si un équipement est sélectionné
    if (name === "equipment") {
      const selectedEquipment = equipments.find((eq) => eq.id === Number.parseInt(value))
      if (selectedEquipment) {
        setFormData((prev) => ({
          ...prev,
          location: selectedEquipment.location,
        }))
      }
    }
  }

  const handleAddPart = (partId) => {
    const part = parts.find((p) => p.id === Number.parseInt(partId))
    if (part && !selectedParts.some((p) => p.id === part.id)) {
      const newPart = { ...part, quantity: 1 }
      setSelectedParts([...selectedParts, newPart])
    }
  }

  const handlePartQuantityChange = (partId, quantity) => {
    setSelectedParts(
      selectedParts.map((part) => (part.id === partId ? { ...part, quantity: Number.parseInt(quantity) } : part)),
    )
  }

  const handleRemovePart = (partId) => {
    setSelectedParts(selectedParts.filter((part) => part.id !== partId))
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...files],
    }))
  }

  const validateStep = (step) => {
    const stepErrors = {}
    let isValid = true

    if (step === 1) {
      if (!formData.reference.trim()) {
        stepErrors.reference = "La référence est requise"
        isValid = false
      }
      if (!formData.description.trim()) {
        stepErrors.description = "La description est requise"
        isValid = false
      }
    } else if (step === 2) {
      if (!formData.startDate) {
        stepErrors.startDate = "La date de début est requise"
        isValid = false
      }
      if (!formData.technician) {
        stepErrors.technician = "Un technicien doit être assigné"
        isValid = false
      }
    } else if (step === 3) {
      if (!formData.equipment) {
        stepErrors.equipment = "Un équipement doit être sélectionné"
        isValid = false
      }
    }

    setErrors(stepErrors)
    return isValid
  }

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateStep(currentStep)) {
      // Préparer les données finales
      const finalData = {
        ...formData,
        parts: selectedParts,
      }

      // Dans un environnement réel, envoyer les données à l'API
      console.log("Données de l'intervention:", finalData)

      // Appeler la fonction de callback
      if (onSubmit) {
        onSubmit(finalData)
      }

      // Fermer le formulaire
      if (onClose) {
        onClose()
      }
    }
  }

  return (
    <div className="add-intervention-form">
      <div className="form-header">
        <h2>Nouvelle intervention</h2>
        <div className="step-indicator">
          <div className={`step ${currentStep >= 1 ? "active" : ""}`}>1</div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 2 ? "active" : ""}`}>2</div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 3 ? "active" : ""}`}>3</div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 4 ? "active" : ""}`}>4</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Étape 1: Informations générales */}
        {currentStep === 1 && (
          <div className="form-step">
            <h3>Informations générales</h3>

            <div className="form-group">
              <label htmlFor="reference">Référence*</label>
              <input
                type="text"
                id="reference"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="Ex: INT-2024-001"
              />
              {errors.reference && <span className="error-message">{errors.reference}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Type d'intervention*</label>
                <select id="type" name="type" value={formData.type} onChange={handleChange}>
                  <option value="Préventive">Préventive</option>
                  <option value="Curative">Curative</option>
                  <option value="Améliorative">Améliorative</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priorité*</label>
                <select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
                  <option value="Basse">Basse</option>
                  <option value="Normale">Normale</option>
                  <option value="Haute">Haute</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="status">Statut*</label>
              <select id="status" name="status" value={formData.status} onChange={handleChange}>
                <option value="Planifiée">Planifiée</option>
                <option value="En attente">En attente</option>
                <option value="En cours">En cours</option>
                <option value="Terminée">Terminée</option>
                <option value="Annulée">Annulée</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description*</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                placeholder="Décrivez l'intervention..."
              ></textarea>
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>
          </div>
        )}

        {/* Étape 2: Planification */}
        {currentStep === 2 && (
          <div className="form-step">
            <h3>Planification</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="startDate">Date de début*</label>
                <input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} />
                {errors.startDate && <span className="error-message">{errors.startDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="endDate">Date de fin</label>
                <input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="estimatedDuration">Durée estimée (heures)</label>
              <input
                type="number"
                id="estimatedDuration"
                name="estimatedDuration"
                value={formData.estimatedDuration}
                onChange={handleChange}
                min="0"
                step="0.5"
              />
            </div>

            <div className="form-group">
              <label htmlFor="technician">Technicien assigné*</label>
              <select id="technician" name="technician" value={formData.technician} onChange={handleChange}>
                <option value="">Sélectionner un technicien</option>
                {technicians.map((tech) => (
                  <option key={`tech-${tech._id || tech.id || tech.name.toLowerCase().replace(/\s+/g, '-')}`} value={tech.id}>
                    {tech.name}
                  </option>
                ))}
              </select>
              {errors.technician && <span className="error-message">{errors.technician}</span>}
            </div>
          </div>
        )}

        {/* Étape 3: Équipement et pièces */}
        {currentStep === 3 && (
          <div className="form-step">
            <h3>Équipement et pièces</h3>

            <div className="form-group">
              <label htmlFor="equipment">Équipement*</label>
              <select id="equipment" name="equipment" value={formData.equipment} onChange={handleChange}>
                <option value="">Sélectionner un équipement</option>
                {equipments.map((equip) => (
                  <option key={`equip-${equip._id || equip.id || equip.name.toLowerCase().replace(/\s+/g, '-')}`} value={equip.id}>
                    {equip.name}
                  </option>
                ))}
              </select>
              {errors.equipment && <span className="error-message">{errors.equipment}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="location">Emplacement</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                readOnly
              />
            </div>

            <div className="form-group">
              <label>Pièces détachées</label>
              <div className="parts-selector">
                <div className="parts-list">
                  <select id="partSelect" onChange={(e) => handleAddPart(e.target.value)} value="">
                    <option value="">Ajouter une pièce</option>
                    {parts.map((part) => (
                      <option key={`part-${part._id || part.id || part.reference.toLowerCase().replace(/\s+/g, '-')}`} value={part.id}>
                        {part.name} ({part.reference}) - Stock: {part.stock}
                      </option>
                    ))}
                  </select>
                </div>

                {selectedParts.length > 0 && (
                  <div className="selected-parts">
                    <h4>Pièces sélectionnées</h4>
                    <table className="parts-table">
                      <thead>
                        <tr>
                          <th>Référence</th>
                          <th>Nom</th>
                          <th>Quantité</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedParts.map((part) => (
                          <tr key={`selected-part-${part._id || part.id || part.reference.toLowerCase().replace(/\s+/g, '-')}`}>
                            <td>{part.reference}</td>
                            <td>{part.name}</td>
                            <td>
                              <input
                                type="number"
                                min="1"
                                max={part.stock}
                                value={part.quantity}
                                onChange={(e) => handlePartQuantityChange(part.id, e.target.value)}
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                className="remove-part-btn"
                                onClick={() => handleRemovePart(part.id)}
                              >
                                Supprimer
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Étape 4: Informations complémentaires */}
        {currentStep === 4 && (
          <div className="form-step">
            <h3>Informations complémentaires</h3>

            <div className="form-group">
              <label htmlFor="instructions">Instructions de travail</label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows="4"
                placeholder="Instructions détaillées pour le technicien..."
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="documents">Documents</label>
              <div className="file-upload">
                <input type="file" id="documents" multiple onChange={handleFileChange} />
                <div className="file-upload-info">Formats acceptés: PDF, DOC, JPG, PNG (max 5MB)</div>
              </div>

              {formData.documents.length > 0 && (
                <div className="uploaded-files">
                  <h4>Fichiers ajoutés</h4>
                  <ul>
                    {formData.documents.map((file, index) => (
                      <div key={`doc-${index}-${file.name.toLowerCase().replace(/\s+/g, '-')}`} className="document-item">
                        <span className="document-name">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            const newDocs = [...formData.documents]
                            newDocs.splice(index, 1)
                            setFormData({ ...formData, documents: newDocs })
                          }}
                          className="remove-document"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes additionnelles</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Notes ou commentaires additionnels..."
              ></textarea>
            </div>
          </div>
        )}

        <div className="form-actions">
          {currentStep > 1 && (
            <button type="button" className="prev-btn" onClick={prevStep}>
              Précédent
            </button>
          )}

          {currentStep < 4 ? (
            <button type="button" className="next-btn" onClick={nextStep}>
              Suivant
            </button>
          ) : (
            <button type="submit" className="submit-btn">
              Créer l'intervention
            </button>
          )}

          <button type="button" className="cancel-btn" onClick={onClose}>
            Annuler
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddInterventionForm

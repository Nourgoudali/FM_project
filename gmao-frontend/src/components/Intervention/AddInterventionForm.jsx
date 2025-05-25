"use client"

import { useState, useEffect } from "react"
import "./AddInterventionForm.css"
import { interventionAPI, userAPI, equipmentAPI } from "../../services/api"

function AddInterventionForm({ onClose, onSubmit }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    type: "Préventive",
    priority: "Basse",
    startDate: new Date().toISOString().split('T')[0],
    assignedTechnician: null,
    equipment: null,
    comment: "",
    parts: [],
    instructions: "",
    notes: "",
    endDate: null,
    estimatedDuration: null
  })

  // Gestion des sélections
  const handleSelectionChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))

    // Mise à jour automatique de la localisation si un équipement est sélectionné
    if (field === "equipment") {
      const selectedEquipment = equipments.find((eq) => eq._id === value)
      if (selectedEquipment) {
        setFormData((prev) => ({
          ...prev,
          location: selectedEquipment.location,
        }))
      }
    }
  }

  const [equipments, setEquipments] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [parts, setParts] = useState([])
  const [selectedParts, setSelectedParts] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(true)

  // Charger les données depuis l'API
  useEffect(() => {
    const loadData = async () => {
      try {
        // Charger les équipements
        const equipmentRes = await equipmentAPI.getAllInterventions()
        setEquipments(equipmentRes.data)

        // Charger les techniciens
        const techniciansRes = await userAPI.getTechnicians()
        setTechnicians(techniciansRes.data)

        // Charger les pièces
        const partsRes = await stockAPI.getAllStocks()
        setParts(partsRes.data)
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error)
        setErrors({
          general: "Erreur lors du chargement des données"
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Validation des données avant l'envoi
  const validateData = () => {
    const errors = {}
    
    // Vérifier les champs requis
    if (!formData.equipment) {
      errors.equipment = "Un équipement doit être sélectionné"
    }
    
    if (!['Préventive', 'Curative', 'Corrective'].includes(formData.type)) {
      errors.type = "Le type doit être Préventive, Curative ou Corrective"
    }
    
    if (!['Basse', 'Moyenne', 'Haute', 'Critique'].includes(formData.priority)) {
      errors.priority = "La priorité doit être Basse, Moyenne, Haute ou Critique"
    }
    
    if (!formData.startDate) {
      errors.startDate = "La date de début est requise"
    }
    
    if (errors.equipment || errors.type || errors.priority || errors.startDate) {
      setErrors(errors)
      return false
    }
    
    return true
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

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validation des données
      if (!formData.equipment || !formData.type || !formData.priority || !formData.startDate) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Validation des types
      if (!['Préventive', 'Curative', 'Corrective'].includes(formData.type)) {
        throw new Error('Type invalide. Doit être Préventive, Curative ou Corrective');
      }

      // Validation de la priorité
      if (!['Basse', 'Moyenne', 'Haute', 'Critique'].includes(formData.priority)) {
        throw new Error('Priorité invalide. Doit être Basse, Moyenne, Haute ou Critique');
      }

      // Préparation des données à envoyer
      const interventionData = {
        equipment: formData.equipment?._id, // MongoDB ID from selected equipment
        type: formData.type, // Must be Préventive, Curative, or Corrective
        priority: formData.priority, // Must be Basse, Moyenne, Haute, ou Critique
        startDate: formData.startDate, // Required - date string
        endDate: formData.endDate || null,
        estimatedDuration: formData.estimatedDuration ? Number(formData.estimatedDuration) : null,
        assignedTechnician: formData.assignedTechnician?._id, // MongoDB ID from selected technician
        parts: selectedParts.map((part) => ({
          _id: part._id,
          quantity: Number(part.quantity)
        })),
        instructions: formData.instructions || "",
        notes: formData.notes || "",
        comment: formData.comment || ""
      };

      // Log the data being sent
      console.log("Données envoyées au backend:", {
        ...interventionData,
        assignedTechnician: interventionData.assignedTechnician ? 'Technicien ID' : 'Aucun technicien',
        equipment: interventionData.equipment ? 'Équipement ID' : 'Aucun équipement'
      });

      // Validation des données
      if (!interventionData.equipment || !interventionData.type || !interventionData.priority || !interventionData.startDate) {
        console.error('Validation failed:', {
          equipment: !interventionData.equipment,
          type: !interventionData.type,
          priority: !interventionData.priority,
          startDate: !interventionData.startDate
        });
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Validation des types
      if (!['Préventive', 'Curative', 'Corrective'].includes(interventionData.type)) {
        throw new Error('Type invalide. Doit être Préventive, Curative ou Corrective');
      }

      // Validation de la priorité
      if (!['Basse', 'Moyenne', 'Haute', 'Critique'].includes(interventionData.priority)) {
        throw new Error('Priorité invalide. Doit être Basse, Moyenne, Haute ou Critique');
      }

      // Log the data being sent
      console.log("Données envoyées au backend:", {
        ...interventionData,
        assignedTechnician: interventionData.assignedTechnician ? 'Technicien ID' : 'Aucun technicien',
        equipment: interventionData.equipment ? 'Équipement ID' : 'Aucun équipement'
      });

      try {
        const response = await interventionAPI.createIntervention(interventionData);
        console.log("Réponse API:", response.data);
        
        // Appel de la fonction onSubmit si fournie
        if (onSubmit) {
          onSubmit(response.data);
        }
        
        // Fermer le formulaire
        onClose();
      } catch (apiError) {
        console.error("Erreur API:", apiError);
        setError(apiError.response?.data?.message || "Une erreur est survenue lors de la création de l'intervention");
      }

      try {
        const response = await interventionAPI.createIntervention(interventionData)
        console.log("Réponse API:", response.data)
        
        // Appel de la fonction onSubmit si fournie
        if (onSubmit) {
          onSubmit(response.data)
        }

        // Fermer le formulaire
        onClose()
      } catch (apiError) {
        console.error("Erreur API:", apiError)
        
        // Analyser l'erreur
        let errorMessage = "Une erreur est survenue lors de la création de l'intervention"
        let errorDetails = {}

        if (apiError.response) {
          // Le serveur a répondu avec une erreur
          errorMessage = apiError.response.data?.message || errorMessage
          errorDetails = apiError.response.data?.errors || {}
        } else if (apiError.request) {
          // La requête a été faite mais pas de réponse
          errorMessage = "Le serveur n'a pas répondu"
        } else {
          // Quelque chose s'est mal passé lors de la configuration de la requête
          errorMessage = "Erreur lors de la configuration de la requête"
        }

        // Mettre à jour les erreurs
        setErrors(errorDetails)
        // Afficher un message général
        if (onSubmit) {
          onSubmit({ success: false, message: errorMessage })
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error("Erreur lors de la création de l'intervention:", error)
      setErrors({
        general: error.message
      })
    } finally {
      setLoading(false)
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

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Type d'intervention*</label>
                <select id="type" name="type" value={formData.type} onChange={handleChange}>
                  <option value="Préventive">Préventive</option>
                  <option value="Curative">Curative</option>
                  <option value="Corrective">Corrective</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priorité*</label>
                <select id="priority" name="priority" value={formData.priority} onChange={handleChange}>
                  <option value="Basse">Basse</option>
                  <option value="Moyenne">Moyenne</option>
                  <option value="Haute">Haute</option>
                  <option value="Critique">Critique</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="startDate">Date de début*</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">Date de fin</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="assignedTechnician">Technicien*</label>
              <select
                id="assignedTechnician"
                name="assignedTechnician"
                value={formData.assignedTechnician}
                onChange={(e) => handleSelectionChange('assignedTechnician', e.target.value)}
                required
              >
                <option value="">Sélectionner un technicien</option>
                {technicians.map((tech) => (
                  <option key={tech._id} value={tech._id}>
                    {tech.name} ({tech.initials})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="equipment">Équipement*</label>
              <select
                id="equipment"
                name="equipment"
                value={formData.equipment?._id}
                onChange={(e) => handleSelectionChange('equipment', equipments.find(eq => eq._id === e.target.value))}
                required
              >
                <option value="">Sélectionner un équipement</option>
                {equipments.map((eq) => (
                  <option key={eq._id} value={eq._id}>
                    {eq.name} - {eq.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location">Localisation</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled
              />
            </div>

            <div className="form-group">
              <label htmlFor="estimatedDuration">Durée estimée (min)</label>
              <input
                type="number"
                id="estimatedDuration"
                name="estimatedDuration"
                value={formData.estimatedDuration}
                onChange={handleChange}
                min="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="comment">Commentaire</label>
              <textarea
                id="comment"
                name="comment"
                value={formData.comment}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="instructions">Instructions</label>
              <textarea
                id="instructions"
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows="3"
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
              ></textarea>
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

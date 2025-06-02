"use client"

import { useState, useEffect } from "react"
import "./NewInterventionModal.css"
import { FaTimes } from "react-icons/fa"
import { equipmentAPI, userAPI, interventionAPI } from "../../services/api"

function NewInterventionModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    equipment: "",
    type: "Préventive",
    priority: "Normale",
    technician: "",
    startDate: "",
    endDate: "",
    description: "",
    location: "",
  })

  const [equipments, setEquipments] = useState([])
  const [technicians, setTechnicians] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Charger les équipements et les techniciens
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Récupérer les interventions existantes
        const interventionsResponse = await interventionAPI.getAllInterventions()
        const activeInterventions = interventionsResponse?.data?.filter(
          intervention => intervention.status === 'En cours' || intervention.status === 'Planifiée'
        ) || []
        
        // Extraire les IDs des équipements avec des interventions actives
        const equipmentsWithActiveInterventions = activeInterventions.map(intervention => {
          // Gestion des deux formats possibles (objet ou ID)
          return typeof intervention.equipment === 'object' 
            ? intervention.equipment._id 
            : intervention.equipment
        })
        
        console.log('Équipements avec interventions actives:', equipmentsWithActiveInterventions.length)
        
        // Récupérer tous les équipements
        const equipmentsResponse = await equipmentAPI.getAllEquipments()
        if (equipmentsResponse?.data) {
          // Filtrer pour ne garder que les équipements sans intervention active
          const availableEquipments = equipmentsResponse.data.filter(
            equipment => !equipmentsWithActiveInterventions.includes(equipment._id)
          )
          
          console.log('Équipements disponibles:', availableEquipments.length, 'sur', equipmentsResponse.data.length)
          setEquipments(availableEquipments)
        }

        // Récupérer les utilisateurs avec le rôle technicien
        const usersResponse = await userAPI.getAllUsers()
        if (usersResponse?.data) {
          const techniciansList = usersResponse.data.filter(user => user.role === 'technicien')
          setTechnicians(techniciansList)
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err)
        setError("Impossible de charger les données nécessaires")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Initialiser la date de début à aujourd'hui
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0]
    setFormData(prev => ({
      ...prev,
      startDate: today
    }))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    setFormData((prev) => {
      const newData = {
        ...prev,
        [name]: value,
      }
      
      // Mise à jour automatique de la localisation si un équipement est sélectionné
      if (name === "equipment" && value) {
        const selectedEquipment = equipments.find(eq => eq._id === value)
        if (selectedEquipment) {
          newData.location = selectedEquipment.location || ""
        }
      }
      
      return newData
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validation basique
    if (!formData.equipment || !formData.technician || !formData.startDate) {
      alert("Veuillez remplir tous les champs obligatoires")
      return
    }
    
    if (formData.endDate && new Date(formData.endDate) < new Date(formData.startDate)) {
      alert("La date de fin doit être postérieure à la date de début")
      return
    }
    
    if (onSubmit) {
      // Trouver l'équipement sélectionné
      const selectedEquipment = equipments.find(eq => eq._id === formData.equipment)
      // Trouver le technicien sélectionné
      const selectedTechnician = technicians.find(tech => tech._id === formData.technician)

      const interventionData = {
        type: formData.type,
        priority: formData.priority,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        description: formData.description,
        location: formData.location,
        equipment: selectedEquipment?._id,
        technician: selectedTechnician ? {
          _id: selectedTechnician._id,
          initials: selectedTechnician.firstName.charAt(0) + selectedTechnician.lastName.charAt(0),
          name: `${selectedTechnician.firstName} ${selectedTechnician.lastName}`,
          color: selectedTechnician.color || '#4263EB' // Couleur par défaut si non définie
        } : null
      }

      console.log("Données d'intervention envoyées:", interventionData)
      onSubmit(interventionData)
    }
    onClose()
  }

  if (loading) {
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="loading-message">Chargement des données...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="modal-overlay">
        <div className="modal-container">
          <div className="error-message">{error}</div>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
      </div>
    )
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
              <div className="select-container">
                <select
                  id="equipment"
                  name="equipment"
                  value={formData.equipment}
                  onChange={handleChange}
                  required
                >
                  <option value="">Sélectionner un équipement</option>
                  {equipments.map((equipment) => (
                    <option key={equipment._id} value={equipment._id}>
                      {equipment.reference} - {equipment.name}
                    </option>
                  ))}
                </select>
                <span className="select-arrow">▼</span>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="type">Type</label>
                <div className="select-container">
                  <select id="type" name="type" value={formData.type} onChange={handleChange}>
                    <option value="Préventive">Préventive</option>
                    <option value="Curative">Curative</option>
                    <option value="Corrective">Corrective</option>
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
                <div className="select-container">
                  <select
                    id="technician"
                    name="technician"
                    value={formData.technician}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Sélectionner un technicien</option>
                    {technicians.map((technician) => (
                      <option key={technician._id} value={technician._id}>
                        {technician.firstName} {technician.lastName}
                      </option>
                    ))}
                  </select>
                  <span className="select-arrow">▼</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="startDate">Date de début</label>
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
                <label htmlFor="endDate">Date de fin (optionnelle)</label>
                <input 
                  type="date" 
                  id="endDate" 
                  name="endDate" 
                  value={formData.endDate} 
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
                required
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
                required
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
import { useState, useEffect } from "react"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import NewInterventionModal from "../../components/Intervention/NewInterventionModal"
import EditInterventionModal from "../../components/Intervention/EditInterventionModal"
import InterventionDetailsModal from "../../components/Intervention/InterventionDetailsModal"
import "./InterventionManagementPage.css"
import { FaEye, FaPen, FaCalendarAlt, FaList } from "react-icons/fa"
import { useSidebar } from "../../contexts/SidebarContext"
import { interventionAPI, equipmentAPI } from "../../services/api"
import toast from "react-hot-toast"

const InterventionManagementPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const [viewMode, setViewMode] = useState("list")
  const [showNewModal, setShowNewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedIntervention, setSelectedIntervention] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    priority: "all"
  })
  const [loading, setLoading] = useState(true)
  const [interventions, setInterventions] = useState([])

  // Charger les interventions et les équipements au chargement de la page
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // Récupérer toutes les interventions
        const interventionsResponse = await interventionAPI.getAllInterventions()
        
        // Récupérer tous les équipements pour avoir les détails complets
        const equipmentsResponse = await equipmentAPI.getAllEquipments()
        const equipments = equipmentsResponse.data
        
        if (interventionsResponse && interventionsResponse.data) {
          // Enrichir les données d'intervention avec les détails complets des équipements
          const enrichedInterventions = interventionsResponse.data.map(intervention => {
            // Si l'équipement est un ID, remplacer par l'objet équipement complet
            if (intervention.equipment && typeof intervention.equipment === 'string') {
              const matchingEquipment = equipments.find(eq => eq._id === intervention.equipment)
              if (matchingEquipment) {
                return { ...intervention, equipment: matchingEquipment }
              }
            }
            return intervention
          })
          
          setInterventions(enrichedInterventions)
        }
      } catch (error) {
        toast.error("Impossible de charger les données d'intervention")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Appliquer les filtres
  useEffect(() => {
    let filteredData = interventions

    if (searchTerm) {
      const lowercaseTerm = searchTerm.toLowerCase()
      filteredData = filteredData.filter(
        (item) => 
          item.reference.toLowerCase().includes(lowercaseTerm) || 
          (item.equipment?.reference?.toLowerCase().includes(lowercaseTerm) || 
           item.equipment?.name?.toLowerCase().includes(lowercaseTerm) || 
           (typeof item.equipment === 'string' && item.equipment.toLowerCase().includes(lowercaseTerm))) ||
          item.technician?.name?.toLowerCase().includes(lowercaseTerm)
      )
    }

    if (filters.type !== "all") {
      filteredData = filteredData.filter(item => item.type === filters.type)
    }

    if (filters.status !== "all") {
      filteredData = filteredData.filter(item => item.status === filters.status)
    }

    if (filters.priority !== "all") {
      filteredData = filteredData.filter(item => item.priority === filters.priority)
    }

    setInterventions(filteredData)
  }, [searchTerm, filters])

  const getPriorityClass = (priority) => {
    switch(priority) {
      case "Critique": return "intv-priority-critical"
      case "Haute": return "intv-priority-high"
      case "Normale": return "intv-priority-medium"
      case "Basse": return "intv-priority-low"
      default: return ""
    }
  }

  const getStatusClass = (status) => {
    switch(status) {
      case "En cours": return "intv-status-in-progress"
      case "Planifiée": return "intv-status-planned"
      case "Terminée": return "intv-status-completed"
      case "Reportée": return "intv-status-late"
      default: return ""
    }
  }

  const getTypeClass = (type) => {
    switch(type) {
      case "Curative": return "intv-type-curative"
      case "Préventive": return "intv-type-preventive"
      case "Corrective": return "intv-type-corrective"
      default: return ""
    }
  }

  const handleNewIntervention = async (data) => {
    try {
      // Préparation des données
      const interventionData = {
        equipment: data.equipment,
        type: data.type,
        priority: data.priority,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
        location: data.location,
        technician: data.technician
      }
      
      // Envoi des données au backend
      const response = await interventionAPI.createIntervention(interventionData)
      
      if (response && response.data) {
        setInterventions([...interventions, response.data])
        setShowNewModal(false)
        toast.success("Intervention créée avec succès")
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la création de l'intervention")
    }
  }

  const handleEditIntervention = async (updatedIntervention) => {
    try {
      const response = await interventionAPI.updateIntervention(
        updatedIntervention._id,
        updatedIntervention
      )
      
      if (response && response.data) {
        const updatedInterventions = interventions.map(item => 
          item._id === response.data._id ? response.data : item
        )
        setInterventions(updatedInterventions)
        setShowEditModal(false)
        toast.success("Intervention mise à jour avec succès")
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la mise à jour de l'intervention")
    }
  }

  const handleViewIntervention = (intervention) => {
    setSelectedIntervention(intervention)
    setShowDetailsModal(true)
  }

  const handleEditButton = (intervention) => {
    setSelectedIntervention(intervention)
    setShowEditModal(true)
  }
  
  return (
    <div className="intv-container">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="intv-content">
        <Header title="Gestion des Interventions" onToggleSidebar={toggleSidebar} />
        
        <main className="intv-main">
          <div className="intv-header"></div>
          
          <div className="intv-filters">
            <div className="intv-search-container">
              <input 
                type="text" 
                placeholder="Rechercher une intervention..." 
                className="intv-search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="intv-filter-buttons">
              <div className="intv-filter-dropdown">
                <select 
                  className="intv-filter-select" 
                  value={filters.type}
                  onChange={(e) => setFilters({...filters, type: e.target.value})}
                >
                  <option value="all">Tous les types</option>
                  <option value="Curative">Curative</option>
                  <option value="Préventive">Préventive</option>
                  <option value="Corrective">Corrective</option>
                </select>
              </div>
              <div className="intv-filter-dropdown">
                <select 
                  className="intv-filter-select"
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="En cours">En cours</option>
                  <option value="Planifiée">Planifiée</option>
                  <option value="Terminée">Terminée</option>
                  <option value="Reportée">Reportée</option>
                </select>
              </div>
              <div className="intv-filter-dropdown">
                <select 
                  className="intv-filter-select"
                  value={filters.priority}
                  onChange={(e) => setFilters({...filters, priority: e.target.value})}
                >
                  <option value="all">Toutes les priorités</option>
                  <option value="Basse">Basse</option>
                  <option value="Normale">Normale</option>
                  <option value="Haute">Haute</option>
                  <option value="Critique">Critique</option>
                </select>
              </div>
              <button 
                className="intv-new-btn"
                onClick={() => setShowNewModal(true)}
              >
                <span>+</span> Nouvelle Intervention
              </button>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-indicator">Chargement des interventions...</div>
          ) : viewMode === "list" ? (
            <div className="intv-table-container">
              <table className="intv-table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Équipement</th>
                    <th>Type</th>
                    <th>Priorité</th>
                    <th>Statut</th>
                    <th>Date de début</th>
                    <th>Date de fin</th>
                    <th>Technicien</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {interventions.map((intervention) => (
                    <tr key={intervention._id}>
                      <td>{intervention.reference}</td>
                      <td>
                        {typeof intervention.equipment === 'object' 
                          ? intervention.equipment?.reference || 'Équipement non assigné'
                          : intervention.equipment || 'Équipement non assigné'}
                      </td>
                      <td>
                        <span className={`badge ${getTypeClass(intervention.type)}`}>
                          {intervention.type}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getPriorityClass(intervention.priority)}`}>
                          {intervention.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusClass(intervention.status)}`}>
                          {intervention.status}
                        </span>
                      </td>
                      <td>{intervention.startDate ? new Date(intervention.startDate).toLocaleDateString() : 'Non spécifiée'}</td>
                      <td>{intervention.endDate ? new Date(intervention.endDate).toLocaleDateString() : 'Non spécifiée'}</td>
                      <td>
                        <div className="technician-info">
                          <span className="technician-name">
                            {intervention.technician?.name || 'Non assigné'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="action-btn view"
                            onClick={() => handleViewIntervention(intervention)}
                            title="Voir les détails"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="action-btn edit"
                            onClick={() => handleEditButton(intervention)}
                            title="Modifier"
                          >
                            <FaPen />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="intv-calendar-view">
              <p className="intv-calendar-placeholder">Vue calendrier en développement</p>
            </div>
          )}
        </main>
      </div>

      {showNewModal && (
        <NewInterventionModal
          onClose={() => setShowNewModal(false)}
          onSubmit={handleNewIntervention}
        />
      )}

      {showEditModal && selectedIntervention && (
        <EditInterventionModal
          intervention={selectedIntervention}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleEditIntervention}
        />
      )}

      {showDetailsModal && selectedIntervention && (
        <InterventionDetailsModal
          intervention={selectedIntervention}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  )
}

export default InterventionManagementPage
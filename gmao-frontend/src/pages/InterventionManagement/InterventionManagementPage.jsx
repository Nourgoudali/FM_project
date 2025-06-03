import { useState, useEffect } from "react"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import NewInterventionModal from "../../components/Intervention/NewInterventionModal"
import EditInterventionModal from "../../components/Intervention/EditInterventionModal"
import InterventionDetailsModal from "../../components/Intervention/InterventionDetailsModal"
import "./InterventionManagementPage.css"
import { FaEye, FaEdit, FaPlus, FaFilter, FaTimes} from "react-icons/fa"
import { useSidebar } from "../../contexts/SidebarContext"
import { interventionAPI, equipmentAPI } from "../../services/api"
import toast from "react-hot-toast"

const InterventionManagementPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const [viewMode, setViewMode] = useState("list")
  const [showNewModal, setShowNewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedIntervention, setSelectedIntervention] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    priority: "all"
  })
  const [loading, setLoading] = useState(true)
  const [interventions, setInterventions] = useState([])
  const [filteredInterventions, setFilteredInterventions] = useState([])

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

  // Mettre à jour les interventions filtrées quand les interventions originales changent
  useEffect(() => {
    setFilteredInterventions(interventions);
  }, [interventions]);

  // Appliquer les filtres
  useEffect(() => {
    let filteredData = [...interventions];

    if (searchTerm) {
      const lowercaseTerm = searchTerm.toLowerCase();
      filteredData = filteredData.filter(
        (item) => 
          (item.reference && item.reference.toLowerCase().includes(lowercaseTerm)) || 
          (item.equipment?.reference?.toLowerCase().includes(lowercaseTerm) || 
           item.equipment?.name?.toLowerCase().includes(lowercaseTerm) || 
           (typeof item.equipment === 'string' && item.equipment.toLowerCase().includes(lowercaseTerm))) ||
          item.technician?.name?.toLowerCase().includes(lowercaseTerm)
      );
    }

    if (filters.type !== "all") {
      filteredData = filteredData.filter(item => item.type === filters.type);
    }

    if (filters.status !== "all") {
      filteredData = filteredData.filter(item => item.status === filters.status);
    }

    if (filters.priority !== "all") {
      filteredData = filteredData.filter(item => item.priority === filters.priority);
    }

    setFilteredInterventions(filteredData);
  }, [searchTerm, filters, interventions])

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
      case "Curative": return "curative"
      case "Préventive": return "preventive"
      case "Corrective": return "corrective"
      default: return ""
    }
  }

  const handleNewIntervention = async (data) => {
    try {
      const interventionData = {
        equipment: data.equipment,
        type: data.type,
        priority: data.priority,
        startDate: data.startDate,
        endDate: data.endDate,
        description: data.description,
        location: data.location,
        technician: data.technician
      };
      
      const response = await interventionAPI.createIntervention(interventionData);
      
      if (response && response.data) {
        // L'API retourne maintenant directement l'intervention avec les données d'équipement peuplées
        setInterventions(prevInterventions => [...prevInterventions, response.data]);
        setShowNewModal(false);
        toast.success("Intervention créée avec succès");
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la création de l'intervention");
      console.error("Erreur de création d'intervention:", error);
    }
  }

  const handleEditIntervention = async (updatedIntervention) => {
    try {
      const response = await interventionAPI.updateIntervention(
        updatedIntervention._id,
        updatedIntervention
      );
      
      if (response && response.data) {
        // L'API retourne maintenant directement l'intervention avec les données d'équipement peuplées
        setInterventions(prevInterventions => {
          return prevInterventions.map(item => 
            item._id === response.data._id ? response.data : item
          );
        });
        
        setShowEditModal(false);
        toast.success("Intervention mise à jour avec succès");
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la mise à jour de l'intervention");
      console.error("Erreur de mise à jour d'intervention:", error);
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
          <div className="intv-controls">
            <div className="intv-search-filter-container">
              <div className="intv-search-container">
                <input 
                  type="text" 
                  placeholder="Rechercher une intervention..." 
                  className="intv-search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="intv-filter-button" onClick={() => setShowFilters(!showFilters)}>
                  <FaFilter />
                </button>
              </div>
              <div className="intv-action-buttons">
                <button 
                  className="intv-add-button"
                  onClick={() => setShowNewModal(true)}
                >
                  <FaPlus /> Ajouter une intervention
                </button>
              </div>
            </div>
          </div>
          
          {showFilters && (
            <div className="intv-filters-container">
              <div className="intv-filters-header">
                <h3>Filtres</h3>
                <button
                  className="intv-close-filters-button"
                  onClick={() => setShowFilters(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="intv-filters-body">
                <div className="intv-filter-group">
                  <label>Type</label>
                  <select 
                    className="intv-filter-select"
                    value={filters.type}
                    onChange={(e) => setFilters({...filters, type: e.target.value})}
                  >
                    <option value="all">Tous</option>
                    <option value="Préventive">Préventive</option>
                    <option value="Curative">Curative</option>
                    <option value="Corrective">Corrective</option>
                  </select>
                </div>
                
                <div className="intv-filter-group">
                  <label>Statut</label>
                  <select 
                    className="intv-filter-select"
                    value={filters.status}
                    onChange={(e) => setFilters({...filters, status: e.target.value})}
                  >
                    <option value="all">Tous</option>
                    <option value="Planifiée">Planifiée</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminée">Terminée</option>
                    <option value="Reportée">Reportée</option>
                  </select>
                </div>
                
                <div className="intv-filter-group">
                  <label>Priorité</label>
                  <select 
                    className="intv-filter-select"
                    value={filters.priority}
                    onChange={(e) => setFilters({...filters, priority: e.target.value})}
                  >
                    <option value="all">Tous</option>
                    <option value="Basse">Basse</option>
                    <option value="Normale">Normale</option>
                    <option value="Haute">Haute</option>
                    <option value="Critique">Critique</option>
                  </select>
                </div>
              </div>
              <div className="intv-filter-actions">
                <button 
                  className="intv-reset-filters-button"
                  onClick={() => {
                    setFilters({
                      type: "all",
                      status: "all",
                      priority: "all"
                    });
                    setSearchTerm("");
                  }}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            </div>
          )}
          
          
          
          {loading ? (
            <div className="loading-indicator">Chargement des interventions...</div>
          ) : viewMode === "list" ? (
            <div className="intv-table-container">
            <div className="intv-table-wrapper">
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
                        <span className={`intv-type-badge ${getTypeClass(intervention.type)}`}>
                          {intervention.type}
                        </span>
                      </td>
                      <td>
                        <span className={`intv-priority-badge ${getPriorityClass(intervention.priority)}`}>
                          {intervention.priority}
                        </span>
                      </td>
                      <td>
                        <span className={`intv-status-badge ${getStatusClass(intervention.status)}`}>
                          {intervention.status}
                        </span>
                      </td>
                      <td>{intervention.startDate ? new Date(intervention.startDate).toLocaleDateString() : 'Non spécifiée'}</td>
                      <td>{intervention.endDate ? new Date(intervention.endDate).toLocaleDateString() : 'Non spécifiée'}</td>
                      <td>
                        <div className="intv-technician-info">
                          <span className="intv-technician-name">
                            {intervention.technician?.name || 'Non assigné'}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="intv-action-buttons">
                          <button
                            className="intv-action-btn intv-view"
                            onClick={() => handleViewIntervention(intervention)}
                            title="Voir les détails"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="intv-action-btn intv-edit"
                            onClick={() => handleEditButton(intervention)}
                            title="Modifier"
                          >
                            <FaEdit />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
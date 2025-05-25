import { useState, useEffect } from "react"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import NewInterventionModal from "../../components/Intervention/NewInterventionModal"
import EditInterventionModal from "../../components/Intervention/EditInterventionModal"
import InterventionDetailsModal from "../../components/Intervention/InterventionDetailsModal"
import "./InterventionManagementPage.css"
import { FaEye, FaPen, FaCalendarAlt, FaList } from "react-icons/fa"
import { useSidebar } from "../../contexts/SidebarContext"
import { interventionAPI } from "../../services/api"

const InterventionManagementPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const [viewMode, setViewMode] = useState("list") // "list" or "calendar"
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
  const [error, setError] = useState(null)
  
  // État pour les interventions
  const [allInterventions, setAllInterventions] = useState([])

  // Chargement initial des données
  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        setLoading(true);
        const response = await interventionAPI.getAllInterventions();
        
        if (response && response.data) {
          setAllInterventions(response.data);
        } else {
          // Données fictives comme fallback en cas d'API non disponible
          const mockInterventions = [
    { 
      id: "INT-2024-001", 
      equipment: "Pompe P-101", 
      type: "Curative", 
      priority: "Haute",
      status: "En cours",
      date: "2024-05-15",
      description: "Réparation de la pompe suite à une fuite constatée lors de la dernière maintenance.",
      location: "Bâtiment A - Salle des machines",
      technician: { initials: "J", name: "Jean Dupont", color: "#4263EB" }
    },
    { 
      id: "INT-2024-002", 
      equipment: "Compresseur C-203", 
      type: "Préventive", 
      priority: "Moyenne",
      status: "Planifiée",
      date: "2024-05-20",
      description: "Maintenance préventive du compresseur selon le plan annuel.",
      location: "Bâtiment B - Sous-sol",
      technician: { initials: "M", name: "Marie Martin", color: "#3788D8" }
    },
    { 
      id: "INT-2024-003", 
      equipment: "Moteur M-405", 
      type: "Curative", 
      priority: "Basse",
      status: "Terminée",
      date: "2024-05-10",
      description: "Remplacement des roulements et vérification de l'alignement.",
      location: "Bâtiment A - Ligne de production 2",
      technician: { initials: "P", name: "Pierre Durant", color: "#F783AC" }
    },
    { 
      id: "INT-2024-004", 
      equipment: "Ventilateur V-102", 
      type: "Préventive", 
      priority: "Critique",
      status: "En retard",
      date: "2024-05-05",
      description: "Nettoyage des pales et vérification du système de contrôle.",
      location: "Bâtiment C - Toiture",
      technician: { initials: "S", name: "Sophie Bernard", color: "#74C0FC" }
    },
    { 
      id: "INT-2024-005", 
      equipment: "Filtre F-301", 
      type: "Curative", 
      priority: "Haute",
      status: "En cours",
      date: "2024-05-18",
      description: "Remplacement du filtre suite à une obstruction détectée.",
      location: "Bâtiment B - Salle de traitement",
      technician: { initials: "L", name: "Lucas Petit", color: "#9775FA" }
    }
          ];
          setAllInterventions(mockInterventions);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des interventions:", error);
        setError("Impossible de charger les interventions");
      } finally {
        setLoading(false);
      }
    };

    fetchInterventions();
  }, []);

  // État pour les données filtrées
  const [interventions, setInterventions] = useState([])

  // Appliquer les filtres quand ils changent
  useEffect(() => {
    let filteredData = allInterventions

    // Appliquer la recherche
    if (searchTerm) {
      const lowercaseTerm = searchTerm.toLowerCase()
      filteredData = filteredData.filter(
        (item) => 
          item.id.toLowerCase().includes(lowercaseTerm) || 
          item.equipment.toLowerCase().includes(lowercaseTerm) ||
          item.technician.name.toLowerCase().includes(lowercaseTerm)
      )
    }

    // Appliquer le filtre de type
    if (filters.type !== "all") {
      filteredData = filteredData.filter(item => item.type === filters.type)
    }

    // Appliquer le filtre de statut
    if (filters.status !== "all") {
      filteredData = filteredData.filter(item => item.status === filters.status)
    }

    // Appliquer le filtre de priorité
    if (filters.priority !== "all") {
      filteredData = filteredData.filter(item => item.priority === filters.priority)
    }

    setInterventions(filteredData)
  }, [searchTerm, filters, allInterventions])

  const getPriorityClass = (priority) => {
    switch(priority) {
      case "Critique": return "intv-priority-critical"
      case "Haute": return "intv-priority-high"
      case "Moyenne": return "intv-priority-medium"
      case "Basse": return "intv-priority-low"
      default: return ""
    }
  }

  const getStatusClass = (status) => {
    switch(status) {
      case "En cours": return "intv-status-in-progress"
      case "Planifiée": return "intv-status-planned"
      case "Terminée": return "intv-status-completed"
      case "En retard": return "intv-status-late"
      default: return ""
    }
  }

  const getTypeClass = (type) => {
    switch(type) {
      case "Curative": return "intv-type-curative"
      case "Préventive": return "intv-type-preventive"
      default: return ""
    }
  }

  const handleNewIntervention = async (data) => {
    try {
      // Créer l'objet intervention avec les données du formulaire
      const interventionData = {
      equipment: data.equipment,
      type: data.type,
      priority: data.priority,
      status: "Planifiée",
      date: data.date,
      description: data.description,
      location: data.location,
      technician: { 
        initials: data.technician.slice(0, 1).toUpperCase(), 
        name: data.technician,
        color: "#4263EB" 
      }
      };
    
      // Appel à l'API pour créer l'intervention
      const response = await interventionAPI.createIntervention(interventionData);
      
      if (response && response.data) {
        // Ajouter l'intervention créée à la liste
        setAllInterventions([...allInterventions, response.data]);
      } else {
        // Fallback si l'API échoue
        const newIntervention = {
          id: `INT-2024-${String(allInterventions.length + 1).padStart(3, '0')}`,
          ...interventionData
        };
        setAllInterventions([...allInterventions, newIntervention]);
      }
    
    // Fermer le modal
      setShowNewModal(false);
    } catch (error) {
      console.error("Erreur lors de la création de l'intervention:", error);
      alert("Une erreur est survenue lors de la création de l'intervention");
    }
  }

  const handleEditIntervention = async (updatedIntervention) => {
    try {
      // Appel à l'API pour mettre à jour l'intervention
      const response = await interventionAPI.updateIntervention(
        updatedIntervention._id || updatedIntervention.id, 
        updatedIntervention
      );
      
      if (response && response.data) {
        // Mettre à jour la liste avec l'intervention modifiée
        const updatedInterventions = allInterventions.map(item => 
          item.id === response.data.id ? response.data : item
        );
        setAllInterventions(updatedInterventions);
      } else {
        // Fallback si l'API échoue
    const updatedInterventions = allInterventions.map(item => 
      item.id === updatedIntervention.id ? updatedIntervention : item
        );
        setAllInterventions(updatedInterventions);
      }
      
      setShowEditModal(false);
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'intervention:", error);
      alert("Une erreur est survenue lors de la mise à jour de l'intervention");
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
          <div className="intv-header">
            <div className="intv-title-section">
              <h1>Gestion des Interventions</h1>
              <p className="intv-subtitle">Suivi des interventions curatives et préventives</p>
            </div>
            <div className="intv-controls">
              <div className="intv-view-toggle">
                <button 
                  className={`intv-toggle-btn ${viewMode === "list" ? "active" : ""}`}
                  onClick={() => setViewMode("list")}
                >
                  <FaList /> Liste
                </button>
                <button 
                  className={`intv-toggle-btn ${viewMode === "calendar" ? "active" : ""}`}
                  onClick={() => setViewMode("calendar")}
                >
                  <FaCalendarAlt /> Calendrier
                </button>
              </div>
              <button 
                className="intv-new-btn"
                onClick={() => setShowNewModal(true)}
              >
                <span>+</span> Nouvelle Intervention
              </button>
            </div>
          </div>
          
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
                  <option value="En retard">En retard</option>
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
                  <option value="Moyenne">Moyenne</option>
                  <option value="Haute">Haute</option>
                  <option value="Critique">Critique</option>
                </select>
              </div>
            </div>
          </div>
          
          {loading ? (
            <div className="loading-indicator">Chargement des interventions...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
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
                    <th>Date</th>
                    <th>Technicien</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {interventions.map((intervention) => (
                    <tr key={intervention._id}>
                      <td>{intervention.id}</td>
                      <td>{intervention.equipment}</td>
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
                      <td>{intervention.date}</td>
                      <td>
                        <div className="technician-info">
                          <span 
                            className="technician-avatar" 
                            style={{ backgroundColor: intervention.technician.color }}
                          >
                            {intervention.technician.initials}
                          </span>
                          <span className="technician-name">{intervention.technician.name}</span>
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
              {/* Implémentation future du calendrier */}
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
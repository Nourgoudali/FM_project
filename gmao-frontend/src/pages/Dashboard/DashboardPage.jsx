import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import DashboardCharts from "../../components/Dashboard/DashboardCharts"
import PerformanceIndicators from "../../components/Dashboard/PerformanceIndicators"
import { interventionAPI, equipmentAPI, commandeAPI, fournisseurAPI } from "../../services/api"
import "./DashboardPage.css"
import { useSidebar } from "../../contexts/SidebarContext"
import { useAuth } from "../../contexts/AuthContext"
import { FaTools, FaClipboardList, FaShoppingCart, FaBuilding, FaHourglassHalf, FaCheckCircle } from "react-icons/fa"
import toast from "react-hot-toast"

const DashboardPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const { currentUser } = useAuth()
  const [stats, setStats] = useState([
    { title: "Équipements", count: 0, color: "yellow", icon: FaTools },
    { title: "Interventions en cours", count: 0, color: "blue", icon: FaClipboardList },
    { title: "Interventions terminées", count: 0, color: "green", icon: FaCheckCircle },
    { title: "Commandes", count: 0, color: "gray", icon: FaShoppingCart },
    { title: "Fournisseurs", count: 0, color: "purple", icon: FaBuilding },
  ])
  const [recentInterventions, setRecentInterventions] = useState([])
  const [equipmentData, setEquipmentData] = useState(null)
  const [interventionData, setInterventionData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les statistiques générales
        const statsPromises = [
          equipmentAPI.getAllEquipments(),
          interventionAPI.getAllInterventions(),
          commandeAPI.getAllCommandes(),
          fournisseurAPI.getAllFournisseurs()
        ];
        
        const [equipmentResponse, interventionResponse, commandeResponse, fournisseurResponse] = await Promise.all(statsPromises);
        
        // Initialiser les stats mises à jour
        const updatedStats = [...stats];
        
        // Traiter les données d'équipements
        if (equipmentResponse?.data) {
          setEquipmentData(equipmentResponse.data);
          updatedStats[0].count = equipmentResponse.data.length;
        }
        
        // Traiter les données d'interventions
        if (interventionResponse?.data) {
          const interventions = interventionResponse.data;
          setInterventionData(interventions);
          
          // Interventions en cours
          const interventionsEnCours = interventions.filter(i => 
            i.status === "En cours" || i.status === "Planifiée" || i.status === "En attente"
          ).length;
          
          // Interventions terminées
          const interventionsTerminees = interventions.filter(i => 
            i.status === "Terminée"
          ).length;
          
          updatedStats[1].count = interventionsEnCours;
          updatedStats[2].count = interventionsTerminees;
          
          // Récupérer les interventions récentes (5 dernières)
          const sortedInterventions = [...interventions].sort((a, b) => 
            new Date(b.date) - new Date(a.date)
          );
          setRecentInterventions(sortedInterventions.slice(0, 5));
        }
        
        // Traiter les données de commandes
        if (commandeResponse?.data) {
          updatedStats[3].count = commandeResponse.data.length;
        }
        
        // Traiter les données de fournisseurs
        if (fournisseurResponse?.data) {
          updatedStats[4].count = fournisseurResponse.data.length;
        }
        
        setStats(updatedStats);
      } catch (error) {
        toast.error("Impossible de charger les données du tableau de bord");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusClass = (status) => {
    switch (status) {
      case "En cours":
        return "status-in-progress"
      case "En attente":
        return "status-pending"
      case "Terminée":
        return "status-completed"
      case "En retard":
      case "Retardée":
        return "status-delayed"
      default:
        return ""
    }
  }

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Haute":
      case "Critique":
        return "priority-high"
      case "Normale":
      case "Moyenne":
        return "priority-normal"
      case "Basse":
        return "priority-low"
      default:
        return ""
    }
  }

  const getTypeClass = (type) => {
    switch (type) {
      case "Préventive":
        return "type-preventive"
      case "Curative":
        return "type-curative"
      default:
        return ""
    }
  }

  return (
    <div className="dashboard-container">
      <Sidebar isOpen={sidebarOpen} />

      <div className="dashboard-content">
        <Header title="Tableau de bord" onToggleSidebar={toggleSidebar} />

        <main className="dashboard-main">

          {/* Stats Cards */}
          {loading ? (
            <div className="loading-indicator">Chargement des statistiques...</div>
          ) : (
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={`stat-${stat.title || `stat-${index}`}`.toLowerCase().replace(/\s+/g, '-')} className={`stat-card stat-${stat.color}`}>
                  <div className="stat-icon">
                    {stat.icon && <stat.icon size={24} />}
                  </div>
                  <div className="stat-info">
                    <h3 className="stat-title">{stat.title}</h3>
                    <p className="stat-count">{stat.count}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Performance Indicators */}
          <PerformanceIndicators />

          {/* Charts */}
          <DashboardCharts 
            equipmentData={equipmentData} 
            interventionData={interventionData}
          />

          {/* Recent Interventions */}
          <div className="recent-interventions">
            <div className="section-header">
              <h3 className="section-title">Dernières Interventions</h3>
              <Link to="/interventions" className="view-all-link">
                Voir tout
              </Link>
            </div>

            {loading ? (
              <div className="loading-indicator">Chargement des interventions...</div>
            ) : recentInterventions.length === 0 ? (
              <div className="empty-data-message">Aucune intervention récente</div>
            ) : (
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Référence</th>
                      <th>Équipement</th>
                      <th>Type</th>
                      <th>Priorité</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Technicien</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentInterventions.map((intervention) => (
                      <tr key={intervention._id || intervention.id || `intervention-${intervention.reference}`.toLowerCase().replace(/\s+/g, '-')}>
                        <td>{intervention.reference || intervention.id}</td>
                        <td>{intervention.equipment ? (typeof intervention.equipment === 'object' ? intervention.equipment.name || intervention.equipment.reference || 'Équipement sans nom' : intervention.equipment) : 'Équipement supprimé'}</td>
                        <td>
                          <span className={`badge ${getTypeClass(intervention.type)}`}>{intervention.type}</span>
                        </td>
                        <td>
                          <span className={`badge ${getPriorityClass(intervention.priority)}`}>
                            {intervention.priority}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${getStatusClass(intervention.status)}`}>{intervention.status}</span>
                        </td>
                        <td>{intervention.date ? new Date(intervention.date).toLocaleDateString() : '-'}</td>
                        <td>{intervention.technician ? (typeof intervention.technician === 'object' ? intervention.technician.name || intervention.technician.firstName + ' ' + intervention.technician.lastName || 'Technicien sans nom' : intervention.technician) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default DashboardPage

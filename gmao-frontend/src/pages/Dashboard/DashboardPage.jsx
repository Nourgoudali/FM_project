"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import DashboardCharts from "../../components/Dashboard/DashboardCharts"
import PerformanceIndicators from "../../components/Dashboard/PerformanceIndicators"
import { interventionAPI, equipmentAPI, kpiAPI } from "../../services/api"
import "./DashboardPage.css"
import { useSidebar } from "../../contexts/SidebarContext"
import { useAuth } from "../../contexts/AuthContext"

const DashboardPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const { currentUser } = useAuth()
  const [stats, setStats] = useState([
    { title: "Équipements", count: 0, color: "blue" },
    { title: "Interventions planifiées", count: 0, color: "blue" },
    { title: "Interventions totales", count: 0, color: "blue" },
    { title: "Retards", count: 0, color: "red" },
  ])
  const [recentInterventions, setRecentInterventions] = useState([])
  const [equipmentData, setEquipmentData] = useState(null)
  const [interventionData, setInterventionData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Récupérer les statistiques générales
        const statsPromises = [
          equipmentAPI.getAllEquipments(),
          interventionAPI.getAllInterventions()
        ];
        
        const [equipmentResponse, interventionResponse] = await Promise.all(statsPromises);
        
        // Traiter les données d'équipements
        if (equipmentResponse?.data) {
          setEquipmentData(equipmentResponse.data);
          
          // Calculer les statistiques
          const equipmentCount = equipmentResponse.data.length;
          
          // Mettre à jour les stats
          const updatedStats = [...stats];
          updatedStats[0].count = equipmentCount;
          
          // Traiter les données d'interventions si disponibles
          if (interventionResponse?.data) {
            const interventions = interventionResponse.data;
            setInterventionData(interventions);
            
            // Mettre à jour les statistiques d'interventions
            const plannedInterventions = interventions.filter(i => i.status === "Planifiée").length;
            const totalInterventions = interventions.length;
            const delayedInterventions = interventions.filter(i => i.status === "En retard").length;
            
            updatedStats[1].count = plannedInterventions;
            updatedStats[2].count = totalInterventions;
            updatedStats[3].count = delayedInterventions;
            
            // Récupérer les interventions récentes (5 dernières)
            const sortedInterventions = [...interventions].sort((a, b) => 
              new Date(b.date) - new Date(a.date)
            );
            setRecentInterventions(sortedInterventions.slice(0, 5));
          }
          
          setStats(updatedStats);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données du tableau de bord:", error);
        setError("Impossible de charger les données du tableau de bord");
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
          <div className="dashboard-welcome">
            <h2 className="welcome-title">Bienvenue, {currentUser?.firstName || currentUser?.name || "Utilisateur"}</h2>
            <p className="welcome-subtitle">Voici un aperçu de vos activités</p>
          </div>

          {/* Stats Cards */}
          {loading ? (
            <div className="loading-indicator">Chargement des statistiques...</div>
          ) : (
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={`stat-${stat.title || `stat-${index}`}`.toLowerCase().replace(/\s+/g, '-')} className={`stat-card stat-${stat.color}`}>
                  <div className="stat-icon"></div>
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
            ) : error ? (
              <div className="error-message">{error}</div>
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
                        <td>{intervention.equipment}</td>
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
                        <td>{intervention.date}</td>
                        <td>{intervention.technician?.name || intervention.technician}</td>
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

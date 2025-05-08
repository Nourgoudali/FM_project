"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import DashboardCharts from "../../components/Dashboard/DashboardCharts"
import PerformanceIndicators from "../../components/Dashboard/PerformanceIndicators"
import { interventionService } from "../../services/api"
import "./DashboardPage.css"

function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [stats, setStats] = useState([
    { title: "Équipements", count: 0, color: "blue" },
    { title: "Interventions planifiées", count: 0, color: "blue" },
    { title: "Interventions totales", count: 0, color: "blue" },
    { title: "Retards", count: 0, color: "red" },
  ])
  const [recentInterventions, setRecentInterventions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Dans un environnement réel, ces données viendraient de l'API
        // const response = await api.get('/dashboard/stats');
        // setStats(response.data.stats);

        // Simuler les données pour la démo
        setStats([
          { title: "Équipements", count: 156, color: "blue" },
          { title: "Interventions planifiées", count: 23, color: "blue" },
          { title: "Interventions totales", count: 189, color: "blue" },
          { title: "Retards", count: 4, color: "red" },
        ])

        // Récupérer les interventions récentes
        const interventionsResponse = await interventionService.getAll()
        setRecentInterventions(interventionsResponse.data.slice(0, 5))

        setLoading(false)
      } catch (error) {
        console.error("Erreur lors du chargement des données du tableau de bord:", error)
        setError("Impossible de charger les données du tableau de bord")
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Données simulées pour la démo
  useEffect(() => {
    if (loading && !recentInterventions.length) {
      setRecentInterventions([
        {
          id: 1,
          reference: "INT-2024-001",
          equipment: "Pompe P-10",
          type: "Préventive",
          priority: "Normale",
          status: "En cours",
          date: "2024-01-15",
          technician: "Jean Dupont",
        },
        {
          id: 2,
          reference: "INT-2024-002",
          equipment: "Compresseur Ref.C-123",
          type: "Curative",
          priority: "Haute",
          status: "En attente",
          date: "2024-01-14",
          technician: "Marie Martin",
        },
        {
          id: 3,
          reference: "INT-2024-003",
          equipment: "Moteur M-405",
          type: "Préventive",
          priority: "Basse",
          status: "Terminée",
          date: "2024-01-10",
          technician: "Pierre Durand",
        },
      ])
      setLoading(false)
    }
  }, [loading, recentInterventions])

  const getStatusClass = (status) => {
    switch (status) {
      case "En cours":
        return "status-in-progress"
      case "En attente":
        return "status-pending"
      case "Terminée":
        return "status-completed"
      case "Retardée":
        return "status-delayed"
      default:
        return ""
    }
  }

  const getPriorityClass = (priority) => {
    switch (priority) {
      case "Haute":
        return "priority-high"
      case "Normale":
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
        <Header title="Tableau de bord" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="dashboard-main">
          <div className="dashboard-welcome">
            <h2 className="welcome-title">Bienvenue, Thomas Martin</h2>
            <p className="welcome-subtitle">Voici un aperçu de vos activités</p>
          </div>

          {/* Stats Cards */}
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className={`stat-card stat-${stat.color}`}>
                <div className="stat-icon"></div>
                <div className="stat-info">
                  <h3 className="stat-title">{stat.title}</h3>
                  <p className="stat-count">{stat.count}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Performance Indicators */}
          <PerformanceIndicators />

          {/* Charts */}
          <DashboardCharts />

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
                      <tr key={intervention.id}>
                        <td>{intervention.reference}</td>
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
                        <td>{intervention.technician}</td>
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

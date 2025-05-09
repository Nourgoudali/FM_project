"use client"

import { useState, useEffect, useMemo } from "react"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import "./PredictiveMaintenancePage.css"

function PredictiveMaintenancePage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [timeRange, setTimeRange] = useState("month")
  const [loading, setLoading] = useState(true)

  // Données simulées pour la démo
  const equipments = useMemo(() => [
    { id: 1, name: "Pompe P-10", healthScore: 87, nextMaintenance: "2024-02-15", status: "Normal" },
    { id: 2, name: "Compresseur Ref.C-123", healthScore: 62, nextMaintenance: "2024-01-25", status: "Attention" },
    { id: 3, name: "Moteur M-405", healthScore: 93, nextMaintenance: "2024-03-10", status: "Normal" },
    { id: 4, name: "Convoyeur CV-200", healthScore: 45, nextMaintenance: "2024-01-20", status: "Critique" },
    { id: 5, name: "Chaudière CH-100", healthScore: 78, nextMaintenance: "2024-02-05", status: "Normal" },
  ], [])

  useEffect(() => {
    // Simuler le chargement des données
    setTimeout(() => {
      setLoading(false)
      setSelectedEquipment(equipments[0])
    }, 1000)
  }, [equipments])

  const handleEquipmentChange = (equipmentId) => {
    const equipment = equipments.find((eq) => eq.id === Number.parseInt(equipmentId))
    setSelectedEquipment(equipment)
  }

  const handleTimeRangeChange = (range) => {
    setTimeRange(range)
  }

  const getHealthScoreClass = (score) => {
    if (score >= 80) return "health-good"
    if (score >= 60) return "health-warning"
    return "health-critical"
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "Normal":
        return "status-normal"
      case "Attention":
        return "status-warning"
      case "Critique":
        return "status-critical"
      default:
        return ""
    }
  }

  // Données simulées pour les graphiques
  const vibrationData = {
    week: [0.8, 0.9, 1.1, 1.0, 0.9, 1.2, 1.3],
    month: [0.8, 0.9, 1.1, 1.0, 0.9, 1.2, 1.3, 1.1, 1.0, 0.9, 1.1, 1.2, 1.3, 1.4, 1.2, 1.1, 1.0, 0.9, 1.1, 1.2, 1.3],
    year: [
      0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.2, 1.1, 1.0, 0.9, 0.8, 0.9, 1.0, 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 1.9, 2.0,
      1.9, 1.8, 1.7, 1.6, 1.5, 1.4, 1.3,
    ],
  }

  const temperatureData = {
    week: [45, 46, 47, 48, 50, 52, 53],
    month: [45, 46, 47, 48, 50, 52, 53, 52, 51, 50, 49, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57],
    year: [
      45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 64, 63, 62, 61, 60, 59, 58,
      57, 56,
    ],
  }

  const currentData = {
    week: [10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8],
    month: [
      10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.7, 10.6, 10.5, 10.4, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 11.0,
      11.1, 11.2,
    ],
    year: [
      10.2, 10.3, 10.4, 10.5, 10.6, 10.7, 10.8, 10.9, 11.0, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 11.8, 11.9, 12.0,
      12.1, 12.2, 12.1, 12.0, 11.9, 11.8, 11.7, 11.6, 11.5, 11.4, 11.3,
    ],
  }

  // Fonction pour générer un graphique simple en CSS
  const renderGraph = (data, label, unit, threshold = null) => {
    const currentData = data[timeRange]
    const max = Math.max(...currentData) * 1.2
    const thresholdPercent = threshold ? (threshold / max) * 100 : null

    return (
      <div className="graph-container">
        <div className="graph-header">
          <h4 className="graph-title">{label}</h4>
          <div className="graph-legend">
            <span className="legend-item">
              <span className="legend-color legend-actual"></span>
              <span className="legend-label">Actuel</span>
            </span>
            {threshold && (
              <span className="legend-item">
                <span className="legend-color legend-threshold"></span>
                <span className="legend-label">Seuil</span>
              </span>
            )}
          </div>
        </div>
        <div className="graph-body">
          <div className="graph-y-axis">
            <span>{max.toFixed(1)}</span>
            <span>{(max / 2).toFixed(1)}</span>
            <span>0</span>
          </div>
          <div className="graph-chart">
            {threshold && (
              <div className="threshold-line" style={{ bottom: `${thresholdPercent}%` }}>
                <span className="threshold-label">{threshold}</span>
              </div>
            )}
            <div className="bars-container">
              {currentData.map((value, index) => (
                <div
                  key={index}
                  className="bar"
                  style={{
                    height: `${(value / max) * 100}%`,
                  }}
                  title={`${value} ${unit}`}
                ></div>
              ))}
            </div>
          </div>
        </div>
        <div className="graph-x-axis">
          {timeRange === "week" && <span>7 derniers jours</span>}
          {timeRange === "month" && <span>30 derniers jours</span>}
          {timeRange === "year" && <span>12 derniers mois</span>}
        </div>
      </div>
    )
  }

  return (
    <div className="predictive-container">
      <Sidebar isOpen={sidebarOpen} />

      <div className="predictive-content">
        <Header title="Maintenance Prédictive" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="predictive-main">
          {loading ? (
            <div className="loading-indicator">Chargement des données...</div>
          ) : (
            <>
              {/* Filtres */}
              <div className="filters-bar">
                <div className="equipment-select">
                  <label htmlFor="equipment" className="select-label">
                    Équipement
                  </label>
                  <div className="select-container">
                    <select
                      id="equipment"
                      value={selectedEquipment?.id || ""}
                      onChange={(e) => handleEquipmentChange(e.target.value)}
                      className="select-input"
                    >
                      {equipments.map((equipment) => (
                        <option key={equipment.id} value={equipment.id}>
                          {equipment.name}
                        </option>
                      ))}
                    </select>
                    <span className="select-icon"></span>
                  </div>
                </div>

                <div className="time-range-tabs">
                  <button
                    className={`tab-btn ${timeRange === "week" ? "active" : ""}`}
                    onClick={() => handleTimeRangeChange("week")}
                  >
                    Semaine
                  </button>
                  <button
                    className={`tab-btn ${timeRange === "month" ? "active" : ""}`}
                    onClick={() => handleTimeRangeChange("month")}
                  >
                    Mois
                  </button>
                  <button
                    className={`tab-btn ${timeRange === "year" ? "active" : ""}`}
                    onClick={() => handleTimeRangeChange("year")}
                  >
                    Année
                  </button>
                </div>
              </div>

              {/* Indicateurs */}
              {selectedEquipment && (
                <div className="indicators-grid">
                  <div className="indicator-card">
                    <div className="indicator-header">
                      <h3 className="indicator-title">Score de santé</h3>
                      <div className={`indicator-badge ${getHealthScoreClass(selectedEquipment.healthScore)}`}>
                        {selectedEquipment.healthScore}%
                      </div>
                    </div>
                    <div className="indicator-body">
                      <div className="progress-bar-container">
                        <div
                          className={`progress-bar ${getHealthScoreClass(selectedEquipment.healthScore)}`}
                          style={{ width: `${selectedEquipment.healthScore}%` }}
                        ></div>
                      </div>
                      <div className="indicator-labels">
                        <span>Critique</span>
                        <span>Attention</span>
                        <span>Normal</span>
                      </div>
                    </div>
                  </div>

                  <div className="indicator-card">
                    <div className="indicator-header">
                      <h3 className="indicator-title">Prochaine maintenance</h3>
                    </div>
                    <div className="indicator-body">
                      <div className="date-display">{selectedEquipment.nextMaintenance}</div>
                      <p className="indicator-note">Basé sur l'analyse prédictive et l'historique de maintenance</p>
                    </div>
                  </div>

                  <div className="indicator-card">
                    <div className="indicator-header">
                      <h3 className="indicator-title">État actuel</h3>
                      <div className={`indicator-badge ${getStatusClass(selectedEquipment.status)}`}>
                        {selectedEquipment.status}
                      </div>
                    </div>
                    <div className="indicator-body">
                      <p className="status-message">
                        {selectedEquipment.status === "Normal"
                          ? "L'équipement fonctionne normalement."
                          : selectedEquipment.status === "Attention"
                            ? "Une attention particulière est recommandée."
                            : "Une intervention est nécessaire rapidement."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Graphiques */}
              <div className="graphs-section">
                <h3 className="section-title">Analyse des paramètres</h3>

                <div className="graphs-grid">
                  {renderGraph(vibrationData, "Vibrations", "mm/s", 1.5)}
                  {renderGraph(temperatureData, "Température", "°C", 60)}
                  {renderGraph(currentData, "Courant", "A", 12.0)}
                </div>
              </div>

              {/* Recommandations */}
              <div className="recommendations-section">
                <h3 className="section-title">Recommandations</h3>

                <div className="recommendations-list">
                  <div className="recommendation-card">
                    <div className="recommendation-icon warning"></div>
                    <div className="recommendation-content">
                      <h4 className="recommendation-title">Vérifier les vibrations</h4>
                      <p className="recommendation-description">
                        Les niveaux de vibration approchent du seuil critique. Une inspection est recommandée dans les 7
                        jours.
                      </p>
                    </div>
                    <button className="btn btn-outline">Planifier</button>
                  </div>

                  <div className="recommendation-card">
                    <div className="recommendation-icon info"></div>
                    <div className="recommendation-content">
                      <h4 className="recommendation-title">Maintenance préventive</h4>
                      <p className="recommendation-description">
                        La maintenance préventive régulière est prévue pour le {selectedEquipment?.nextMaintenance}.
                        Préparez les pièces nécessaires.
                      </p>
                    </div>
                    <button className="btn btn-outline">Voir détails</button>
                  </div>

                  <div className="recommendation-card">
                    <div className="recommendation-icon success"></div>
                    <div className="recommendation-content">
                      <h4 className="recommendation-title">Optimisation énergétique</h4>
                      <p className="recommendation-description">
                        L'analyse des données suggère qu'une optimisation des paramètres pourrait réduire la
                        consommation d'énergie de 8%.
                      </p>
                    </div>
                    <button className="btn btn-outline">Appliquer</button>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}

export default PredictiveMaintenancePage

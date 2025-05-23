import { useState, useEffect, useMemo } from "react"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import Modal from "../../components/Modal/Modal"
import "./PredictiveMaintenancePage.css"
import { useSidebar } from "../../contexts/SidebarContext"
import { sensorAPI, equipmentAPI, interventionAPI } from "../../services/api"

function PredictiveMaintenancePage() {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const [selectedEquipment, setSelectedEquipment] = useState(null)
  const [timeRange, setTimeRange] = useState("month")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [equipments, setEquipments] = useState([])
  const [sensorData, setSensorData] = useState({
    vibrationData: { week: [], month: [], year: [] },
    temperatureData: { week: [], month: [], year: [] },
    currentData: { week: [], month: [], year: [] },
  })
  const [recommendations, setRecommendations] = useState([])
  
  // États pour les modals
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showOptimizationModal, setShowOptimizationModal] = useState(false)
  const [currentAction, setCurrentAction] = useState(null)
  const [maintenanceTasks, setMaintenanceTasks] = useState([])
  const [maintenanceParts, setMaintenanceParts] = useState([])
  const [technicians, setTechnicians] = useState([])

  // Récupérer les données des équipements et capteurs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Récupérer les équipements avec leur statut de santé
        const equipmentResponse = await equipmentAPI.getPredictiveEquipments();
        
        if (equipmentResponse.data && equipmentResponse.data.length > 0) {
          setEquipments(equipmentResponse.data);
          
          // Sélectionner le premier équipement par défaut
          const firstEquipment = equipmentResponse.data[0];
          setSelectedEquipment(firstEquipment);
          
          // Récupérer les données des capteurs pour le premier équipement
          await fetchSensorData(firstEquipment.id);
        } else {
          setError("Aucun équipement disponible.");
        }
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les données des équipements. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Récupérer la liste des techniciens pour le formulaire de planification
    const fetchTechnicians = async () => {
      try {
        const response = await interventionAPI.getTechnicians();
        if (response.data) {
          setTechnicians(response.data);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des techniciens:", err);
      }
    };
    
    fetchTechnicians();
  }, []);

  // Fonction pour déterminer le statut en fonction du score de santé
  const determineStatus = (healthScore) => {
    if (healthScore >= 80) return "Normal";
    if (healthScore >= 60) return "Attention";
    return "Critique";
  };

  // Charger les données de capteur pour un équipement spécifique
  const fetchSensorData = async (equipmentId) => {
    try {
      setError(null);
      
      // Récupérer les données des capteurs
      const sensorResponse = await sensorAPI.getSensorsByEquipment(equipmentId);
      
      if (sensorResponse.data) {
        setSensorData(sensorResponse.data.sensorReadings || {
          vibrationData: { week: [], month: [], year: [] },
          temperatureData: { week: [], month: [], year: [] },
          currentData: { week: [], month: [], year: [] }
        });
        
        // Récupérer les recommandations basées sur les données du capteur
        const recommendationsResponse = await sensorAPI.getRecommendationsForEquipment(equipmentId);
        if (recommendationsResponse.data) {
          setRecommendations(recommendationsResponse.data);
        } else {
          setRecommendations([]);
        }
      } else {
        setSensorData({
          vibrationData: { week: [], month: [], year: [] },
          temperatureData: { week: [], month: [], year: [] },
          currentData: { week: [], month: [], year: [] }
        });
        setRecommendations([]);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des données de capteur:", err);
      setError("Impossible de charger les données de capteur pour cet équipement.");
    }
  };

  const handleEquipmentChange = async (equipmentId) => {
    try {
      const equipment = equipments.find((eq) => eq.id === Number.parseInt(equipmentId));
      if (!equipment) return;
      
      setSelectedEquipment(equipment);
      setLoading(true);
      
      // Récupérer les données de capteurs et recommandations pour le nouvel équipement
      await fetchSensorData(equipment.id);
    } catch (err) {
      console.error("Erreur lors du changement d'équipement:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range)
  }

  // Gestionnaires pour les actions des boutons
  const handlePlanMaintenance = (action) => {
    setCurrentAction(action)
    setShowPlanModal(true)
  }

  const handleViewDetails = async (action) => {
    try {
      setCurrentAction(action);
      setLoading(true);
      
      if (selectedEquipment) {
        // Récupérer les détails de maintenance pour l'équipement sélectionné
        const tasksResponse = await interventionAPI.getMaintenanceTasks(selectedEquipment.id);
        if (tasksResponse.data) {
          setMaintenanceTasks(tasksResponse.data);
        } else {
          setMaintenanceTasks([]);
        }
        
        // Récupérer les pièces nécessaires pour la maintenance
        const partsResponse = await interventionAPI.getMaintenanceParts(selectedEquipment.id);
        if (partsResponse.data) {
          setMaintenanceParts(partsResponse.data);
        } else {
          setMaintenanceParts([]);
        }
      }
      
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Erreur lors du chargement des détails de maintenance:", err);
    } finally {
      setLoading(false);
    }
  }

  const handleApplyOptimization = (action) => {
    setCurrentAction(action)
    setShowOptimizationModal(true)
  }

  const handleConfirmPlan = async () => {
    try {
      // Récupérer les données du formulaire
      const planDate = document.getElementById('plan-date').value;
      const technicianId = document.getElementById('plan-technician').value;
      const priority = document.getElementById('plan-priority').value;
      const notes = document.getElementById('plan-notes').value;
      
      // Créer une intervention basée sur la recommandation
      const interventionData = {
        equipmentId: selectedEquipment.id,
        type: "Préventive",
        priority: priority === "urgent" ? "Critique" : priority === "high" ? "Haute" : "Moyenne",
        status: "Planifiée",
        date: planDate,
        description: `${currentAction.title}: ${currentAction.description} ${notes ? `Notes: ${notes}` : ''}`,
        technicianId: technicianId
      };
      
      // Appel à l'API pour créer l'intervention
      await interventionAPI.createIntervention(interventionData);
      
      alert(`Maintenance planifiée avec succès pour ${selectedEquipment?.name}`);
      setShowPlanModal(false);
    } catch (error) {
      console.error("Erreur lors de la planification de la maintenance:", error);
      alert(`Erreur lors de la planification: ${error.message}`);
    }
  };

  const handleApplyOptimizationConfirm = async () => {
    try {
      // Appeler l'API pour appliquer les optimisations
      await sensorAPI.applyOptimization(selectedEquipment.id);
      
      alert(`Optimisation énergétique appliquée avec succès à ${selectedEquipment?.name}`);
      setShowOptimizationModal(false);
      
      // Rafraîchir les données des capteurs après l'optimisation
      fetchSensorData(selectedEquipment.id);
    } catch (error) {
      console.error("Erreur lors de l'application de l'optimisation:", error);
      alert(`Erreur lors de l'application: ${error.message}`);
    }
  };

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

  // Fonction pour générer un graphique simple en CSS
  const renderGraph = (data, label, unit, threshold = null) => {
    const currentData = data[timeRange] || [];
    const max = currentData.length > 0 ? Math.max(...currentData) * 1.2 : 100;
    const thresholdPercent = threshold ? (threshold / max) * 100 : null;

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
        <Header title="Maintenance Prédictive" onToggleSidebar={toggleSidebar} />

        <main className="predictive-main">
          {loading ? (
            <div className="loading-indicator">Chargement des données...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
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
                  {renderGraph(sensorData.vibrationData || {}, "Vibrations", "mm/s", 1.5)}
                  {renderGraph(sensorData.temperatureData || {}, "Température", "°C", 60)}
                  {renderGraph(sensorData.currentData || {}, "Courant", "A", 12.0)}
                </div>
              </div>

              {/* Recommandations */}
              <div className="recommendations-section">
                <h3 className="section-title">Recommandations</h3>

                {recommendations.length > 0 ? (
                  <div className="recommendations-list">
                    {recommendations.map((recommendation) => (
                      <div key={recommendation.id} className="recommendation-card">
                        <div className={`recommendation-icon ${recommendation.type}`}></div>
                        <div className="recommendation-content">
                          <h4 className="recommendation-title">{recommendation.title}</h4>
                          <p className="recommendation-description">{recommendation.description}</p>
                        </div>
                        {recommendation.action === "Planifier" ? (
                          <button 
                            className="btn btn-outline"
                            onClick={() => handlePlanMaintenance(recommendation)}
                          >
                            {recommendation.action}
                          </button>
                        ) : recommendation.action === "Voir détails" ? (
                          <button 
                            className="btn btn-outline"
                            onClick={() => handleViewDetails(recommendation)}
                          >
                            {recommendation.action}
                          </button>
                        ) : (
                          <button 
                            className="btn btn-outline"
                            onClick={() => handleApplyOptimization(recommendation)}
                          >
                            {recommendation.action}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="no-data-message">
                    Aucune recommandation disponible pour cet équipement.
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modal de Planification */}
      <Modal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        title="Planifier une intervention"
        size="medium"
      >
        <div className="planning-modal">
          <div className="planning-content">
            <h3>Vérification des {currentAction?.title} pour {selectedEquipment?.name}</h3>
            
            <div className="plan-form">
              <div className="form-group">
                <label htmlFor="plan-date">Date d'intervention</label>
                <input 
                  type="date" 
                  id="plan-date" 
                  className="form-control"
                  defaultValue={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="plan-technician">Technicien</label>
                <select id="plan-technician" className="form-control">
                  <option value="">Sélectionnez un technicien</option>
                  {technicians.map(technician => (
                    <option key={technician.id} value={technician.id}>
                      {technician.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="plan-priority">Priorité</label>
                <select id="plan-priority" className="form-control">
                  <option value="normal">Normale</option>
                  <option value="high">Élevée</option>
                  <option value="urgent">Urgente</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="plan-notes">Notes</label>
                <textarea 
                  id="plan-notes" 
                  className="form-control" 
                  rows="3"
                  placeholder="Ajoutez des notes ou instructions spécifiques..."
                ></textarea>
              </div>
            </div>
          </div>
          
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowPlanModal(false)}>
              Annuler
            </button>
            <button className="btn btn-primary" onClick={handleConfirmPlan}>
              Confirmer
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de Détails */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Détails de maintenance préventive"
        size="medium"
      >
        <div className="details-modal">
          <div className="details-content">
            <div className="details-header">
              <h3>{selectedEquipment?.name}</h3>
              <span className="details-date">Prévue le: {selectedEquipment?.nextMaintenance}</span>
            </div>
            
            <div className="details-section">
              <h4>Opérations à effectuer</h4>
              {maintenanceTasks.length > 0 ? (
                <ul className="details-checklist">
                  {maintenanceTasks.map((task) => (
                    <li key={task.id} className="checklist-item">
                      <input type="checkbox" id={`task-${task.id}`} />
                      <label htmlFor={`task-${task.id}`}>{task.description}</label>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Aucune tâche de maintenance définie pour cet équipement.</p>
              )}
            </div>
            
            <div className="details-section">
              <h4>Pièces nécessaires</h4>
              {maintenanceParts.length > 0 ? (
                <div className="parts-list">
                  {maintenanceParts.map((part) => (
                    <div key={part.id} className="part-item">
                      <span className="part-name">{part.name}</span>
                      <span className="part-ref">Réf: {part.reference}</span>
                      <span className={`part-stock ${part.inStock ? part.stockLevel === 'low' ? 'low' : 'available' : 'unavailable'}`}>
                        {part.inStock ? (part.stockLevel === 'low' ? 'Stock faible' : 'En stock') : 'Non disponible'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p>Aucune pièce définie pour cette maintenance.</p>
              )}
            </div>
          </div>
          
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowDetailsModal(false)}>
              Fermer
            </button>
            <button className="btn btn-primary">
              Exporter en PDF
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal d'Optimisation */}
      <Modal
        isOpen={showOptimizationModal}
        onClose={() => setShowOptimizationModal(false)}
        title="Appliquer l'optimisation énergétique"
        size="medium"
      >
        <div className="optimization-modal">
          <div className="optimization-content">
            <div className="optimization-header">
              <div className="optimization-icon success"></div>
              <div className="optimization-summary">
                <h3>Optimisation énergétique pour {selectedEquipment?.name}</h3>
                <p>{currentAction?.description}</p>
              </div>
            </div>
            
            {currentAction?.optimizationParams ? (
              <div className="optimization-params">
                <h4>Paramètres à modifier</h4>
                
                {currentAction.optimizationParams.map((param, index) => (
                  <div key={index} className="param-item">
                    <div className="param-info">
                      <span className="param-name">{param.name}</span>
                      <div className="param-change">
                        <span className="param-old">{param.currentValue}</span>
                        <span className="param-arrow">→</span>
                        <span className="param-new">{param.newValue}</span>
                      </div>
                    </div>
                    <div className={`param-impact ${param.impact.includes('-') ? 'positive' : 'negative'}`}>
                      {param.impact}
                    </div>
                  </div>
                ))}
                
                {currentAction.warning && (
                  <div className="optimization-warning">
                    <span className="warning-icon">⚠️</span>
                    <p>{currentAction.warning}</p>
                  </div>
                )}
              </div>
            ) : (
              <p>Données d'optimisation non disponibles.</p>
            )}
          </div>
          
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowOptimizationModal(false)}>
              Annuler
            </button>
            <button className="btn btn-success" onClick={handleApplyOptimizationConfirm}>
              Appliquer les changements
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default PredictiveMaintenancePage

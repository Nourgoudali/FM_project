import { useState, useEffect, useMemo } from "react"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import Modal from "../../components/Modal/Modal"
import "./PredictiveMaintenancePage.css"
import { useSidebar } from "../../contexts/SidebarContext"
import { sensorAPI, equipmentAPI, interventionAPI, userAPI } from "../../services/api"

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
        const equipmentResponse = await equipmentAPI.getAllEquipments();
        
        if (equipmentResponse.data && equipmentResponse.data.length > 0) {
          // Transformer les données pour ajouter les informations de santé si elles sont manquantes
          const equipmentsWithHealth = equipmentResponse.data.map(equipment => ({
            ...equipment,
            healthScore: equipment.healthScore || Math.floor(Math.random() * 100),
            status: equipment.status || determineStatus(equipment.healthScore || Math.floor(Math.random() * 100)),
            nextMaintenance: equipment.nextMaintenance || new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
          }));
          
          setEquipments(equipmentsWithHealth);
          
          // Sélectionner le premier équipement par défaut
          const firstEquipment = equipmentsWithHealth[0];
          setSelectedEquipment(firstEquipment);
          
          // Récupérer les données des capteurs pour le premier équipement
          if (!firstEquipment || !firstEquipment._id) {
            setError("Impossible de trouver l'ID de l'équipement");
            return;
          }
          await fetchSensorData(firstEquipment._id.toString());
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
        // Utiliser l'API existante pour récupérer les utilisateurs avec le rôle technicien
        const response = await userAPI.getAllUsers();
        
        if (response && response.data) {
          // Filtrer pour ne garder que les techniciens
          const technicianUsers = response.data
            .filter(user => user && user.role === 'technician')
            .map(user => ({
              ...user,
              status: user.status || 'active', // Provide a default status if not present
              availability: user.availability || 100 // Provide a default availability if not present
            }));
          
          setTechnicians(technicianUsers);
        }
      } catch (err) {
        console.error("Erreur lors du chargement des techniciens:", err);
        setError("Impossible de charger la liste des techniciens. Veuillez réessayer plus tard.");
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
      
      // Vérifier si l'ID est valide
      if (!equipmentId) {
        throw new Error('ID d\'équipement invalide');
      }
      
      // Récupérer les données des capteurs
      const sensorData = await sensorAPI.getSensorsByEquipment(equipmentId);
      
      if (sensorData && sensorData.length > 0) {
        // Organiser les données par type de capteur et période
        const now = new Date();
        const oneWeekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
        const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
        
        const organizedData = {
          vibrationData: { week: [], month: [], year: [] },
          temperatureData: { week: [], month: [], year: [] },
          currentData: { week: [], month: [], year: [] }
        };
        
        // Organiser les données par type de métrique et période
        sensorData.forEach(reading => {
          const readingDate = new Date(reading.timestamp);
          
          if (reading.metric === 'vibration') {
            if (readingDate >= oneWeekAgo) organizedData.vibrationData.week.push(reading);
            if (readingDate >= oneMonthAgo) organizedData.vibrationData.month.push(reading);
            organizedData.vibrationData.year.push(reading);
          } else if (reading.metric === 'temperature') {
            if (readingDate >= oneWeekAgo) organizedData.temperatureData.week.push(reading);
            if (readingDate >= oneMonthAgo) organizedData.temperatureData.month.push(reading);
            organizedData.temperatureData.year.push(reading);
          } else if (reading.metric === 'current') {
            if (readingDate >= oneWeekAgo) organizedData.currentData.week.push(reading);
            if (readingDate >= oneMonthAgo) organizedData.currentData.month.push(reading);
            organizedData.currentData.year.push(reading);
          }
        });
        
        // Trier les données par date (plus récent en premier)
        Object.keys(organizedData).forEach(metric => {
          Object.keys(organizedData[metric]).forEach(period => {
            organizedData[metric][period].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
          });
        });
        
        setSensorData(organizedData);
        
        // Récupérer les recommandations
        try {
          const recommendations = await sensorAPI.getRecommendationsForEquipment(equipmentId);
          if (recommendations && recommendations.length > 0) {
            setRecommendations(recommendations);
          } else {
            setRecommendations([]);
          }
        } catch (recError) {
          console.error("Erreur lors du chargement des recommandations:", recError);
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
      setSensorData({
        vibrationData: { week: [], month: [], year: [] },
        temperatureData: { week: [], month: [], year: [] },
        currentData: { week: [], month: [], year: [] }
      });
      setRecommendations([]);
    }
  };

  const handleEquipmentChange = async (equipmentId) => {
    try {
      // Vérifier si l'ID est valide
      if (!equipmentId) {
        throw new Error('ID d\'équipement invalide');
      }
      
      const equipment = equipments.find((eq) => 
        (eq._id && eq._id.toString() === equipmentId) || 
        (eq.id && eq.id.toString() === equipmentId)
      );
      
      if (!equipment) {
        throw new Error('Équipement non trouvé');
      }
      
      setSelectedEquipment(equipment);
      setLoading(true);
      setError(null);
      
      // Récupérer les données de capteurs et recommandations pour le nouvel équipement
      await fetchSensorData(equipment._id || equipment.id);
    } catch (err) {
      console.error("Erreur lors du changement d'équipement:", err);
      setError("Impossible de charger les données pour cet équipement.");
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
        try {
          // Récupérer les détails de maintenance pour l'équipement sélectionné
          const tasksResponse = await interventionAPI.getMaintenanceTasks(selectedEquipment._id || selectedEquipment.id);
          if (tasksResponse && tasksResponse.data) {
            setMaintenanceTasks(tasksResponse.data);
          } else {
            setMaintenanceTasks([]);
          }
        } catch (taskError) {
          console.error("Erreur lors du chargement des tâches de maintenance:", taskError);
          setMaintenanceTasks([]);
        }
        
        try {
          // Récupérer les pièces nécessaires pour la maintenance
          const partsResponse = await interventionAPI.getMaintenanceParts(selectedEquipment._id || selectedEquipment.id);
          if (partsResponse && partsResponse.data) {
            setMaintenanceParts(partsResponse.data);
          } else {
            setMaintenanceParts([]);
          }
        } catch (partsError) {
          console.error("Erreur lors du chargement des pièces de maintenance:", partsError);
          setMaintenanceParts([]);
        }
      }
      
      setShowDetailsModal(true);
    } catch (err) {
      console.error("Erreur lors du chargement des détails de maintenance:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyOptimization = (action) => {
    setCurrentAction(action)
    setShowOptimizationModal(true)
  }

  const handleConfirmPlan = async () => {
    try {
      setLoading(true);
      // Récupérer les données du formulaire
      const planDate = document.getElementById('plan-date').value;
      const technicianId = document.getElementById('plan-technician').value;
      const priority = document.getElementById('plan-priority').value;
      const notes = document.getElementById('plan-notes').value;
      
      if (!planDate) {
        alert("Veuillez sélectionner une date d'intervention");
        return;
      }
      
      // Créer une intervention basée sur la recommandation
      const interventionData = {
        equipmentId: selectedEquipment._id || selectedEquipment.id,
        type: "Préventive",
        priority: priority === "urgent" ? "Critique" : priority === "high" ? "Haute" : "Moyenne",
        status: "Planifiée",
        date: planDate,
        description: `${currentAction.title}: ${currentAction.description} ${notes ? `Notes: ${notes}` : ''}`,
        technicianId: technicianId || null
      };
      
      // Appel à l'API pour créer l'intervention
      const response = await interventionAPI.createIntervention(interventionData);
      
      if (response && response.data) {
      alert(`Maintenance planifiée avec succès pour ${selectedEquipment?.name}`);
      } else {
        alert("La planification a été créée mais aucune donnée n'a été retournée");
      }
      
      setShowPlanModal(false);
    } catch (error) {
      console.error("Erreur lors de la planification de la maintenance:", error);
      alert(`Erreur lors de la planification: ${error.message || "Une erreur est survenue"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyOptimizationConfirm = async () => {
    try {
      setLoading(true);
      
      // Appeler l'API pour appliquer les optimisations
      const response = await sensorAPI.applyOptimization(selectedEquipment._id || selectedEquipment.id);
      
      if (response && response.data) {
        alert(response.data.message || `Optimisation énergétique appliquée avec succès à ${selectedEquipment?.name}`);
      } else {
      alert(`Optimisation énergétique appliquée avec succès à ${selectedEquipment?.name}`);
      }
      
      setShowOptimizationModal(false);
      
      // Rafraîchir les données des capteurs après l'optimisation
      await fetchSensorData(selectedEquipment._id || selectedEquipment.id);
    } catch (error) {
      console.error("Erreur lors de l'application de l'optimisation:", error);
      alert(`Erreur lors de l'application: ${error.message || "Une erreur est survenue."}`);
    } finally {
      setLoading(false);
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
                      value={selectedEquipment?._id || selectedEquipment?.id || ""}
                      onChange={(e) => handleEquipmentChange(e.target.value)}
                      className="select-input"
                    >
                      {equipments.map((equipment) => (
                        <option key={equipment._id || equipment.id} value={equipment._id || equipment.id}>
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
                      <div key={recommendation._id || recommendation.id} className="recommendation-card">
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
                  {technicians.map((technician, index) => (
                    <option key={technician._id || technician.id || `tech-${index}`} value={technician._id || technician.id}>
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
                  {maintenanceTasks.map((task, index) => (
                    <li key={task._id || task.id || `task-${index}`} className="checklist-item">
                      <input type="checkbox" id={`task-${task._id || task.id || index}`} />
                      <label htmlFor={`task-${task._id || task.id || index}`}>{task.description}</label>
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
                  {maintenanceParts.map((part, index) => (
                    <div key={part._id || part.id || `part-${index}`} className="part-item">
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

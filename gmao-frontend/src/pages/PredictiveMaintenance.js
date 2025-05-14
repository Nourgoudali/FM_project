import React, { useState, useEffect } from 'react';
import '../styles/PredictiveMaintenance.css';

const PredictiveMaintenance = () => {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation du chargement des prédictions
    setTimeout(() => {
      setPredictions([
        { id: 1, equipment: 'Machine A', risk: 'Élevé', predictedFailure: 'Pompe hydraulique', estimatedDate: '2023-09-30' },
        { id: 2, equipment: 'Machine B', risk: 'Moyen', predictedFailure: 'Système électrique', estimatedDate: '2023-10-15' },
        { id: 3, equipment: 'Machine C', risk: 'Faible', predictedFailure: 'Filtre', estimatedDate: '2023-11-20' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="predictive-maintenance-container">
      <h1>Maintenance Prédictive</h1>
      {loading ? (
        <p>Chargement des prédictions...</p>
      ) : (
        <div>
          <div className="analytics-summary">
            <div className="analytics-card">
              <h3>Risque élevé</h3>
              <p className="analytics-value high-risk">1</p>
            </div>
            <div className="analytics-card">
              <h3>Risque moyen</h3>
              <p className="analytics-value medium-risk">1</p>
            </div>
            <div className="analytics-card">
              <h3>Risque faible</h3>
              <p className="analytics-value low-risk">1</p>
            </div>
          </div>
          
          <h2>Prédictions de pannes</h2>
          <table className="prediction-table">
            <thead>
              <tr>
                <th>Équipement</th>
                <th>Niveau de risque</th>
                <th>Panne prédite</th>
                <th>Date estimée</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map(prediction => (
                <tr key={prediction.id}>
                  <td>{prediction.equipment}</td>
                  <td>
                    <span className={`risk-badge ${prediction.risk.toLowerCase()}`}>
                      {prediction.risk}
                    </span>
                  </td>
                  <td>{prediction.predictedFailure}</td>
                  <td>{prediction.estimatedDate}</td>
                  <td>
                    <button>Planifier maintenance</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PredictiveMaintenance; 
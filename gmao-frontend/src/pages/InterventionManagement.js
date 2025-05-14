import React, { useState, useEffect } from 'react';
import '../styles/InterventionManagement.css';

const InterventionManagement = () => {
  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation du chargement des interventions
    setTimeout(() => {
      setInterventions([
        { id: 1, title: 'Maintenance préventive', equipment: 'Machine A', status: 'Planifiée', date: '2023-09-15' },
        { id: 2, title: 'Réparation urgente', equipment: 'Machine B', status: 'En cours', date: '2023-09-10' },
        { id: 3, title: 'Inspection annuelle', equipment: 'Machine C', status: 'Terminée', date: '2023-09-05' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="intervention-management-container">
      <h1>Gestion des Interventions</h1>
      {loading ? (
        <p>Chargement des interventions...</p>
      ) : (
        <div>
          <button className="add-intervention-btn">Nouvelle intervention</button>
          <table className="intervention-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Titre</th>
                <th>Équipement</th>
                <th>Statut</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {interventions.map(intervention => (
                <tr key={intervention.id}>
                  <td>{intervention.id}</td>
                  <td>{intervention.title}</td>
                  <td>{intervention.equipment}</td>
                  <td>
                    <span className={`status-badge ${intervention.status.toLowerCase().replace(' ', '-')}`}>
                      {intervention.status}
                    </span>
                  </td>
                  <td>{intervention.date}</td>
                  <td>
                    <button>Détails</button>
                    <button>Modifier</button>
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

export default InterventionManagement; 
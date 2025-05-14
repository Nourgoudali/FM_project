import React from 'react';
import '../styles/Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h1>Tableau de bord</h1>
      <div className="dashboard-content">
        <div className="dashboard-card">
          <h2>Interventions</h2>
          <p>Aucune intervention en attente</p>
        </div>
        <div className="dashboard-card">
          <h2>Équipements</h2>
          <p>Tous les équipements fonctionnent normalement</p>
        </div>
        <div className="dashboard-card">
          <h2>Alertes</h2>
          <p>Aucune alerte à signaler</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 
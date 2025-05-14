import React, { useState, useEffect } from 'react';
import '../styles/EquipmentManagement.css';

const EquipmentManagement = () => {
  const [equipments, setEquipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation du chargement des équipements
    setTimeout(() => {
      setEquipments([
        { id: 1, name: 'Machine A', type: 'Production', status: 'Opérationnel', lastMaintenance: '2023-08-15' },
        { id: 2, name: 'Machine B', type: 'Emballage', status: 'En maintenance', lastMaintenance: '2023-09-01' },
        { id: 3, name: 'Machine C', type: 'Production', status: 'Hors service', lastMaintenance: '2023-07-20' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="equipment-management-container">
      <h1>Gestion des Équipements</h1>
      {loading ? (
        <p>Chargement des équipements...</p>
      ) : (
        <div>
          <button className="add-equipment-btn">Ajouter un équipement</button>
          <table className="equipment-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Type</th>
                <th>Statut</th>
                <th>Dernière maintenance</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipments.map(equipment => (
                <tr key={equipment.id}>
                  <td>{equipment.id}</td>
                  <td>{equipment.name}</td>
                  <td>{equipment.type}</td>
                  <td>
                    <span className={`status-badge ${equipment.status.toLowerCase().replace(' ', '-')}`}>
                      {equipment.status}
                    </span>
                  </td>
                  <td>{equipment.lastMaintenance}</td>
                  <td>
                    <button>Détails</button>
                    <button>Maintenance</button>
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

export default EquipmentManagement; 
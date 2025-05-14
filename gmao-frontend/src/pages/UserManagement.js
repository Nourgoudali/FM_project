import React, { useState, useEffect } from 'react';
import '../styles/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation du chargement des utilisateurs
    setTimeout(() => {
      setUsers([
        { id: 1, name: 'Utilisateur 1', email: 'user1@example.com', role: 'Admin' },
        { id: 2, name: 'Utilisateur 2', email: 'user2@example.com', role: 'Technicien' },
        { id: 3, name: 'Utilisateur 3', email: 'user3@example.com', role: 'Responsable' }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="user-management-container">
      <h1>Gestion des Utilisateurs</h1>
      {loading ? (
        <p>Chargement des utilisateurs...</p>
      ) : (
        <table className="user-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <button>Modifier</button>
                  <button>Supprimer</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default UserManagement; 
import React, { useState, useEffect } from 'react';
import '../styles/StockManagement.css';

const StockManagement = () => {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulation du chargement des articles de stock
    setTimeout(() => {
      setStockItems([
        { id: 1, name: 'Filtre à huile', category: 'Filtres', quantity: 15, threshold: 5, unitPrice: 25.50 },
        { id: 2, name: 'Courroie de transmission', category: 'Pièces mécaniques', quantity: 8, threshold: 3, unitPrice: 45.75 },
        { id: 3, name: 'Carte électronique', category: 'Pièces électroniques', quantity: 3, threshold: 2, unitPrice: 120.00 },
        { id: 4, name: 'Huile moteur (5L)', category: 'Lubrifiants', quantity: 20, threshold: 5, unitPrice: 32.99 }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className="stock-management-container">
      <h1>Gestion des Stocks</h1>
      {loading ? (
        <p>Chargement des articles...</p>
      ) : (
        <div>
          <div className="stock-summary">
            <div className="stock-card">
              <h3>Total des articles</h3>
              <p className="stock-value">{stockItems.length}</p>
            </div>
            <div className="stock-card">
              <h3>Articles sous seuil</h3>
              <p className="stock-value warning">{stockItems.filter(item => item.quantity <= item.threshold).length}</p>
            </div>
            <div className="stock-card">
              <h3>Valeur du stock</h3>
              <p className="stock-value">
                {stockItems.reduce((total, item) => total + (item.quantity * item.unitPrice), 0).toFixed(2)} €
              </p>
            </div>
          </div>

          <div className="stock-actions">
            <button className="add-stock-btn">Ajouter un article</button>
            <button className="order-stock-btn">Commander des articles</button>
            <div className="search-container">
              <input type="text" placeholder="Rechercher un article..." className="search-input" />
              <button className="search-btn">Rechercher</button>
            </div>
          </div>

          <table className="stock-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nom</th>
                <th>Catégorie</th>
                <th>Quantité</th>
                <th>Seuil d'alerte</th>
                <th>Prix unitaire</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {stockItems.map(item => (
                <tr key={item.id} className={item.quantity <= item.threshold ? 'low-stock' : ''}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{item.category}</td>
                  <td>{item.quantity}</td>
                  <td>{item.threshold}</td>
                  <td>{item.unitPrice.toFixed(2)} €</td>
                  <td>
                    <button className="edit-btn">Modifier</button>
                    <button className="adjust-btn">Ajuster</button>
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

export default StockManagement; 
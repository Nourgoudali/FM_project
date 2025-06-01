import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaEye } from 'react-icons/fa';
import { inventaireAPI } from '../../services/api';
import AddInventaireForm from '../../components/Inventaire/AddInventaireForm';
import ViewInventaireDetails from '../../components/Inventaire/ViewInventaireDetails';
import Sidebar from "../../components/Sidebar/Sidebar";
import Header from "../../components/Header/Header";
import { useSidebar } from "../../contexts/SidebarContext";
import './InventairePage.css';

const InventairePage = () => {
  const { sidebarOpen } = useSidebar();
  const [inventaires, setInventaires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedInventaireId, setSelectedInventaireId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEcart, setFilterEcart] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'dateInventaire', direction: 'descending' });

  // Récupération des inventaires
  const fetchInventaires = async () => {
    try {
      setLoading(true);
      const response = await inventaireAPI.getAllInventaires();
      setInventaires(response.data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors de la récupération des inventaires:", err);
      setError("Impossible de charger les inventaires. Veuillez réessayer plus tard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventaires();
  }, []);

  // Gestionnaire pour l'ajout d'un inventaire
  const handleAddSuccess = () => {
    fetchInventaires();
  };

  // Gestionnaire pour la suppression d'un inventaire
  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet inventaire ?")) {
      try {
        await inventaireAPI.deleteInventaire(id);
        fetchInventaires();
      } catch (err) {
        console.error("Erreur lors de la suppression de l'inventaire:", err);
        setError("Impossible de supprimer l'inventaire. Veuillez réessayer plus tard.");
      }
    }
  };

  // Gestionnaire pour la vue des détails d'un inventaire
  const handleViewDetails = (id) => {
    setSelectedInventaireId(id);
    setShowViewModal(true);
  };

  // Gestionnaire pour le tri des données
  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  // Fonction de tri
  const getSortedInventaires = () => {
    let sortableItems = [...inventaires];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        // Gestion spéciale pour les champs imbriqués comme produit.reference
        if (sortConfig.key.includes('.')) {
          const keys = sortConfig.key.split('.');
          let aValue = a;
          let bValue = b;
          
          for (const key of keys) {
            aValue = aValue?.[key];
            bValue = bValue?.[key];
          }
          
          if (aValue === null || aValue === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (bValue === null || bValue === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
          
          if (typeof aValue === 'string') {
            return sortConfig.direction === 'ascending' 
              ? aValue.localeCompare(bValue) 
              : bValue.localeCompare(aValue);
          }
          
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        } else {
          if (a[sortConfig.key] === null || a[sortConfig.key] === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (b[sortConfig.key] === null || b[sortConfig.key] === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
          
          if (typeof a[sortConfig.key] === 'string') {
            return sortConfig.direction === 'ascending' 
              ? a[sortConfig.key].localeCompare(b[sortConfig.key]) 
              : b[sortConfig.key].localeCompare(a[sortConfig.key]);
          }
          
          return sortConfig.direction === 'ascending' 
            ? a[sortConfig.key] - b[sortConfig.key] 
            : b[sortConfig.key] - a[sortConfig.key];
        }
      });
    }
    return sortableItems;
  };
  
  const sortedInventaires = getSortedInventaires();

  // Filtrer les inventaires
  const getFilteredInventaires = () => {
    return sortedInventaires.filter(inventaire => {
      // Filtrer par terme de recherche
      const searchMatch = searchTerm === '' || 
        inventaire.produit?.reference?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        inventaire.produit?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        inventaire.produit?.lieuStockage?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtrer par écart
      const ecartMatch = filterEcart ? inventaire.ecart !== 0 : true;
      
      return searchMatch && ecartMatch;
    });
  };
  
  const filteredInventaires = getFilteredInventaires();

  // Formatage de la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="inventaire-page-container">
      <Sidebar />
      <div className={`inventaire-main-content ${sidebarOpen ? "" : "sidebar-closed"}`}>
        <Header title="Gestion des Inventaires" />
        <div className="inventaire-container">
          <div className="inventaire-header">
          <div className="inventaire-search">
          <input
            type="text"
            placeholder="Rechercher un produit ou lieu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
            <button 
              className="inventaire-add-button" 
              onClick={() => setShowAddModal(true)}
            >
              <FaPlus /> Ajouter un inventaire
            </button>
          </div>
      {error && <div className="inventaire-error">{error}</div>}

      {loading ? (
        <div className="inventaire-loading">Chargement des inventaires...</div>
      ) : (
        <div className="inventaire-table-container">
          <table className="inventaire-table">
            <thead>
              <tr>
                <th>
                  Référence Produit
                </th>
                <th>
                  Nom du Produit
                </th>
                <th>
                  Lieu de Stockage
                </th>
                <th>
                  Actions
                </th>
                </tr>
            </thead>
            <tbody>
              {filteredInventaires.length > 0 ? (
                filteredInventaires.map((inventaire) => (
                  <tr key={inventaire._id}>
                    <td>{inventaire.traitement?.produits?.[inventaire.produitIndex]?.produit?.reference || 'N/A'}</td>
                    <td>{inventaire.traitement?.produits?.[inventaire.produitIndex]?.produit?.name || 'N/A'}</td>
                    <td>{inventaire.traitement?.produits?.[inventaire.produitIndex]?.produit?.lieuStockage || 'N/A'}</td>
                    <td className="inventaire-actions">
                      <button 
                        className="inventaire-view-button"
                        onClick={() => handleViewDetails(inventaire._id)}
                        title="Voir les détails"
                      >
                        <FaEye />
                      </button>
                      <button 
                        className="inventaire-delete-button"
                        onClick={() => handleDelete(inventaire._id)}
                        title="Supprimer"
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="inventaire-no-data">
                    Aucun inventaire trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal pour ajouter un inventaire */}
      {showAddModal && (
        <AddInventaireForm
          onClose={() => setShowAddModal(false)}
          onAddSuccess={handleAddSuccess}
        />
      )}

      {/* Modal pour voir les détails d'un inventaire */}
      {showViewModal && selectedInventaireId && (
        <ViewInventaireDetails
          inventaireId={selectedInventaireId}
          onClose={() => {
            setShowViewModal(false);
            setSelectedInventaireId(null);
          }}
        />
      )}
        </div>
      </div>
    </div>
  );
};

export default InventairePage;

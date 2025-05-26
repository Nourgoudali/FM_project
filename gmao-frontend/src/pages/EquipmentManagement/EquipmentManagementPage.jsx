"use client"

import { useState, useEffect } from "react"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import Modal from "../../components/Modal/Modal"
import { AddEquipmentForm } from "../../components/Equipment/AddEquipmentForm"
import ViewEquipmentModal from "../../components/Equipment/ViewEquipmentModal"
import EditEquipmentModal from "../../components/Equipment/EditEquipmentModal"
import "./EquipmentManagementPage.css"
import { useSidebar } from "../../contexts/SidebarContext"
import { equipmentAPI } from "../../services/api"
import { FaHistory, FaEdit, FaTrash, FaEye } from "react-icons/fa"

const EquipmentManagementPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [equipments, setEquipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null);

  // États pour les modaux
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState(null)

  useEffect(() => {
    // Appel de la fonction fetchEquipments au chargement du composant
    fetchEquipments();
  }, [])

  // Filtrer les équipements en fonction de la recherche et du filtre de statut
  const filteredEquipments = equipments.filter((equipment) => {
    // Convert reference to consistent format (remove spaces and hyphens)
    const cleanReference = (equipment?.reference || '').replace(/\s|-/g, '').toLowerCase();
    
    const matchesSearch = cleanReference.includes(searchTerm.toLowerCase()) ||
      (equipment?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (equipment?.category || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (equipment?.location || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (equipment?.brand || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || 
      (equipment?.status || '').toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "En service":
        return "bg-green-500"
      case "En maintenance":
        return "bg-yellow-500"
      case "Hors service":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getAvailabilityColor = (availability) => {
    if (availability >= 90) return "bg-green-500"
    if (availability >= 70) return "bg-yellow-500"
    return "bg-red-500"
  }

  const handleAddEquipment = async (newEquipment, error = null) => {
    // If there's an error, show it and return
    if (error) {
      console.error("Erreur lors de l'ajout de l'équipement:", error);
      setErrorMessage(error);
      return;
    }

    try {
      // Only update state if we have new equipment
      if (newEquipment) {
        // Fermer le modal d'abord
        setShowAddModal(false);
        setErrorMessage(null);
        
        // Rafraîchir la liste complète des équipements depuis le serveur
        await fetchEquipments();
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'état:", error);
      setErrorMessage("Une erreur est survenue lors de la mise à jour de l'état.");
    }
  }
  
  // Fonction pour rafraîchir la liste des équipements
  const fetchEquipments = async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorMessage(null);
      
      // Utilisation de l'API pour récupérer les équipements
      const response = await equipmentAPI.getAllEquipments();
      
      if (response.data) {
        setEquipments(response.data);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des équipements:', error);
      setError('Erreur lors de la récupération des équipements. Veuillez réessayer.');
      setErrorMessage('Erreur lors de la récupération des équipements. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  // Handlers pour les modaux
  const handleOpenEditModal = (equipment) => {
    setSelectedEquipment({ ...equipment, id: equipment._id })
    setShowEditModal(true)
  }
  
  const handleOpenDeleteModal = (equipment) => {
    setSelectedEquipment(equipment)
    setShowDeleteModal(true)
  }

  const handleOpenViewModal = (equipment) => {
    setSelectedEquipment(equipment)
    setShowViewModal(true)
  }
  
  const handleCloseModals = () => {
    setShowEditModal(false)
    setShowDeleteModal(false)
    setShowViewModal(false)
    setSelectedEquipment(null)
  }

  // Handler pour édition (remplace l'équipement dans la liste)
  const handleEditEquipment = async (updatedEquipment) => {
    try {
      // Ensure we have the ID from the original equipment
      const equipmentId = updatedEquipment._id || updatedEquipment.id;
      if (!equipmentId) {
        throw new Error('ID d\'équipement non valide');
      }

      const response = await equipmentAPI.updateEquipment(equipmentId, updatedEquipment);
      if (response.data) {
        // Fermer d'abord les modaux
        handleCloseModals();
        
        // Rafraîchir la liste complète des équipements
        await fetchEquipments();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'équipement:", error);
      alert("Une erreur est survenue lors de la mise à jour de l'équipement");
    }
  }

  // Handler pour suppression (modal)
  const handleDeleteEquipmentModal = async () => {
    if (selectedEquipment) {
      try {
        // Utiliser _id pour MongoDB ou id pour les données locales
        const equipmentId = selectedEquipment._id || selectedEquipment.id;
        if (!equipmentId) {
          throw new Error('ID d\'équipement non valide');
        }
        
        console.log('Suppression de l\'équipement avec ID:', equipmentId);
        const response = await equipmentAPI.deleteEquipment(equipmentId);
        
        if (response.status === 200) {
          // Fermer d'abord les modaux
          handleCloseModals();
          
          // Rafraîchir la liste complète des équipements
          await fetchEquipments();
        } else {
          throw new Error('Échec de la suppression de l\'équipement');
        }
      } catch (error) {
        console.error("Erreur lors de la suppression de l'équipement:", error);
        alert("Une erreur est survenue lors de la suppression de l'équipement: " + error.message);
      }
    }
  }

  return (
    <div className="emp-equipment-management-container">
      <Sidebar isOpen={sidebarOpen} />

      <div className="emp-equipment-management-content">
        <Header title="Gestion des Équipements" onToggleSidebar={toggleSidebar} />

        <main className="emp-equipment-management-main">
          {/* Actions Bar */}
          <div className="emp-actions-bar">
            <div className="emp-search-container">
              <input
                type="text"
                placeholder="Rechercher un équipement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="emp-search-input"
              />
            </div>

            <div className="emp-filters-container">
              <div className="emp-filter-select">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="emp-select-input"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="En service">En service</option>
                  <option value="En maintenance">En maintenance</option>
                  <option value="Hors service">Hors service</option>
                </select>
                <span className="emp-select-icon"></span>
              </div>

              <button className="emp-btn emp-btn-primary emp-add-btn" onClick={() => setShowAddModal(true)}>
                <span className="emp-btn-icon emp-add-icon"></span>
                Ajouter un équipement
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="error-message">
              {errorMessage}
            </div>
          )}

          {/* Liste des équipements */}
          <div className="emp-equipment-table-container">
            {loading ? (
              <div className="emp-loading-indicator">Chargement des équipements...</div>
            ) : error ? (
              <div className="emp-error-message">{error}</div>
            ) : filteredEquipments.length === 0 ? (
              <div className="emp-no-results">Aucun équipement trouvé</div>
            ) : (
              <table className="emp-equipment-table">
                <thead>
                  <tr>
                    <th>Référence</th>
                    <th>Nom</th>
                    <th>Catégorie</th>
                    <th>Localisation</th>
                    <th>Statut</th>
                    <th>Marque</th>
                    <th>Modèle</th>
                    <th>Numéro de série</th>
                    <th>Date d'achat</th>
                    <th>Date de fin de garantie</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEquipments.map((equipment) => (
                    <tr key={equipment._id}>
                      <td>{equipment.reference || '-'}</td>
                      <td>{equipment.name || '-'}</td>
                      <td>{equipment.category || '-'}</td>
                      <td>{equipment.location || '-'}</td>
                      <td>{equipment.status || '-'}</td>
                      <td>{equipment.brand || '-'}</td>
                      <td>{equipment.model || '-'}</td>
                      <td>{equipment.serialNumber || '-'}</td>
                      <td>{equipment.purchaseDate ? new Date(equipment.purchaseDate).toLocaleDateString() : '-'}</td>
                      <td>{equipment.warrantyEnd ? new Date(equipment.warrantyEnd).toLocaleDateString() : '-'}</td>
                      <td>{equipment.description || '-'}</td>
                      <td>
                        <div className="emp-btn-group">
                          <button
                            className="emp-btn emp-btn-sm emp-btn-info"
                            onClick={() => handleOpenViewModal(equipment)}
                            title="Voir les détails"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="emp-btn emp-btn-sm emp-btn-primary"
                            onClick={() => handleOpenEditModal(equipment)}
                            title="Modifier l'équipement"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="emp-btn emp-btn-sm emp-btn-danger"
                            onClick={() => handleOpenDeleteModal(equipment)}
                            title="Supprimer l'équipement"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>

      {/* Modal pour ajouter un équipement */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Ajouter un nouvel équipement"
        size="large"
      >
        <AddEquipmentForm onClose={() => setShowAddModal(false)} onEquipmentAdded={handleAddEquipment} />
      </Modal>
      {/* Modal Edition - Utilise le nouveau composant EditEquipmentModal */}
      {showEditModal && selectedEquipment && (
        <EditEquipmentModal
          equipment={selectedEquipment}
          onClose={handleCloseModals}
          onSubmit={handleEditEquipment}
        />
      )}

      {/* Modal Visualisation - Nouveau composant pour voir les détails */}
      {showViewModal && selectedEquipment && (
        <ViewEquipmentModal
          equipment={selectedEquipment}
          onClose={handleCloseModals}
        />
      )}
      {/* Modal Suppression */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleCloseModals}
        title="Confirmer la suppression"
        size="small"
      >
        <p>Êtes-vous sûr de vouloir supprimer l'équipement <b>{selectedEquipment?.name}</b> ? Cette action est irréversible.</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
          <button className="emp-btn emp-btn-outline" onClick={handleCloseModals}>Annuler</button>
          <button className="emp-btn emp-btn-primary" onClick={handleDeleteEquipmentModal}>Supprimer</button>
        </div>
      </Modal>
    </div>
  )
}

export default EquipmentManagementPage

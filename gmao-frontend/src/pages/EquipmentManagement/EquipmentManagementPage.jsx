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
import { FaHistory, FaEdit, FaTrash, FaEye, FaPlus, FaFilter, FaTimes } from "react-icons/fa"
import toast from "react-hot-toast"

const EquipmentManagementPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [equipments, setEquipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

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

    const matchesStatus = filterStatus === "all" || equipment?.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusClass = (status) => {
    // Mapping entre les valeurs affichées en français et les classes CSS
    switch (status) {
      case "En service":
      case "operational":
        return "equip-status-operational"
      case "En maintenance":
      case "maintenance":
        return "equip-status-maintenance"
      case "Hors service":
      case "out_of_service":
        return "equip-status-out-of-service"
      default:
        return "equip-status-unknown"
    }
  }
  
  // Fonction pour traduire les valeurs d'énumération du backend en français
  const getStatusLabel = (status) => {
    switch (status) {
      case "operational":
        return "En service"
      case "maintenance":
        return "En maintenance"
      case "out_of_service":
        return "Hors service"
      default:
        return status || "-"
    }
  }


  const handleAddEquipment = async (newEquipment, error = null) => {
    // If there's an error, show it and return
    if (error) {
      toast.error(error);
      return;
    }

    try {
      // Only update state if we have new equipment
      if (newEquipment) {
        // Fermer le modal d'abord
        setShowAddModal(false);
        toast.success("Équipement ajouté avec succès");
        
        // Rafraîchir la liste complète des équipements depuis le serveur
        await fetchEquipments();
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la mise à jour de l'état");
    }
  }
  
  // Fonction pour rafraîchir la liste des équipements
  const fetchEquipments = async () => {
    try {
      setLoading(true);
      
      // Utilisation de l'API pour récupérer les équipements
      const response = await equipmentAPI.getAllEquipments();
      
      if (response.data) {
        setEquipments(response.data);
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      toast.error('Erreur lors de la récupération des équipements. Veuillez réessayer.');
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
        toast.success("Équipement mis à jour avec succès");
        
        // Rafraîchir la liste complète des équipements
        await fetchEquipments();
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la mise à jour de l'équipement");
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
        
        // Suppression de l'équipement avec l'ID spécifié
        const response = await equipmentAPI.deleteEquipment(equipmentId);
        
        if (response.status === 200) {
          // Fermer d'abord les modaux
          handleCloseModals();
          toast.success("Équipement supprimé avec succès");
          
          // Rafraîchir la liste complète des équipements
          await fetchEquipments();
        } else {
          throw new Error('Échec de la suppression de l\'équipement');
        }
      } catch (error) {
        toast.error("Une erreur est survenue lors de la suppression de l'équipement");
      }
    }
  }

  return (
    <div className="equip-container">
      <Sidebar isOpen={sidebarOpen} />

      <div className="equip-content">
        <Header title="Gestion des Équipements" onToggleSidebar={toggleSidebar} />

        <main className="equip-main">
          <div className="equip-controls">
            <div className="equip-search-filter-container">
              <div className="equip-search-container">
                <input
                  type="text"
                  placeholder="Rechercher un équipement..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="equip-search-input"
                />
                <button className="equip-filter-button" onClick={() => setShowFilters(!showFilters)}>
                  <FaFilter />
                </button>
              </div>
              <div className="equip-action-buttons">
                <button 
                  className="equip-add-button"
                  onClick={() => setShowAddModal(true)}
                >
                  <FaPlus /> Ajouter un équipement
                </button>
              </div>
            </div>
            
            {showFilters && (
              <div className="equip-filters-container">
                <div className="equip-filters-header">
                  <h3>Filtres</h3>
                  <button
                    className="equip-close-filters-button"
                    onClick={() => setShowFilters(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
                <div className="equip-filters-body">
                  <div className="equip-filter-group">
                    <label>Statut</label>
                    <select
                      className="equip-filter-select"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="operational">En service</option>
                      <option value="maintenance">En maintenance</option>
                      <option value="out_of_service">Hors service</option>
                    </select>
                  </div>
                  <div className="equip-filter-actions">
                    <button
                      className="equip-reset-filters-button"
                      onClick={() => {
                        setFilterStatus("all");
                        setSearchTerm("");
                        setShowFilters(false);
                      }}
                    >
                      Réinitialiser les filtres
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Les messages d'erreur sont maintenant affichés avec des toasts */}

          {/* Liste des équipements */}
          <div className="equip-table-container">
            {loading ? (
              <div className="equip-loading-indicator">Chargement des équipements...</div>
            ) : (
              <table className="equip-table">
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
                      <td>
                        <span className={`equip-status-badge ${getStatusClass(equipment.status)}`}>
                          {getStatusLabel(equipment.status)}
                        </span>
                      </td>
                      <td>{equipment.brand || '-'}</td>
                      <td>{equipment.model || '-'}</td>
                      <td>{equipment.serialNumber || '-'}</td>
                      <td>{equipment.purchaseDate ? new Date(equipment.purchaseDate).toLocaleDateString() : '-'}</td>
                      <td>{equipment.warrantyEnd ? new Date(equipment.warrantyEnd).toLocaleDateString() : '-'}</td>
                      <td>
                        <div className="equip-action-buttons">
                          <button
                            className="equip-action-btn equip-view"
                            onClick={() => handleOpenViewModal(equipment)}
                            title="Voir les détails"
                          >
                            <FaEye />
                          </button>
                          <button
                            className="equip-action-btn equip-edit"
                            onClick={() => handleOpenEditModal(equipment)}
                            title="Modifier l'équipement"
                          >
                            <FaEdit />
                          </button>
                          <button
                            className="equip-action-btn equip-delete"
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
          <button className="equip-btn equip-btn-outline" onClick={handleCloseModals}>Annuler</button>
          <button className="equip-btn equip-btn-delete" onClick={handleDeleteEquipmentModal}>Supprimer</button>
        </div>
      </Modal>
    </div>
  )
}

export default EquipmentManagementPage

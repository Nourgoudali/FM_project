"use client"

import { useState, useEffect } from "react"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import Modal from "../../components/Modal/Modal"
import AddEquipmentForm from "../../components/Equipment/AddEquipmentForm"
import "./EquipmentManagementPage.css"
import { useSidebar } from "../../contexts/SidebarContext"
import { equipmentAPI } from "../../services/api"
import { FaHistory, FaEdit, FaTrash } from "react-icons/fa"

const EquipmentManagementPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [view, setView] = useState("grid") // 'grid' ou 'list'
  const [equipments, setEquipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null);

  // Nouveaux états pour les modaux
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedEquipment, setSelectedEquipment] = useState(null)

  useEffect(() => {
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
    
    fetchEquipments();
  }, [])

  // Filtrer les équipements en fonction de la recherche et du filtre de statut
  const filteredEquipments = equipments.filter((equipment) => {
    // Convert reference to consistent format (remove spaces and hyphens)
    const cleanReference = equipment.reference?.replace(/\s|-/g, '').toLowerCase();
    
    const matchesSearch = cleanReference.includes(searchTerm.toLowerCase()) ||
      equipment.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.brand?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === "all" || equipment.status?.toLowerCase() === filterStatus.toLowerCase();

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
        setEquipments(prevEquipments => [...prevEquipments, newEquipment]);
        setErrorMessage(null);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'état:", error);
      setErrorMessage("Une erreur est survenue lors de la mise à jour de l'état.");
    }
  }

  // Handlers pour les modaux
  const handleOpenHistoryModal = (equipment) => {
    setSelectedEquipment(equipment)
    setShowHistoryModal(true)
  }
  
  const handleOpenEditModal = (equipment) => {
    setSelectedEquipment({ ...equipment, id: equipment._id })
    setShowEditModal(true)
  }
  
  const handleOpenDeleteModal = (equipment) => {
    setSelectedEquipment(equipment)
    setShowDeleteModal(true)
  }
  
  const handleCloseModals = () => {
    setShowHistoryModal(false)
    setShowEditModal(false)
    setShowDeleteModal(false)
    setSelectedEquipment(null)
  }

  // Handler pour édition (remplace l'équipement dans la liste)
  const handleEditEquipment = async (updatedEquipment) => {
    try {
      const response = await equipmentAPI.updateEquipment(updatedEquipment._id, updatedEquipment);
      if (response.data) {
        // Refresh the entire list to ensure consistency
        const updatedEquipments = await equipmentAPI.getAllEquipments();
        setEquipments(updatedEquipments.data);
      } else {
        throw new Error('Invalid response from server');
      }
      handleCloseModals();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'équipement:", error);
      alert("Une erreur est survenue lors de la mise à jour de l'équipement");
    }
  }

  // Handler pour suppression (modal)
  const handleDeleteEquipmentModal = async () => {
    if (selectedEquipment) {
      try {
        // Use _id for MongoDB
        const idToDelete = selectedEquipment._id || selectedEquipment.id;
        await equipmentAPI.deleteEquipment(idToDelete);
        setEquipments(equipments.filter(eq => eq._id === idToDelete || eq.id === idToDelete));
        handleCloseModals();
      } catch (error) {
        console.error("Erreur lors de la suppression de l'équipement:", error);
        alert("Une erreur est survenue lors de la suppression de l'équipement");
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

              <div className="emp-view-toggle">
                <button
                  className={`emp-view-btn ${view === "grid" ? "active" : ""}`}
                  onClick={() => setView("grid")}
                >
                  <span className="emp-view-icon emp-grid-icon"></span>
                </button>
                <button
                  className={`emp-view-btn ${view === "list" ? "active" : ""}`}
                  onClick={() => setView("list")}
                >
                  <span className="emp-view-icon emp-list-icon"></span>
                </button>
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

          {/* Grid View */}
          {view === "grid" && (
            <div className="emp-equipment-grid">
              {loading ? (
                <div className="emp-loading-indicator">Chargement des équipements...</div>
              ) : error ? (
                <div className="emp-error-message">{error}</div>
              ) : filteredEquipments.length === 0 ? (
                <div className="emp-no-results">Aucun équipement trouvé</div>
              ) : (
                filteredEquipments.map((equipment) => (
                  <div key={equipment._id} className="emp-equipment-card">
                    <div className="emp-equipment-header">
                      <div className="emp-equipment-image">
                        <img src={equipment.image || "/placeholder.svg?height=100&width=100"} alt={equipment.name} />
                      </div>
                      <div className="emp-equipment-actions">
                         <button
                           className="emp-action-btn emp-history-btn"
                           onClick={() => handleOpenHistoryModal(equipment)}
                           title="Historique"
                         >
                           <FaHistory className="emp-action-icon" />
                         </button>
                         <button
                           className="emp-action-btn emp-edit-btn"
                           onClick={() => handleOpenEditModal(equipment)}
                           title="Modifier"
                         >
                           <FaEdit className="emp-action-icon" />
                         </button>
                         <button
                           className="emp-action-btn emp-delete-btn"
                           onClick={() => handleOpenDeleteModal(equipment)}
                           title="Supprimer"
                         >
                           <FaTrash className="emp-action-icon" />
                         </button>
                      </div>
                    </div>

                    <div className="emp-equipment-content">
                      <h3 className="emp-equipment-name">{equipment.name}</h3>
                      <p className="emp-equipment-reference">Référence: {equipment.reference}</p>
                      
                      <div className="emp-equipment-details">
                        <div className="emp-detail-item">
                          <span className="emp-detail-label">Catégorie:</span>
                          <span className="emp-detail-value">{equipment.category}</span>
                        </div>
                        <div className="emp-detail-item">
                          <span className="emp-detail-label">Emplacement:</span>
                          <span className="emp-detail-value">{equipment.location}</span>
                        </div>
                        <div className="emp-detail-item">
                          <span className="emp-detail-label">Marque:</span>
                          <span className="emp-detail-value">{equipment.brand}</span>
                        </div>
                      </div>

                      <div className="emp-equipment-status">
                        <div className="emp-status-badge">
                          <span className={`emp-status-indicator ${getStatusColor(equipment.status)}`}></span>
                          <span className="emp-status-text">{equipment.status}</span>
                        </div>
                        <div className="emp-availability">
                          <div className="emp-availability-bar">
                            <div
                              className={`emp-availability-fill ${getAvailabilityColor(equipment.availability)}`}
                              style={{ width: `${equipment.availability}%` }}
                            ></div>
                          </div>
                          <span className="emp-availability-text">{equipment.availability}% disponible</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* List View */}
          {view === "list" && (
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
                      <th>Disponibilité</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEquipments.map((equipment) => (
                      <tr key={equipment.id}>
                        <td>{equipment.reference}</td>
                        <td>{equipment.name}</td>
                        <td>{equipment.category}</td>
                        <td>{equipment.location}</td>
                        <td>
                          <span className={`emp-status-badge ${getStatusColor(equipment.status)}`}>{equipment.status}</span>
                        </td>
                        <td>
                          <div className="emp-availability-inline">
                            <div className="emp-availability-bar-small-container">
                              <div
                                className={`emp-availability-bar-small ${getAvailabilityColor(equipment.availability)}`}
                                style={{ width: `${equipment.availability}%` }}
                              ></div>
                            </div>
                            <span>{equipment.availability}%</span>
                          </div>
                        </td>
                        <td>
                          <div className="emp-table-actions">
                            <button className="emp-action-btn emp-edit-btn" title="Modifier" onClick={() => handleOpenEditModal(equipment)}>
                              <span className="emp-action-icon emp-edit-icon"></span>
                            </button>
                            <button className="emp-action-btn emp-delete-btn" title="Supprimer" onClick={() => handleOpenDeleteModal(equipment)}>
                              <span className="emp-action-icon emp-delete-icon"></span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
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
      {/* Modal Historique */}
      <Modal
        isOpen={showHistoryModal}
        onClose={handleCloseModals}
        title={`Historique de l'équipement : ${selectedEquipment?.name || ""}`}
        size="medium"
      >
        {/* Historique fictif */}
        <ul>
          <li>01/06/2024 - Intervention préventive</li>
          <li>15/05/2024 - Panne réparée</li>
          <li>10/04/2024 - Maintenance annuelle</li>
        </ul>
        <button className="emp-btn emp-btn-outline" onClick={handleCloseModals}>Fermer</button>
      </Modal>
      {/* Modal Edition */}
      <Modal
        isOpen={showEditModal}
        onClose={handleCloseModals}
        title={`Modifier l'équipement : ${selectedEquipment?.name || ""}`}
        size="large"
      >
        {selectedEquipment && (
          <AddEquipmentForm
            onClose={handleCloseModals}
            onEquipmentAdded={handleEditEquipment}
            initialData={selectedEquipment}
            isEdit
          />
        )}
      </Modal>
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

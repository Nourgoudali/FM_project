"use client"

import { useState, useEffect } from "react"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import Modal from "../../components/Modal/Modal"
import AddEquipmentForm from "../../components/Equipment/AddEquipmentForm"
import "./EquipmentManagementPage.css"

function EquipmentManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [view, setView] = useState("grid") // 'grid' ou 'list'
  const [equipments, setEquipments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    const fetchEquipments = async () => {
      try {
        // Dans un environnement réel, ces données viendraient de l'API
        // const response = await equipmentService.getAll();
        // setEquipments(response.data);

        // Simuler les données pour la démo
        const mockEquipments = [
          {
            id: 1,
            reference: "EQ-2024-001",
            name: "Pompe P-10",
            category: "Pompe",
            location: "Atelier A",
            status: "En service",
            brand: "Grundfos",
            availability: 98,
            image: "/placeholder.svg?height=100&width=100",
          },
          {
            id: 2,
            reference: "EQ-2024-002",
            name: "Compresseur Ref.C-123",
            category: "Compresseur",
            location: "Atelier B",
            status: "En maintenance",
            brand: "Atlas Copco",
            availability: 75,
            image: "/placeholder.svg?height=100&width=100",
          },
          {
            id: 3,
            reference: "EQ-2024-003",
            name: "Moteur M-405",
            category: "Moteur",
            location: "Atelier A",
            status: "En service",
            brand: "Siemens",
            availability: 95,
            image: "/placeholder.svg?height=100&width=100",
          },
          {
            id: 4,
            reference: "EQ-2024-004",
            name: "Convoyeur CV-200",
            category: "Convoyeur",
            location: "Atelier C",
            status: "Hors service",
            brand: "Interroll",
            availability: 0,
            image: "/placeholder.svg?height=100&width=100",
          },
          {
            id: 5,
            reference: "EQ-2024-005",
            name: "Chaudière CH-100",
            category: "Chaudière",
            location: "Atelier B",
            status: "En service",
            brand: "Viessmann",
            availability: 92,
            image: "/placeholder.svg?height=100&width=100",
          },
          {
            id: 6,
            reference: "EQ-2024-006",
            name: "Robot R-300",
            category: "Robot",
            location: "Atelier D",
            status: "En service",
            brand: "ABB",
            availability: 88,
            image: "/placeholder.svg?height=100&width=100",
          },
        ]

        setEquipments(mockEquipments)
        setLoading(false)
      } catch (error) {
        console.error("Erreur lors du chargement des équipements:", error)
        setError("Impossible de charger les équipements")
        setLoading(false)
      }
    }

    fetchEquipments()
  }, [])

  // Filtrer les équipements en fonction de la recherche et du filtre de statut
  const filteredEquipments = equipments.filter((equipment) => {
    const matchesSearch =
      equipment.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      equipment.location.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === "all" || equipment.status === filterStatus

    return matchesSearch && matchesStatus
  })

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

  const handleAddEquipment = (newEquipment) => {
    setEquipments([newEquipment, ...equipments])
  }

  const handleDeleteEquipment = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet équipement ?")) {
      // Dans un environnement réel, vous appelleriez l'API
      // await equipmentService.delete(id);

      // Pour la démo, filtrer l'équipement supprimé
      setEquipments(equipments.filter((equipment) => equipment.id !== id))
    }
  }

  return (
    <div className="equipment-management-container">
      <Sidebar isOpen={sidebarOpen} />

      <div className="equipment-management-content">
        <Header title="Gestion des Équipements" onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="equipment-management-main">
          {/* Actions Bar */}
          <div className="actions-bar">
            <div className="search-container">
              <input
                type="text"
                placeholder="Rechercher un équipement..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon"></span>
            </div>

            <div className="filters-container">
              <div className="view-toggle">
                <button className={`view-btn ${view === "grid" ? "active" : ""}`} onClick={() => setView("grid")}>
                  <span className="view-icon grid-icon"></span>
                  Grille
                </button>
                <button className={`view-btn ${view === "list" ? "active" : ""}`} onClick={() => setView("list")}>
                  <span className="view-icon list-icon"></span>
                  Liste
                </button>
              </div>

              <div className="filter-select">
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="select-input">
                  <option value="all">Tous les statuts</option>
                  <option value="En service">En service</option>
                  <option value="En maintenance">En maintenance</option>
                  <option value="Hors service">Hors service</option>
                </select>
                <span className="select-icon"></span>
              </div>

              <button className="btn btn-primary add-btn" onClick={() => setShowAddModal(true)}>
                <span className="btn-icon add-icon"></span>
                Nouvel équipement
              </button>
            </div>
          </div>

          {/* Grid View */}
          {view === "grid" && (
            <div className="equipment-grid">
              {loading ? (
                <div className="loading-indicator">Chargement des équipements...</div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : filteredEquipments.length === 0 ? (
                <div className="no-results">Aucun équipement trouvé</div>
              ) : (
                filteredEquipments.map((equipment) => (
                  <div key={equipment.id} className="equipment-card">
                    <div className="equipment-card-header">
                      <div>
                        <h3 className="equipment-name">{equipment.name}</h3>
                        <p className="equipment-reference">{equipment.reference}</p>
                      </div>
                      <span className={`equipment-status ${getStatusColor(equipment.status)}`}>{equipment.status}</span>
                    </div>
                    <div className="equipment-card-body">
                      <div className="equipment-image-container">
                        <img
                          src={equipment.image || "/placeholder.svg"}
                          alt={equipment.name}
                          className="equipment-image"
                        />
                      </div>
                      <div className="equipment-details">
                        <div className="detail-row">
                          <span className="detail-label">Catégorie:</span>
                          <span className="detail-value">{equipment.category}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Localisation:</span>
                          <span className="detail-value">{equipment.location}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Marque:</span>
                          <span className="detail-value">{equipment.brand}</span>
                        </div>
                      </div>
                    </div>
                    <div className="equipment-card-footer">
                      <div className="availability-container">
                        <div className="availability-header">
                          <span className="availability-label">Disponibilité</span>
                          <span className="availability-value">{equipment.availability}%</span>
                        </div>
                        <div className="availability-bar-container">
                          <div
                            className={`availability-bar ${getAvailabilityColor(equipment.availability)}`}
                            style={{ width: `${equipment.availability}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="equipment-actions">
                        <button className="action-btn history-btn" title="Historique">
                          <span className="action-icon history-icon"></span>
                        </button>
                        <button className="action-btn edit-btn" title="Modifier">
                          <span className="action-icon edit-icon"></span>
                        </button>
                        <button
                          className="action-btn delete-btn"
                          title="Supprimer"
                          onClick={() => handleDeleteEquipment(equipment.id)}
                        >
                          <span className="action-icon delete-icon"></span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* List View */}
          {view === "list" && (
            <div className="equipment-table-container">
              {loading ? (
                <div className="loading-indicator">Chargement des équipements...</div>
              ) : error ? (
                <div className="error-message">{error}</div>
              ) : filteredEquipments.length === 0 ? (
                <div className="no-results">Aucun équipement trouvé</div>
              ) : (
                <table className="equipment-table">
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
                          <span className={`status-badge ${getStatusColor(equipment.status)}`}>{equipment.status}</span>
                        </td>
                        <td>
                          <div className="availability-inline">
                            <div className="availability-bar-small-container">
                              <div
                                className={`availability-bar-small ${getAvailabilityColor(equipment.availability)}`}
                                style={{ width: `${equipment.availability}%` }}
                              ></div>
                            </div>
                            <span>{equipment.availability}%</span>
                          </div>
                        </td>
                        <td>
                          <div className="table-actions">
                            <button className="action-btn edit-btn" title="Modifier">
                              <span className="action-icon edit-icon"></span>
                            </button>
                            <button
                              className="action-btn delete-btn"
                              title="Supprimer"
                              onClick={() => handleDeleteEquipment(equipment.id)}
                            >
                              <span className="action-icon delete-icon"></span>
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
    </div>
  )
}

export default EquipmentManagementPage

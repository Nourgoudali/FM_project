"use client"

import { useState, useEffect } from "react"
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFileExport, FaFilter, FaSort } from "react-icons/fa"
import "./StockManagementPage.css"
import Modal from "../../components/Modal/Modal"
import AddStockItemForm from "../../components/Stock/AddStockItemForm"

const StockManagementPage = () => {
  const [stockItems, setStockItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" })
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    minQuantity: "",
    maxQuantity: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  // Simuler le chargement des données depuis l'API
  useEffect(() => {
    // Simulation d'un appel API
    setTimeout(() => {
      const mockStockItems = [
        {
          id: 1,
          name: "Roulement à billes",
          reference: "RB-2023-001",
          category: "Mécanique",
          quantity: 45,
          minQuantity: 10,
          location: "Étagère A-12",
          unitPrice: 25.5,
          supplier: "MécaPro Industries",
          lastRestockDate: "2023-04-15",
          status: "En stock",
        },
        {
          id: 2,
          name: "Huile hydraulique",
          reference: "HH-2023-002",
          category: "Fluides",
          quantity: 8,
          minQuantity: 5,
          location: "Armoire F-03",
          unitPrice: 45.75,
          supplier: "LubriTech",
          lastRestockDate: "2023-05-20",
          status: "En stock",
        },
        {
          id: 3,
          name: "Filtre à air",
          reference: "FA-2023-003",
          category: "Filtration",
          quantity: 3,
          minQuantity: 5,
          location: "Étagère B-07",
          unitPrice: 18.9,
          supplier: "AirClean Systems",
          lastRestockDate: "2023-03-10",
          status: "Stock faible",
        },
        {
          id: 4,
          name: "Moteur électrique 1.5kW",
          reference: "ME-2023-004",
          category: "Électrique",
          quantity: 2,
          minQuantity: 1,
          location: "Zone D-15",
          unitPrice: 320.0,
          supplier: "ElectroPower",
          lastRestockDate: "2023-06-05",
          status: "En stock",
        },
        {
          id: 5,
          name: "Courroie de transmission",
          reference: "CT-2023-005",
          category: "Transmission",
          quantity: 0,
          minQuantity: 3,
          location: "Étagère C-09",
          unitPrice: 35.25,
          supplier: "TransmiTech",
          lastRestockDate: "2023-02-18",
          status: "Rupture de stock",
        },
      ]

      setStockItems(mockStockItems)
      setFilteredItems(mockStockItems)
      setLoading(false)
    }, 1000)
  }, [])

  // Filtrer les éléments en fonction du terme de recherche et des filtres
  useEffect(() => {
    let result = stockItems

    // Appliquer le terme de recherche
    if (searchTerm) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.supplier.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Appliquer les filtres
    if (filters.category !== "all") {
      result = result.filter((item) => item.category === filters.category)
    }

    if (filters.status !== "all") {
      result = result.filter((item) => item.status === filters.status)
    }

    if (filters.minQuantity !== "") {
      result = result.filter((item) => item.quantity >= Number.parseInt(filters.minQuantity))
    }

    if (filters.maxQuantity !== "") {
      result = result.filter((item) => item.quantity <= Number.parseInt(filters.maxQuantity))
    }

    setFilteredItems(result)
  }, [searchTerm, stockItems, filters])

  // Fonction de tri
  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })

    const sortedItems = [...filteredItems].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "ascending" ? -1 : 1
      }
      if (a[key] > b[key]) {
        return direction === "ascending" ? 1 : -1
      }
      return 0
    })

    setFilteredItems(sortedItems)
  }

  // Gérer l'ajout d'un nouvel élément
  const handleAddItem = (newItem) => {
    const updatedItems = [...stockItems, { ...newItem, id: stockItems.length + 1 }]
    setStockItems(updatedItems)
    setFilteredItems(updatedItems)
    setShowAddModal(false)
  }

  // Gérer la modification d'un élément
  const handleEditItem = (updatedItem) => {
    const updatedItems = stockItems.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    setStockItems(updatedItems)
    setFilteredItems(updatedItems)
    setShowEditModal(false)
  }

  // Gérer la suppression d'un élément
  const handleDeleteItem = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet élément ?")) {
      const updatedItems = stockItems.filter((item) => item.id !== id)
      setStockItems(updatedItems)
      setFilteredItems(updatedItems)
    }
  }

  // Obtenir les catégories uniques pour le filtre
  const categories = ["all", ...new Set(stockItems.map((item) => item.category))]
  const statuses = ["all", "En stock", "Stock faible", "Rupture de stock"]

  return (
    <div className="stock-management-page">
      <div className="page-header">
        <h1>Gestion du Stock</h1>
        <button className="add-button" onClick={() => setShowAddModal(true)}>
          <FaPlus /> Ajouter une pièce
        </button>
      </div>

      <div className="stock-controls">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Rechercher par nom, référence ou fournisseur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <button className="filter-button" onClick={() => setShowFilters(!showFilters)}>
            <FaFilter /> Filtres
          </button>

          <button className="export-button">
            <FaFileExport /> Exporter
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="filters-panel">
          <div className="filter-group">
            <label>Catégorie:</label>
            <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
              {categories.map((category, index) => (
                <option key={index} value={category}>
                  {category === "all" ? "Toutes les catégories" : category}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Statut:</label>
            <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
              {statuses.map((status, index) => (
                <option key={index} value={status}>
                  {status === "all" ? "Tous les statuts" : status}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Quantité min:</label>
            <input
              type="number"
              value={filters.minQuantity}
              onChange={(e) => setFilters({ ...filters, minQuantity: e.target.value })}
            />
          </div>

          <div className="filter-group">
            <label>Quantité max:</label>
            <input
              type="number"
              value={filters.maxQuantity}
              onChange={(e) => setFilters({ ...filters, maxQuantity: e.target.value })}
            />
          </div>

          <button
            className="reset-filters"
            onClick={() =>
              setFilters({
                category: "all",
                status: "all",
                minQuantity: "",
                maxQuantity: "",
              })
            }
          >
            Réinitialiser
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-spinner">Chargement...</div>
      ) : (
        <>
          <div className="stock-summary">
            <div className="summary-card">
              <h3>Total des pièces</h3>
              <p>{stockItems.length}</p>
            </div>
            <div className="summary-card">
              <h3>Valeur totale</h3>
              <p>{stockItems.reduce((total, item) => total + item.quantity * item.unitPrice, 0).toFixed(2)} €</p>
            </div>
            <div className="summary-card">
              <h3>Stock faible</h3>
              <p>{stockItems.filter((item) => item.status === "Stock faible").length}</p>
            </div>
            <div className="summary-card">
              <h3>Rupture de stock</h3>
              <p>{stockItems.filter((item) => item.status === "Rupture de stock").length}</p>
            </div>
          </div>

          <div className="stock-table-container">
            <table className="stock-table">
              <thead>
                <tr>
                  <th onClick={() => requestSort("name")}>
                    Nom <FaSort className="sort-icon" />
                  </th>
                  <th onClick={() => requestSort("reference")}>
                    Référence <FaSort className="sort-icon" />
                  </th>
                  <th onClick={() => requestSort("category")}>
                    Catégorie <FaSort className="sort-icon" />
                  </th>
                  <th onClick={() => requestSort("quantity")}>
                    Quantité <FaSort className="sort-icon" />
                  </th>
                  <th onClick={() => requestSort("location")}>
                    Emplacement <FaSort className="sort-icon" />
                  </th>
                  <th onClick={() => requestSort("unitPrice")}>
                    Prix unitaire <FaSort className="sort-icon" />
                  </th>
                  <th onClick={() => requestSort("supplier")}>
                    Fournisseur <FaSort className="sort-icon" />
                  </th>
                  <th onClick={() => requestSort("status")}>
                    Statut <FaSort className="sort-icon" />
                  </th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length > 0 ? (
                  filteredItems.map((item) => (
                    <tr
                      key={item.id}
                      className={
                        item.status === "Rupture de stock"
                          ? "stock-out"
                          : item.status === "Stock faible"
                            ? "low-stock"
                            : ""
                      }
                    >
                      <td>{item.name}</td>
                      <td>{item.reference}</td>
                      <td>{item.category}</td>
                      <td>{item.quantity}</td>
                      <td>{item.location}</td>
                      <td>{item.unitPrice.toFixed(2)} €</td>
                      <td>{item.supplier}</td>
                      <td>
                        <span className={`status-badge ${item.status.toLowerCase().replace(/\s+/g, "-")}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button
                          className="edit-button"
                          onClick={() => {
                            setCurrentItem(item)
                            setShowEditModal(true)
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button className="delete-button" onClick={() => handleDeleteItem(item.id)}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="no-results">
                      Aucun élément trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {showAddModal && (
        <Modal title="Ajouter une pièce" onClose={() => setShowAddModal(false)}>
          <AddStockItemForm onSubmit={handleAddItem} onCancel={() => setShowAddModal(false)} />
        </Modal>
      )}

      {showEditModal && currentItem && (
        <Modal title="Modifier une pièce" onClose={() => setShowEditModal(false)}>
          <AddStockItemForm
            item={currentItem}
            onSubmit={handleEditItem}
            onCancel={() => setShowEditModal(false)}
            isEditing={true}
          />
        </Modal>
      )}
    </div>
  )
}

export default StockManagementPage

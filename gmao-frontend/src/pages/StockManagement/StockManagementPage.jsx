"use client"

import { useState, useEffect } from "react"
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFileExport, FaFilter, FaSort } from "react-icons/fa"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import "./StockManagementPage.css"
import Modal from "../../components/Modal/Modal"
import AddStockItemForm from "../../components/Stock/AddStockItemForm"
import { useSidebar } from "../../contexts/SidebarContext"
import { stockAPI } from "../../services/api"

const StockManagementPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const [stockItems, setStockItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" })
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    minQuantity: "",
    maxQuantity: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  // Chargement des données depuis l'API
  useEffect(() => {
    const fetchStockItems = async () => {
      setLoading(true);
      try {
        const response = await stockAPI.getAllStocks();
        if (response.data) {
          setStockItems(response.data);
          setFilteredItems(response.data);
        } else {
          // Données fictives comme fallback en cas d'API non disponible
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
          ];
          setStockItems(mockStockItems);
          setFilteredItems(mockStockItems);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des articles de stock:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStockItems();
  }, []);

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

  // Gérer l'ouverture du modal d'édition
  const handleOpenEditModal = (item) => {
    setCurrentItem(item)
    setShowEditModal(true)
  }

  // Gérer l'ouverture du modal de suppression
  const handleOpenDeleteModal = (item) => {
    setCurrentItem(item)
    setShowDeleteModal(true)
  }

  // Gérer l'ajout d'un nouvel élément
  const handleAddItem = async (newItem) => {
    try {
      const response = await stockAPI.createStock(newItem);
      if (response.data) {
        setStockItems([...stockItems, response.data]);
        setShowAddModal(false);
      } else {
        // Fallback si pas de réponse valide
        const tempItem = { ...newItem, id: stockItems.length + 1 };
        setStockItems([...stockItems, tempItem]);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'article:", error);
      alert("Une erreur est survenue lors de l'ajout de l'article");
    }
  }

  // Gérer la modification d'un élément
  const handleEditItem = async (updatedItem) => {
    try {
      const response = await stockAPI.updateStock(updatedItem.id, updatedItem);
      if (response.data) {
        const updatedItems = stockItems.map((item) => 
          item.id === updatedItem.id ? response.data : item
        );
        setStockItems(updatedItems);
        setShowEditModal(false);
      } else {
        // Fallback si pas de réponse valide
        const updatedItems = stockItems.map((item) => 
          item.id === updatedItem.id ? updatedItem : item
        );
        setStockItems(updatedItems);
        setShowEditModal(false);
      }
    } catch (error) {
      console.error("Erreur lors de la modification de l'article:", error);
      alert("Une erreur est survenue lors de la modification de l'article");
    }
  }

  // Gérer la suppression d'un élément
  const handleDeleteItem = async () => {
    if (currentItem) {
      try {
        await stockAPI.deleteStock(currentItem.id);
        const updatedItems = stockItems.filter((item) => item.id !== currentItem.id);
        setStockItems(updatedItems);
        setShowDeleteModal(false);
        setCurrentItem(null);
      } catch (error) {
        console.error("Erreur lors de la suppression de l'article:", error);
        alert("Une erreur est survenue lors de la suppression de l'article");
      }
    }
  }

  // Obtenir les catégories uniques pour le filtre
  const categories = ["all", ...new Set(stockItems.map((item) => item.category))]
  const statuses = ["all", "En stock", "Stock faible", "Rupture de stock"]

  return (
    <div className="stock-management-container">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="stock-management-content">
        <Header title="Gestion du Stock" onToggleSidebar={toggleSidebar} />
        
        <main className="stock-management-main">
          <div className="stock-controls">
            <div className="search-bar">
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
              
              <button className="add-button" onClick={() => setShowAddModal(true)}>
                <FaPlus /> Ajouter une pièce
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label>Catégorie:</label>
                <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                  {categories.map((category) => (
                    <option key={`cat-${category.toLowerCase().replace(/\s+/g, '-')}`} value={category}>
                      {category === "all" ? "Toutes les catégories" : category}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-group">
                <label>Statut:</label>
                <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                  {statuses.map((status) => (
                    <option key={`status-${status.toLowerCase().replace(/\s+/g, '-')}`} value={status}>
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
            <div className="loading-indicator">Chargement des pièces...</div>
          ) : (
            <div className="stock-table-container">
              <table className="stock-table">
                <thead>
                  <tr>
                    <th onClick={() => requestSort("reference")}>
                      Référence <FaSort className="sort-icon" />
                    </th>
                    <th onClick={() => requestSort("name")}>
                      Nom <FaSort className="sort-icon" />
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
                    <th onClick={() => requestSort("status")}>
                      Statut <FaSort className="sort-icon" />
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.map((item) => (
                    <tr key={item._id || item.id || `item-${item.reference.toLowerCase().replace(/\s+/g, '-')}`}>
                      <td>{item.name}</td>
                      <td>{item.reference}</td>
                      <td>{item.category}</td>
                      <td>{item.quantity}</td>
                      <td>{item.location}</td>
                      <td>{item.unitPrice.toFixed(2)} €</td>
                      <td>{item.supplier}</td>
                      <td>{new Date(item.lastRestockDate).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${item.status.toLowerCase().replace(/\s+/g, '-')}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="actions-cell">
                        <button className="action-btn edit" onClick={() => handleOpenEditModal(item)}>
                          <FaEdit />
                        </button>
                        <button className="action-btn delete" onClick={() => handleOpenDeleteModal(item)}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Modal d'ajout d'article */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Ajouter un article">
          <AddStockItemForm onSubmit={handleAddItem} onCancel={() => setShowAddModal(false)} />
        </Modal>

      {/* Modal d'édition d'article */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Modifier l'article">
        {currentItem && (
          <AddStockItemForm
            item={currentItem}
            onSubmit={handleEditItem}
            onCancel={() => setShowEditModal(false)}
            isEdit
          />
        )}
      </Modal>

      {/* Modal de confirmation de suppression */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirmer la suppression" size="small">
        <div className="delete-confirmation">
          <p>Êtes-vous sûr de vouloir supprimer l'article <strong>{currentItem?.name}</strong> ?</p>
          <p>Cette action est irréversible.</p>
          
          <div className="modal-actions">
            <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>
              Annuler
            </button>
            <button className="btn btn-danger" onClick={handleDeleteItem}>
              Supprimer
            </button>
          </div>
        </div>
        </Modal>
    </div>
  )
}

export default StockManagementPage

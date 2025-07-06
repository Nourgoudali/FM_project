import React, { useState, useEffect } from "react"
import { FaPlus, FaEdit, FaTrash, FaFileExport, FaFilter, FaTimes } from "react-icons/fa"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import "./StockManagementPage.css"
import AddStockItemForm from "../../components/Stock/AddStockItemForm"
import EditStockItemForm from "../../components/Stock/EditStockItemForm"
import DeleteStockConfirm from "../../components/Stock/DeleteStockConfirm"
import { useSidebar } from "../../contexts/SidebarContext"
import { stockAPI, fournisseurAPI } from "../../services/api"
import toast from "react-hot-toast"

const StockManagementPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const [stockItems, setStockItems] = useState([])
  const [filteredItems, setFilteredItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [currentItem, setCurrentItem] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "ascending" })
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    minQuantity: "",
    maxQuantity: "",
  })
  const [showFilters, setShowFilters] = useState(false)

  // Charger les données du stock depuis l'API
  useEffect(() => {
    const fetchStockItems = async () => {
      try {
        setLoading(true);
        const response = await stockAPI.getAllStocks();
        setStockItems(response.data);
        setFilteredItems(response.data);
      } catch (error) {
        toast.error("Erreur lors du chargement des articles de stock");
      } finally {
        setLoading(false);
      }
    };

    fetchStockItems();
  }, []);

  // Filtrer et trier les articles
  useEffect(() => {
    let filtered = [...stockItems];

    // Rechercher par nom ou référence
    if (searchTerm) {
      filtered = filtered.filter((item) => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.reference.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrer par catégorie PDR
    if (filters.category !== "all") {
      filtered = filtered.filter(item => item.pdrCategory === filters.category);
    }

    // Filtrer par statut
    if (filters.status !== "all") {
      if (filters.status === "En stock") {
        filtered = filtered.filter(item => item.stockActuel > item.stockMin);
      } else if (filters.status === "Stock faible") {
        filtered = filtered.filter(item => item.stockActuel <= item.stockMin && item.stockActuel > 0);
      } else if (filters.status === "Rupture de stock") {
        filtered = filtered.filter(item => item.stockActuel === 0);
      }
    }

    // Filtrer par stock minimum
    if (filters.minQuantity) {
      filtered = filtered.filter(item => item.stockActuel >= parseInt(filters.minQuantity));
    }

    // Filtrer par stock maximum
    if (filters.maxQuantity) {
      filtered = filtered.filter(item => item.stockActuel <= parseInt(filters.maxQuantity));
    }

    setFilteredItems(filtered);
  }, [stockItems, filters, searchTerm]);

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

  // Gérer l'ouverture du formulaire d'édition
  const handleOpenEditForm = (item) => {
    setCurrentItem(item)
    setShowEditForm(true)
    // Masquer les autres formulaires
    setShowAddForm(false)
    setShowDeleteConfirm(false)
  }

  // Gérer l'ouverture de la confirmation de suppression
  const handleOpenDeleteConfirm = (item) => {
    setCurrentItem(item)
    setShowDeleteConfirm(true)
    // Masquer les autres formulaires
    setShowAddForm(false)
    setShowEditForm(false)
  }

  // Gérer l'ajout d'un nouvel élément
  const handleAddItem = async (newItem) => {
    try {
      const response = await stockAPI.createStock(newItem);
      if (response.data) {
        toast.success("Article ajouté avec succès");
        setStockItems([...stockItems, response.data]);
        setShowAddForm(false);
        
        // Rafraîchir les données depuis l'API
        await refreshStockData();
      } else {
        // Si la réponse est nulle mais pas d'erreur, on utilise les données temporaires
        const tempItem = { 
          ...newItem, 
          _id: `temp-${stockItems.length + 1}`,
          reference: `ST-${String(stockItems.length + 1).padStart(3, '0')}`,
          pdrCategory: newItem.pdrCategory || "Fluidique", // Défaut sur Fluidique si non spécifié
          fournisseur: {
            _id: newItem.fournisseur,
            nomEntreprise: "Fournisseur temporaire"
          }
        };
        setStockItems([...stockItems, tempItem]);
        setShowAddForm(false);
        toast.success("Article ajouté avec succès");
        
        // Rafraîchir les données depuis l'API
        await refreshStockData();
      }
    } catch (error) {
      // Afficher le message d'erreur spécifique de l'API
      toast.error(error.response?.data?.message || "Une erreur est survenue lors de l'ajout de l'article");
      throw error;
    }
  }

  // Rafraîchir les données depuis l'API
  const refreshStockData = async () => {
    setLoading(true);
    try {
      const response = await stockAPI.getAllStocks();
      setStockItems(response.data);
      setFilteredItems(response.data);
    } catch (error) {
      toast.error("Erreur lors du rafraîchissement des données");
    } finally {
      setLoading(false);
    }
  };

  // Gérer la mise à jour d'un élément
  const handleEditItem = async (updatedItem) => {
    try {
      const response = await stockAPI.updateStock(updatedItem._id, updatedItem);
      if (response.data) {
        // Mettre à jour l'élément dans l'état local
        setStockItems(
          stockItems.map((item) =>
            item._id === updatedItem._id ? response.data : item
          )
        );
        setShowEditForm(false);
        toast.success("Article modifié avec succès");
        
        // Rafraîchir les données depuis l'API pour s'assurer que tout est à jour
        await refreshStockData();
      } else {
        // Fallback si pas de réponse valide
        // Préserver l'objet fournisseur complet
        const fournisseurObj = stockItems.find(item => 
          item._id === updatedItem._id
        )?.fournisseur || { _id: updatedItem.fournisseur, nomEntreprise: "Fournisseur temporaire" };
        
        const updatedItemWithFournisseur = {
          ...updatedItem,
          fournisseur: updatedItem.fournisseur !== fournisseurObj._id ? 
            { _id: updatedItem.fournisseur, nomEntreprise: "Fournisseur mis à jour" } : 
            fournisseurObj
        };
        
        setStockItems(
          stockItems.map((item) =>
            item._id === updatedItem._id ? updatedItemWithFournisseur : item
          )
        );
        setShowEditForm(false);
        toast.success("Article modifié avec succès");
        
        // Rafraîchir les données depuis l'API
        await refreshStockData();
      }
    } catch (error) {
      toast.error(error.message || "Une erreur est survenue lors de la modification de l'article");
    }
  }

  // Gérer la suppression d'un élément
  const handleDeleteItem = async () => {
    if (!currentItem || !currentItem._id) {
      toast.error("Article non valide");
      setShowDeleteConfirm(false);
      setCurrentItem(null);
      return;
    }

    try {
      await stockAPI.deleteStock(currentItem._id);
      const updatedItems = stockItems.filter((item) => item._id !== currentItem._id);
      setStockItems(updatedItems);
      setShowDeleteConfirm(false);
      setCurrentItem(null);
      toast.success("Article supprimé avec succès");
      
      // Rafraîchir les données depuis l'API
      await refreshStockData();
    } catch (error) {
      toast.error("Une erreur est survenue lors de la suppression de l'article");
    }
  }

  // Les catégories PDR disponibles
  const pdrCategories = ['Fluidique', 'Électrotechnique', 'Maintenance générale'];
  
  // Obtenir les catégories PDR uniques pour le filtre
  const categories = stockItems.length > 0 
    ? ["all", ...new Set(stockItems.map((item) => item.pdrCategory))]
    : ["all", ...pdrCategories]

  return (
    <div className="stock-container">
      <Sidebar isOpen={sidebarOpen} />
      
      <div className="stock-content">
        <Header title="Gestion du Stock" onToggleSidebar={toggleSidebar} />
        
        <main className="stock-main">
          <div className="stock-controls">
            <div className="stock-search-filter-container">
              <div className="stock-search-container">
                <input
                  type="text"
                  placeholder="Rechercher par nom, référence ou fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="stock-search-input"
                />
                <button className="stock-filter-button" onClick={() => setShowFilters(!showFilters)}>
                  <FaFilter />
                </button>
              </div>
              <div className="stock-action-buttons">
                <button 
                  className="stock-add-button"
                  onClick={() => {
                    setShowAddForm(true);
                    setShowEditForm(false);
                    setShowDeleteConfirm(false);
                  }}
                  aria-label="Ajouter un article"
                >
                  <FaPlus /> Ajouter un article
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="stock-filters-container">
              <div className="stock-filters-header">
                <h3>Filtres</h3>
                <button
                  className="stock-close-filters-button"
                  onClick={() => setShowFilters(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="stock-filters-body">
                <div className="stock-filter-group">
                  <label>Catégorie:</label>
                  <select value={filters.category} onChange={(e) => setFilters({ ...filters, category: e.target.value })}>
                    {categories.map((category) => (
                      <option key={`cat-${category.toLowerCase().replace(/\s+/g, '-')}`} value={category}>
                        {category === "all" ? "Toutes les catégories" : category}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="stock-filter-actions">
                  <button
                    className="stock-reset-filters-button"
                    onClick={() => {
                      setFilters({
                        category: "all",
                        status: "all",
                        minQuantity: "",
                        maxQuantity: "",
                      });
                      setSearchTerm("");
                    }}
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="stock-loading-indicator">Chargement des articles...</div>
          ) : (
            <div className="stock-table-container">
              <table className="stock-table">
                  <thead>
                    <tr>
                      <th onClick={() => requestSort("reference")}>
                        Référence {sortConfig.key === "reference" && (
                          <span>{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                        )}
                      </th>
                      <th onClick={() => requestSort("name")}>
                        Nom du produit {sortConfig.key === "name" && (
                          <span>{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                        )}
                      </th>
                      <th onClick={() => requestSort("pdrCategory")}>
                        Catégorie PDR {sortConfig.key === "pdrCategory" && (
                          <span>{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                        )}
                      </th>
                      <th onClick={() => requestSort("lieuStockage")}>
                        Lieu de stockage {sortConfig.key === "lieuStockage" && (
                          <span>{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                        )}
                      </th>
                      <th onClick={() => requestSort("prixUnitaire")}>
                        Prix unitaire (DH) {sortConfig.key === "prixUnitaire" && (
                          <span>{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                        )}
                      </th>
                      <th onClick={() => requestSort("stockActuel")}>
                        Stock actuel {sortConfig.key === "stockActuel" && (
                          <span>{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                        )}
                      </th>
                      <th onClick={() => requestSort("stockMin")}>
                        Stock min {sortConfig.key === "stockMin" && (
                          <span>{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                        )}
                      </th>
                      <th onClick={() => requestSort("stockMax")}>
                        Stock max {sortConfig.key === "stockMax" && (
                          <span>{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                        )}
                      </th>
                      <th onClick={() => requestSort("stockSecurite")}>
                        Stock sécurité (S.S) {sortConfig.key === "stockSecurite" && (
                          <span>{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>
                        )}
                      </th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map((item) => {
                      // Déterminer le statut du stock
                      let status = "En stock";
                      let statusClass = "status-in-stock";
                      
                      if (item.stockActuel === 0) {
                        status = "Rupture de stock";
                        statusClass = "status-out-of-stock";
                      } else if (item.stockActuel <= item.stockMin) {
                        status = "Stock faible";
                        statusClass = "status-low-stock";
                      }
                      
                      return (
                        <tr key={item._id}>
                          <td>{item.reference}</td>
                          <td>{item.name}</td>
                          <td>{item.pdrCategory}</td>
                          <td>{item.lieuStockage || 'Non spécifié'}</td>
                          <td>{item.prixUnitaire} DH</td>
                          <td style={{
                            color: item.stockActuel < item.stockMin ? 'red' : item.stockActuel > item.stockMax ? 'orange' : 'inherit',
                            fontWeight: (item.stockActuel < item.stockMin || item.stockActuel > item.stockMax) ? 'bold' : 'normal'
                          }}>
                            {item.stockActuel}
                          </td>
                          <td>{item.stockMin}</td>
                          <td>{item.stockMax}</td>
                          <td>{item.stockSecurite}</td>
                          <td>
                            <div className="stock-action-buttons">
                              <button
                                className="stock-action-btn stock-edit"
                                onClick={() => handleOpenEditForm(item)}
                                aria-label="Modifier"
                                title="Modifier"
                              >
                                <FaEdit />
                              </button>
                              <button
                                className="stock-action-btn stock-delete"
                                onClick={() => handleOpenDeleteConfirm(item)}
                                aria-label="Supprimer"
                                title="Supprimer"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
            </div>
          )}
        </main>
      </div>

      {/* Formulaires intégrés avec composants séparés */}
      {showAddForm && (
        <div className="stock-form-overlay">
          <div className="stock-form-container">
            <div className="stock-form-header">
              <h2>Ajouter un article</h2>
              <button className="close-button" onClick={() => setShowAddForm(false)}>
                <FaTimes />
              </button>
            </div>
            <AddStockItemForm 
              onSubmit={handleAddItem} 
              onCancel={() => setShowAddForm(false)} 
            />
          </div>
        </div>
      )}

      {/* Composant d'édition */}
      <EditStockItemForm 
        item={currentItem}
        onSubmit={handleEditItem}
        onCancel={() => setShowEditForm(false)}
        isVisible={showEditForm && currentItem}
      />

      {/* Composant de confirmation de suppression */}
      <DeleteStockConfirm 
        item={currentItem}
        onConfirm={handleDeleteItem}
        onCancel={() => setShowDeleteConfirm(false)}
        isVisible={showDeleteConfirm}
      />
    </div>
  )
}

export default StockManagementPage

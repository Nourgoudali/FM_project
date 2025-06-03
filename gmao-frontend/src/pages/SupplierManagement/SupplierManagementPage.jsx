import { useState, useEffect } from "react"
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSort,
  FaBuilding,
  FaEnvelope,
  FaPhoneAlt,
  FaFilter,
  FaTimes
} from "react-icons/fa"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import "./SupplierManagementPage.css"
import Modal from "../../components/Modal/Modal"
import AddSupplierForm from "../../components/Supplier/AddSupplierForm"
import { useSidebar } from "../../contexts/SidebarContext"
import { fournisseurAPI } from "../../services/api"
import toast from "react-hot-toast"

const SupplierManagementPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const [suppliers, setSuppliers] = useState([])
  const [filteredSuppliers, setFilteredSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentSupplier, setCurrentSupplier] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: "nomEntreprise", direction: "ascending" })
  const [showFilters, setShowFilters] = useState(false)

  // Chargement des données depuis l'API
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        setLoading(true);
        const response = await fournisseurAPI.getAllFournisseurs();
        setSuppliers(response.data);
        setFilteredSuppliers(response.data);
      } catch (error) {
        toast.error("Impossible de charger les fournisseurs. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchSuppliers();
  }, []);

  // Filtrer les fournisseurs en fonction du terme de recherche
  useEffect(() => {
    if (!searchTerm) {
      setFilteredSuppliers(suppliers);
      return;
    }
    
    const lowercaseSearchTerm = searchTerm.toLowerCase();
    const filtered = suppliers.filter(
      (supplier) =>
        supplier.nomEntreprise.toLowerCase().includes(lowercaseSearchTerm) ||
        supplier.nom.toLowerCase().includes(lowercaseSearchTerm) ||
        supplier.prenom.toLowerCase().includes(lowercaseSearchTerm) ||
        supplier.email.toLowerCase().includes(lowercaseSearchTerm) ||
        supplier.telephone.includes(searchTerm)
    );
    
    setFilteredSuppliers(filtered);
  }, [searchTerm, suppliers]);

  // Fonction de tri
  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })

    const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "ascending" ? -1 : 1
      }
      if (a[key] > b[key]) {
        return direction === "ascending" ? 1 : -1
      }
      return 0
    })

    setFilteredSuppliers(sortedSuppliers)
  }

  // Gérer l'ajout d'un nouveau fournisseur
  const handleAddSupplier = async (newSupplier) => {
    try {
      const response = await fournisseurAPI.createFournisseur(newSupplier);
      
      if (response && response.data) {
        setSuppliers([...suppliers, response.data]);
        setShowAddModal(false);
        toast.success("Fournisseur ajouté avec succès");
      } else {
        throw new Error("Erreur lors de l'ajout du fournisseur");
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de l'ajout du fournisseur");
    }
  }

  // Gérer la modification d'un fournisseur
  const handleEditSupplier = async (updatedSupplier) => {
    try {
      const response = await fournisseurAPI.updateFournisseur(updatedSupplier._id, updatedSupplier);
      
      if (response && response.data) {
        setSuppliers(suppliers.map(supplier => 
          supplier._id === updatedSupplier._id ? response.data : supplier
        ));
        setShowEditModal(false);
        toast.success("Fournisseur modifié avec succès");
      } else {
        throw new Error("Erreur lors de la modification du fournisseur");
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la modification du fournisseur");
    }
  }

  // Gérer la suppression d'un fournisseur
  const handleDeleteSupplier = async () => {
    if (!currentSupplier) return;
    
    try {
      const response = await fournisseurAPI.deleteFournisseur(currentSupplier._id);
      
      if (response) {
        setSuppliers(suppliers.filter(supplier => supplier._id !== currentSupplier._id));
        setShowDeleteModal(false);
        toast.success("Fournisseur supprimé avec succès");
      } else {
        throw new Error("Erreur lors de la suppression du fournisseur");
      }
    } catch (error) {
      toast.error("Une erreur est survenue lors de la suppression du fournisseur");
    }
  }

  // Gérer l'ouverture du modal d'édition
  const handleOpenEditModal = (supplier) => {
    setCurrentSupplier(supplier);
    setShowEditModal(true);
  }

  // Gérer l'ouverture du modal de suppression
  const handleOpenDeleteModal = (supplier) => {
    setCurrentSupplier(supplier);
    setShowDeleteModal(true);
  }

  return (
    <div className="supplier-container">
      <Sidebar isOpen={sidebarOpen} />
      <div className="supplier-content">
        <Header title="Gestion des Fournisseurs" onToggleSidebar={toggleSidebar} />
        
        <main className="supplier-main">
          <div className="supplier-controls">
            <div className="supplier-search-filter-container">
              <div className="supplier-search-container">
                <input
                  type="text"
                  placeholder="Rechercher un fournisseur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="supplier-search-input"
                />
                <button className="supplier-filter-button" onClick={() => setShowFilters(!showFilters)}>
                  <FaFilter />
                </button>
              </div>
              <div className="supplier-action-buttons">
                <button 
                  className="supplier-add-button"
                  onClick={() => setShowAddModal(true)}
                >
                  <FaPlus /> Ajouter un fournisseur
                </button>
              </div>
            </div>
          </div>
          
          {showFilters && (
            <div className="supplier-filters-container">
              <div className="supplier-filters-header">
                <h3>Filtres</h3>
                <button
                  className="supplier-close-filters-button"
                  onClick={() => setShowFilters(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="supplier-filters-body">
                <div className="supplier-filter-actions">
                  <button
                    className="supplier-reset-filters-button"
                    onClick={() => {
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
            <div className="supplier-loading-indicator">Chargement des fournisseurs...</div>
          ) : (
            <div className="supplier-table-container">
              <table className="supplier-table">
                <thead>
                  <tr>
                    <th onClick={() => requestSort("nomEntreprise")}>
                      Nom d'entreprise
                      {sortConfig.key === "nomEntreprise" && (
                        <FaSort className={`sort-icon ${sortConfig.direction}`} />
                      )}
                    </th>
                    <th onClick={() => requestSort("nom")}>
                      Contact
                      {sortConfig.key === "nom" && (
                        <FaSort className={`sort-icon ${sortConfig.direction}`} />
                      )}
                    </th>
                    <th onClick={() => requestSort("telephone")}>
                      Téléphone
                      {sortConfig.key === "telephone" && (
                        <FaSort className={`sort-icon ${sortConfig.direction}`} />
                      )}
                    </th>
                    <th onClick={() => requestSort("email")}>
                      Email
                      {sortConfig.key === "email" && (
                        <FaSort className={`sort-icon ${sortConfig.direction}`} />
                      )}
                    </th>
                    <th className="supplier-table-header">Adresse</th>
                    <th className="supplier-table-header">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="supplier-no-results">
                        Aucun fournisseur trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map((supplier) => (
                      <tr key={supplier._id}>
                        <td>
                          <div className="supplier-cell-with-icon">
                            <FaBuilding className="supplier-cell-icon" />
                            <span>{supplier.nomEntreprise}</span>
                          </div>
                        </td>
                        <td>{supplier.prenom} {supplier.nom}</td>
                        <td>
                          <div className="supplier-cell-with-icon">
                            <FaPhoneAlt className="supplier-cell-icon" />
                            <span>{supplier.telephone}</span>
                          </div>
                        </td>
                        <td>
                          <div className="supplier-cell-with-icon">
                            <FaEnvelope className="supplier-cell-icon" />
                            <a href={`mailto:${supplier.email}`} className="supplier-email-link">
                              {supplier.email}
                            </a>
                          </div>
                        </td>
                        <td>{supplier.adresse}</td>
                        <td>
                          <div className="supplier-action-buttons">
                            <button
                              className="supplier-action-btn supplier-edit"
                              onClick={() => handleOpenEditModal(supplier)}
                              title="Modifier"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="supplier-action-btn supplier-delete"
                              onClick={() => handleOpenDeleteModal(supplier)}
                              title="Supprimer"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>
      
      {/* Modal pour ajouter un fournisseur */}
      {showAddModal && (
        <Modal
          isOpen={showAddModal}
          title="Ajouter un fournisseur"
          onClose={() => setShowAddModal(false)}
          size="large"
        >
          <AddSupplierForm
            onSubmit={handleAddSupplier}
            onClose={() => setShowAddModal(false)}
            isEdit={false}
          />
        </Modal>
      )}
      
      {/* Modal pour modifier un fournisseur */}
      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          title="Modifier un fournisseur"
          onClose={() => setShowEditModal(false)}
          size="large"
        >
          <AddSupplierForm
            supplier={currentSupplier}
            onSubmit={handleEditSupplier}
            onClose={() => setShowEditModal(false)}
            isEdit={true}
          />
        </Modal>
      )}
      
      {/* Modal pour confirmer la suppression */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          title="Confirmer la suppression"
          onClose={() => setShowDeleteModal(false)}
          size="small"
        >
          <div className="admin-delete-confirmation">
            <p>
              Êtes-vous sûr de vouloir supprimer le fournisseur{" "}
              <strong>{currentSupplier?.nomEntreprise}</strong> ?
            </p>
            <p className="admin-delete-warning">
              Cette action est irréversible et supprimera définitivement ce fournisseur.
            </p>
            <div className="admin-modal-actions">
              <button
                className="admin-button"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </button>
              <button
                className="admin-button delete"
                onClick={handleDeleteSupplier}
              >
                Supprimer
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

export default SupplierManagementPage

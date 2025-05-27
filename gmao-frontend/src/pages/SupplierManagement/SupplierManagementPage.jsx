import { useState, useEffect } from "react"
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaSort,
  FaBuilding,
  FaEnvelope,
  FaPhoneAlt
} from "react-icons/fa"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import "./SupplierManagementPage.css"
import Modal from "../../components/Modal/Modal"
import AddSupplierForm from "../../components/Supplier/AddSupplierForm"
import { useSidebar } from "../../contexts/SidebarContext"
import { fournisseurAPI } from "../../services/api"

const SupplierManagementPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const [suppliers, setSuppliers] = useState([])
  const [filteredSuppliers, setFilteredSuppliers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
        console.error("Erreur lors du chargement des fournisseurs:", error);
        setError("Impossible de charger les fournisseurs. Veuillez réessayer plus tard.");
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
      } else {
        throw new Error("Erreur lors de l'ajout du fournisseur");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout du fournisseur:", error);
      alert("Une erreur est survenue lors de l'ajout du fournisseur");
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
      } else {
        throw new Error("Erreur lors de la modification du fournisseur");
      }
    } catch (error) {
      console.error("Erreur lors de la modification du fournisseur:", error);
      alert("Une erreur est survenue lors de la modification du fournisseur");
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
      } else {
        throw new Error("Erreur lors de la suppression du fournisseur");
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du fournisseur:", error);
      alert("Une erreur est survenue lors de la suppression du fournisseur");
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
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <Header title="Gestion des Fournisseurs" />
        
        <div className="admin-content">
          <div className="admin-toolbar">
            <div className="admin-toolbar-right">
              <div className="admin-search">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="admin-toolbar-left">
              <button className="admin-button primary" onClick={() => setShowAddModal(true)}>
                <FaPlus /> Ajouter un fournisseur
              </button>
            </div>
            
            
          </div>
          
          {error && <div className="admin-error-message">{error}</div>}
          
          {loading ? (
            <div className="admin-loading">Chargement des fournisseurs...</div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
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
                    <th>Adresse</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="admin-no-data">
                        Aucun fournisseur trouvé
                      </td>
                    </tr>
                  ) : (
                    filteredSuppliers.map((supplier) => (
                      <tr key={supplier._id}>
                        <td>
                          <div className="admin-cell-with-icon">
                            <FaBuilding className="admin-cell-icon" />
                            <span>{supplier.nomEntreprise}</span>
                          </div>
                        </td>
                        <td>{supplier.prenom} {supplier.nom}</td>
                        <td>
                          <div className="admin-cell-with-icon">
                            <FaPhoneAlt className="admin-cell-icon" />
                            <span>{supplier.telephone}</span>
                          </div>
                        </td>
                        <td>
                          <div className="admin-cell-with-icon">
                            <FaEnvelope className="admin-cell-icon" />
                            <a href={`mailto:${supplier.email}`} className="admin-email-link">
                              {supplier.email}
                            </a>
                          </div>
                        </td>
                        <td>{supplier.adresse}</td>
                        <td>
                          <div className="admin-actions">
                            <button
                              className="admin-action-button edit"
                              onClick={() => handleOpenEditModal(supplier)}
                              title="Modifier"
                            >
                              <FaEdit />
                            </button>
                            <button
                              className="admin-action-button delete"
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
        </div>
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

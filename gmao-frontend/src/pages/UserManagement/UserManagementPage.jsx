import { useState, useEffect } from "react"
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaFilter,
  FaSort,
  FaTimes,
  FaUserShield,
  FaUserCog,
  FaUserTie,
  FaUserCheck,
} from "react-icons/fa"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import "./UserManagementPage.css"
import Modal from "../../components/Modal/Modal"
import AddUserForm from "../../components/User/AddUserForm";
import DeleteUserModal from "../../components/User/DeleteUserModal";
import { useSidebar } from "../../contexts/SidebarContext"
import { userAPI } from "../../services/api"
import toast from "react-hot-toast"

const UserManagementPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: "lastName", direction: "ascending" })
  const [filters, setFilters] = useState({
    role: "all",
    department: "Département de la Production",
  })
  const [showFilters, setShowFilters] = useState(false)

  // Chargement des données depuis l'API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getAllUsers();
        
          setUsers(response.data);
          setFilteredUsers(response.data);
         
      } catch (error) {
        toast.error("Impossible de charger les utilisateurs. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filtrer les utilisateurs en fonction du terme de recherche et des filtres
  useEffect(() => {
    let result = users

    // Appliquer le terme de recherche
    if (searchTerm) {
      result = result.filter(
        (user) =>
          user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone.includes(searchTerm),
      )
    }

    // Appliquer les filtres
    if (filters.role !== "all") {
      result = result.filter((user) => user.role === filters.role)
    }

    if (filters.department !== "all") {
      result = result.filter((user) => user.department === filters.department)
    }

    setFilteredUsers(result)
  }, [searchTerm, users, filters])

  // Fonction de tri
  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })

    const sortedUsers = [...filteredUsers].sort((a, b) => {
      if (a[key] < b[key]) {
        return direction === "ascending" ? -1 : 1
      }
      if (a[key] > b[key]) {
        return direction === "ascending" ? 1 : -1
      }
      return 0
    })

    setFilteredUsers(sortedUsers)
  }

  // Fonction pour gérer l'ajout d'un utilisateur
  const handleAddUser = async (userData) => {
    try {
      const response = await userAPI.addUser(userData);
      
      if (response && response.data) {
        // Mettre à jour la liste des utilisateurs avec le nouvel utilisateur
        setUsers(prevUsers => [...prevUsers, response.data]);
        setShowAddModal(false);
        toast.success("Utilisateur ajouté avec succès");
      } else {
        throw new Error("Erreur lors de l'ajout de l'utilisateur");
      }
    } catch (error) {
      console.error("Erreur d'ajout d'utilisateur:", error);
      toast.error(error.response?.data?.message || "Une erreur est survenue lors de l'ajout de l'utilisateur");
    }
  }

  // Fonction pour gérer la modification d'un utilisateur
  const handleEditUser = async (updatedUser) => {
    try {
      const userId = updatedUser._id || updatedUser.id;
      const response = await userAPI.updateUser(userId, updatedUser);
      
      if (response && response.data) {
        setUsers(prevUsers => prevUsers.map(user => 
          (user._id || user.id) === userId ? response.data : user
        ));
        setShowEditModal(false);
        setCurrentUser(null);
        toast.success("Utilisateur modifié avec succès");
      } else {
        throw new Error("Erreur lors de la modification de l'utilisateur");
      }
    } catch (error) {
      console.error("Erreur de modification d'utilisateur:", error);
      toast.error(error.response?.data?.message || "Une erreur est survenue lors de la modification de l'utilisateur");
    }
  }

  // Fonction pour gérer la suppression d'un utilisateur
  const handleDeleteUser = async (userId) => {
    try {
      await userAPI.deleteUser(userId);
      setUsers(prevUsers => prevUsers.filter(user => (user._id || user.id) !== userId));
      setShowDeleteModal(false);
      setCurrentUser(null);
      toast.success("Utilisateur supprimé avec succès");
    } catch (error) {
      console.error("Erreur de suppression d'utilisateur:", error);
      toast.error(error.response?.data?.message || "Une erreur est survenue lors de la suppression de l'utilisateur");
    }
  }

  // 
  // Obtenir les rôles, statuts et départements uniques pour les filtres
  const roles = ["all", ...new Set(users.map((user) => user.role))]
  const statuses = ["all", "Actif", "Inactif"]
  const departments = [
  "all",
  "Département de la Production",
  "Département Qualité",
  "Département Logistique",
  "Département Méthodes",
  "Département Facilities",
  "Département Finance",
  "Département Ressources Humaines (RH)",
  "Département Achats"
]

  // Fonction pour obtenir l'icône du rôle
  const getRoleIcon = (role) => {
    switch (role) {
      case "Administrateur":
        return <FaUserShield className="role-icon admin" />
      case "Manager":
        return <FaUserTie className="role-icon manager" />
      case "Technicien":
        return <FaUserCog className="role-icon technician" />
      case "Opérateur":
        return <FaUserCheck className="role-icon operator" />
      default:
        return null
    }
  }

  return (
    <div className="user-container">
      <Sidebar isOpen={sidebarOpen} />
      <div className="user-content">
        <Header title="Gestion des Utilisateurs" onToggleSidebar={toggleSidebar} />
        <main className="user-main">
          <div className="user-controls">
            <div className="user-search-filter-container">
              <div className="user-search-container">
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou téléphone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="user-search-input"
                />
                <button className="user-filter-button" onClick={() => setShowFilters(!showFilters)}>
                  <FaFilter />
                </button>
              </div>
              <div className="user-action-buttons">
                <button 
                  className="user-add-button"
                  onClick={() => setShowAddModal(true)}
                >
                  <FaPlus /> Ajouter un utilisateur
                </button>
              </div>
            </div>
          </div>

          {showFilters && (
            <div className="user-filters-container">
              <div className="user-filters-header">
                <h3>Filtres</h3>
                <button
                  className="user-close-filters-button"
                  onClick={() => setShowFilters(false)}
                >
                  <FaTimes />
                </button>
              </div>
              <div className="user-filters-body">
                <div className="user-filter-group">
                  <label>Rôle</label>
                  <select
                    className="user-filter-select"
                    value={filters.role}
                    onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  >
                    {roles.map((role) => (
                      <option key={`role-${role.toLowerCase().replace(/\s+/g, '-')}`} value={role}>
                        {role === "all" ? "Tous les rôles" : 
                         role === "admin" ? "Admin" : 
                         role === "team_leader" ? "Team Leader" : 
                         role === "technicien" ? "Technicien" : 
                         role === "opérateur" ? "Opereteur" : 
                         role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="user-filter-group">
                  <label>Département</label>
                  <select
                    className="user-filter-select"
                    value={filters.department}
                    onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  >
                    {departments.map((department) => (
                      <option key={`dept-${department.toLowerCase().replace(/\s+/g, '-')}`} value={department}>
                        {department === "all" ? "Tous les départements" : department}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="user-filter-actions">
                  <button
                    className="user-reset-filters-button"
                    onClick={() => {
                      setFilters({
                        role: "all",
                        department: "all",
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
            <div className="user-loading-indicator">Chargement des utilisateurs...</div>
          ) : (
            <div className="user-table-container">
              <table className="user-table">
                <thead>
                  <tr>
                    <th onClick={() => requestSort("lastName")}>
                      Nom <FaSort className="sort-icon" />
                    </th>
                    <th onClick={() => requestSort("firstName")}>
                      Prénom <FaSort className="sort-icon" />
                    </th>
                    <th onClick={() => requestSort("email")}>
                      Email <FaSort className="sort-icon" />
                    </th>
                    <th onClick={() => requestSort("role")}>
                      Rôle <FaSort className="sort-icon" />
                    </th>
                    <th onClick={() => requestSort("department")}>
                      Département <FaSort className="sort-icon" />
                    </th>
                    <th onClick={() => requestSort("phone")}>
                      Téléphone <FaSort className="sort-icon" />
                    </th>
                    {/* Colonne de statut supprimée */}
                    
                    
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id || user.id || `user-${user.email.toLowerCase().replace(/\s+/g, '-')}`}>
                      <td>{user.lastName}</td>
                      <td>{user.firstName}</td>
                      <td>{user.email}</td>
                      <td>
                        {user.role === "admin" ? "Admin" : 
                         user.role === "team_leader" ? "Team Leader" : 
                         user.role === "technicien" ? "Technicien" : 
                         user.role === "opérateur" ? "Opérateur" :
                         user.role}
                      </td>
                      <td>{user.department}</td>
                      <td>{user.phone}</td>
                     
                      <td>
                        <div className="user-action-buttons">
                          <button 
                            className="user-action-btn user-delete" 
                            onClick={() => {
                              setCurrentUser(user);
                              setShowDeleteModal(true);
                            }}
                            title="Supprimer"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </main>
      </div>

      {/* Modal d'ajout d'utilisateur */}
      <Modal 
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Ajouter un utilisateur"
        size="large"
      >
        <AddUserForm onSubmit={handleAddUser} onClose={() => setShowAddModal(false)} />
      </Modal>

      {/* Modal d'édition d'utilisateur */}
      {/* Modal de suppression d'utilisateur */}
      {showDeleteModal && currentUser && (
        <DeleteUserModal
          user={currentUser}
          onConfirm={handleDeleteUser}
          onClose={() => {
            setShowDeleteModal(false);
            setCurrentUser(null);
          }}
        />
      )}
    </div>
  )
}

export default UserManagementPage

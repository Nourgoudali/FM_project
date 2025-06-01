"use client"

import { useState, useEffect } from "react"
import {
  FaPlus,
  FaEdit,
  FaTrash,
  FaSearch,
  FaFileExport,
  FaFilter,
  FaSort,
  FaUserShield,
  FaUserCog,
  FaUserTie,
  FaUserCheck,
  FaCircle,
} from "react-icons/fa"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import "./UserManagementPage.css"
import Modal from "../../components/Modal/Modal"
import AddUserForm from "../../components/User/AddUserForm";
import { useSidebar } from "../../contexts/SidebarContext"
import { userAPI } from "../../services/api"

const UserManagementPage = () => {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [sortConfig, setSortConfig] = useState({ key: "lastName", direction: "ascending" })
  const [filters, setFilters] = useState({
    role: "all",
    status: "all",
    department: "all",
  })
  const [showFilters, setShowFilters] = useState(false)

  // Chargement des données depuis l'API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getAllUsers();
        
        if (response && response.data) {
          setUsers(response.data);
          setFilteredUsers(response.data);
        } else {
          // Données de test
          const mockUsers = [
            {
              id: 1,
              lastName: "admin",
              firstName: "admin",
              email: "admin@gmao.com",
              role: "admin",
              department: "Administration",
              phone: "01 23 45 67 89",
              status: "Actif",
              lastLogin: "2024-02-20"
            },
            {
              id: 2,
              lastName: "teamleader",
              firstName: "teamleader",
              email: "team@gmao.com",
              role: "team_leader",
              department: "Maintenance",
              phone: "01 23 45 67 90",
              status: "Actif",
              lastLogin: "2024-02-19"
            },
            {
              id: 3,
              lastName: "technician",
              firstName: "technician",
              email: "tech@gmao.com",
              role: "technician",
              department: "Production",
              phone: "01 23 45 67 91",
              status: "Actif",
              lastLogin: "2024-02-18"
            },
            {
              id: 4,
              lastName: "aya",
              firstName: "aya",
              email: "AYA@gmail.com",
              role: "admin",
              department: "Administration",
              phone: "01 23 45 67 92",
              status: "Actif",
              lastLogin: "2024-02-17"
            }
          ];
          setUsers(mockUsers);
          setFilteredUsers(mockUsers);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs:", error);
        setError("Impossible de charger les utilisateurs. Veuillez réessayer plus tard.");
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

    if (filters.status !== "all") {
      result = result.filter((user) => user.status === filters.status)
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

  // Fonction pour gérer l'ajout d'un nouvel utilisateur
  const handleAddUser = async (newUser) => {
    try {
      const response = await userAPI.register(newUser);
      
      if (response && response.data) {
        setUsers([...users, response.data]);
        setShowAddModal(false);
      } else {
        throw new Error("Erreur lors de l'ajout de l'utilisateur");
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'utilisateur:", error);
      alert("Une erreur est survenue lors de l'ajout de l'utilisateur");
    }
  }

  // Fonction pour gérer la modification d'un utilisateur
  const handleEditUser = async (updatedUser) => {
    try {
      const response = await userAPI.updateUser(updatedUser._id || updatedUser.id, updatedUser);
      
      if (response && response.data) {
        setUsers(users.map(user => 
          (user._id || user.id) === (updatedUser._id || updatedUser.id) ? response.data : user
        ));
        setShowEditModal(false);
      } else {
        throw new Error("Erreur lors de la modification de l'utilisateur");
      }
    } catch (error) {
      console.error("Erreur lors de la modification de l'utilisateur:", error);
      alert("Une erreur est survenue lors de la modification de l'utilisateur");
    }
  }

  // Fonction pour gérer la suppression d'un utilisateur
  const handleDeleteUser = async (userId) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        await userAPI.deleteUser(userId);
        setUsers(users.filter(user => (user._id || user.id) !== userId));
      } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
        alert("Une erreur est survenue lors de la suppression de l'utilisateur");
      }
    }
  }

  // Fonction pour gérer le changement de statut d'un utilisateur
  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === "Actif" ? "Inactif" : "Actif";
      const response = await userAPI.changeUserStatus(userId, newStatus);
      
      if (response && response.data) {
        setUsers(users.map(user => 
          (user._id || user.id) === userId ? { ...user, status: newStatus } : user
        ));
      } else {
        throw new Error("Erreur lors du changement de statut");
      }
    } catch (error) {
      console.error("Erreur lors du changement de statut de l'utilisateur:", error);
      alert("Une erreur est survenue lors du changement de statut de l'utilisateur");
    }
  }

  // Obtenir les rôles, statuts et départements uniques pour les filtres
  const roles = ["all", ...new Set(users.map((user) => user.role))]
  const statuses = ["all", "Actif", "Inactif"]
  const departments = ["all", ...new Set(users.map((user) => user.department))]

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
    <div className="user-management-container">
      <Sidebar isOpen={sidebarOpen} />
      <div className="user-management-content">
        <Header title="Gestion des Utilisateurs" onToggleSidebar={toggleSidebar} />
        <main className="user-management-main">
          <div className="user-controls">
            <div className="search-bar">
              <input
                type="text"
                placeholder="Rechercher par nom, email ou téléphone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-controls">
              <button className="filter-button" onClick={() => setShowFilters(!showFilters)}>
                <FaFilter /> Filtres
              </button>

              <button className="add-button" onClick={() => setShowAddModal(true)}>
                <FaPlus /> Ajouter un utilisateur
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="filters-panel">
              <div className="filter-group">
                <label>Rôle:</label>
                <select value={filters.role} onChange={(e) => setFilters({ ...filters, role: e.target.value })}>
                  {roles.map((role) => (
                    <option key={`role-${role.toLowerCase().replace(/\s+/g, '-')}`} value={role}>
                      {role === "all" ? "Tous les rôles" : role}
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
                <label>Département:</label>
                <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
                  {departments.map((department) => (
                    <option key={`dept-${department.toLowerCase().replace(/\s+/g, '-')}`} value={department}>
                      {department === "all" ? "Tous les départements" : department}
                    </option>
                  ))}
                </select>
              </div>

              <button
                className="reset-filters"
                onClick={() =>
                  setFilters({
                    role: "all",
                    status: "all",
                    department: "all",
                  })
                }
              >
                Réinitialiser
              </button>
            </div>
          )}

          {loading ? (
            <div className="loading-indicator">Chargement des utilisateurs...</div>
          ) : error ? (
            <div className="error-message">{error}</div>
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
                    <th onClick={() => requestSort("status")}>
                      Statut <FaSort className="sort-icon" />
                    </th>
                    <th onClick={() => requestSort("lastLogin")}>
                      Dernière connexion <FaSort className="sort-icon" />
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id || user.id || `user-${user.email.toLowerCase().replace(/\s+/g, '-')}`}>
                      <td>{user.lastName}</td>
                      <td>{user.firstName}</td>
                      <td>{user.email}</td>
                      <td>{user.role}</td>
                      <td>{user.department}</td>
                      <td>{user.phone}</td>
                      <td>
                        <span className={`status-badge ${user.lastLogin ? "active" : "inactive"}`}>
                          <FaCircle className="status-icon" />
                          {user.lastLogin ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Jamais"}</td>
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="action-btn edit" 
                            onClick={() => handleEditUser(user)}
                            title="Modifier"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="action-btn delete" 
                            onClick={() => handleDeleteUser(user._id || user.id)}
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
      <Modal 
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Modifier l'utilisateur"
        size="large"
      >
        <AddUserForm
          user={currentUser}
          onSubmit={handleEditUser}
          onClose={() => setShowEditModal(false)}
          isEdit
        />
      </Modal>
    </div>
  )
}

export default UserManagementPage

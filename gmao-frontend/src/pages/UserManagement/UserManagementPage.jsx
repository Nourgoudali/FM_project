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
          // Données fictives comme fallback
          initializeMockUsers();
        }
      } catch (error) {
        console.error("Erreur lors du chargement des utilisateurs:", error);
        setError("Impossible de charger les utilisateurs");
        // Utiliser des données fictives en cas d'erreur
        initializeMockUsers();
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Fonction pour initialiser des données fictives
  const initializeMockUsers = () => {
    const mockUsers = [
      {
        id: 1,
        firstName: "Jean",
        lastName: "Dupont",
        email: "jean.dupont@example.com",
        role: "Administrateur",
        department: "Maintenance",
        phone: "06 12 34 56 78",
        status: "Actif",
        lastLogin: "2023-06-15 08:45",
        createdAt: "2023-01-10",
      },
      {
        id: 2,
        firstName: "Marie",
        lastName: "Martin",
        email: "marie.martin@example.com",
        role: "Technicien",
        department: "Production",
        phone: "06 23 45 67 89",
        status: "Actif",
        lastLogin: "2023-06-14 14:30",
        createdAt: "2023-02-05",
      },
      {
        id: 3,
        firstName: "Pierre",
        lastName: "Durand",
        email: "pierre.durand@example.com",
        role: "Manager",
        department: "Maintenance",
        phone: "06 34 56 78 90",
        status: "Actif",
        lastLogin: "2023-06-10 09:15",
        createdAt: "2023-01-15",
      },
      {
        id: 4,
        firstName: "Sophie",
        lastName: "Leroy",
        email: "sophie.leroy@example.com",
        role: "Technicien",
        department: "Qualité",
        phone: "06 45 67 89 01",
        status: "Inactif",
        lastLogin: "2023-05-20 11:30",
        createdAt: "2023-03-01",
      },
      {
        id: 5,
        firstName: "Thomas",
        lastName: "Moreau",
        email: "thomas.moreau@example.com",
        role: "Opérateur",
        department: "Production",
        phone: "06 56 78 90 12",
        status: "Actif",
        lastLogin: "2023-06-15 07:50",
        createdAt: "2023-04-10",
      },
    ];

    setUsers(mockUsers);
    setFilteredUsers(mockUsers);
  };

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

  // Gérer l'ajout d'un nouvel utilisateur
  const handleAddUser = async (newUser) => {
    try {
      // Appel à l'API pour créer un utilisateur
      const response = await userAPI.register(newUser);
      
      if (response && response.data) {
        // Ajouter l'utilisateur à la liste
        setUsers([...users, response.data]);
        setShowAddModal(false);
      } else {
        // Fallback si pas de réponse valide
        const tempUser = { ...newUser, id: users.length + 1 };
        setUsers([...users, tempUser]);
        setShowAddModal(false);
      }
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'utilisateur:", error);
      alert("Une erreur est survenue lors de l'ajout de l'utilisateur");
    }
  }

  // Gérer la modification d'un utilisateur
  const handleEditUser = async (updatedUser) => {
    try {
      // Appel à l'API pour mettre à jour l'utilisateur
      const response = await userAPI.updateUser(updatedUser.id, updatedUser);
      
      if (response && response.data) {
        // Mettre à jour la liste des utilisateurs
        setUsers(users.map(user => user.id === updatedUser.id ? response.data : user));
      } else {
        // Fallback si pas de réponse valide
        setUsers(users.map(user => user.id === updatedUser.id ? updatedUser : user));
      }
      
      setShowEditModal(false);
    } catch (error) {
      console.error("Erreur lors de la modification de l'utilisateur:", error);
      alert("Une erreur est survenue lors de la modification de l'utilisateur");
    }
  }

  // Gérer la suppression d'un utilisateur
  const handleDeleteUser = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) {
      try {
        // Appel à l'API pour supprimer l'utilisateur
        await userAPI.deleteUser(id);
        
        // Mettre à jour la liste des utilisateurs
        setUsers(users.filter(user => user.id !== id));
      } catch (error) {
        console.error("Erreur lors de la suppression de l'utilisateur:", error);
        alert("Une erreur est survenue lors de la suppression de l'utilisateur");
      }
    }
  }

  // Gérer le changement de statut d'un utilisateur
  const handleToggleUserStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "Actif" ? "Inactif" : "Actif";
      
      // Appel à l'API pour changer le statut
      const response = await userAPI.changeUserStatus(id, newStatus);
      
      if (response && response.data) {
        // Mettre à jour la liste des utilisateurs
        setUsers(users.map(user => user.id === id ? { ...user, status: newStatus } : user));
      } else {
        // Fallback si pas de réponse valide
        setUsers(users.map(user => user.id === id ? { ...user, status: newStatus } : user));
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

              <button className="export-button">
                <FaFileExport /> Exporter
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
                  {roles.map((role, index) => (
                    <option key={index} value={role}>
                      {role === "all" ? "Tous les rôles" : role}
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
                <label>Département:</label>
                <select value={filters.department} onChange={(e) => setFilters({ ...filters, department: e.target.value })}>
                  {departments.map((department, index) => (
                    <option key={index} value={department}>
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
                    <tr key={user.id}>
                      <td>{user.lastName}</td>
                      <td>{user.firstName}</td>
                      <td>{user.email}</td>
                      <td>
                        <div className="role-cell">
                          {getRoleIcon(user.role)}
                          {user.role}
                        </div>
                      </td>
                      <td>{user.department}</td>
                      <td>{user.phone}</td>
                      <td>
                        <span 
                          className={`status-badge ${user.status === "Actif" ? "active" : "inactive"}`}
                          onClick={() => handleToggleUserStatus(user.id, user.status)}
                          style={{ cursor: 'pointer' }}
                          title="Cliquer pour changer le statut"
                        >
                          {user.status}
                        </span>
                      </td>
                      <td>{user.lastLogin}</td>
                      <td className="actions-cell">
                        <button
                          className="action-btn edit"
                          onClick={() => {
                            setCurrentUser(user)
                            setShowEditModal(true)
                          }}
                        >
                          <FaEdit />
                        </button>
                        <button className="action-btn delete" onClick={() => handleDeleteUser(user.id)}>
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

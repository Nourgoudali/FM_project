import { useState, useEffect, useRef } from "react"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import { useAuth } from "../../contexts/AuthContext"
import "./ProfilePage.css"
import { useSidebar } from "../../contexts/SidebarContext"
import { userAPI } from "../../services/api"
import Modal from "../../components/Modal/Modal"
import { RiKey2Line } from "react-icons/ri"
import { FaChevronDown, FaEye, FaEyeSlash, FaTimes, FaEdit, FaSave } from "react-icons/fa"
import toast from "react-hot-toast"

function ProfilePage() {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const { currentUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    phone: "",
    department: "",
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  })
  // États pour le mot de passe
  
  // États pour l'attribution de rôle
  const [selectedEmployee, setSelectedEmployee] = useState("")
  const [selectedEmployeeName, setSelectedEmployeeName] = useState("")
  const [searchRole, setSearchRole] = useState("")
  const [selectedEmployeeRole, setSelectedEmployeeRole] = useState("")
  const [selectedRole, setSelectedRole] = useState("")
  const [showRoleResults, setShowRoleResults] = useState(false)
  
  // États pour le changement de mot de passe d'un utilisateur
  const [selectedEmployeeForPassword, setSelectedEmployeeForPassword] = useState("")
  const [selectedEmployeePasswordName, setSelectedEmployeePasswordName] = useState("")
  const [searchPassword, setSearchPassword] = useState("")
  const [newAdminPassword, setNewAdminPassword] = useState("")
  const [showNewAdminPassword, setShowNewAdminPassword] = useState(false)
  const [showPasswordResults, setShowPasswordResults] = useState(false)
  const [showAdminPasswordModal, setShowAdminPasswordModal] = useState(false)
  const [showRoleModal, setShowRoleModal] = useState(false)
  const [filteredEmployeesForRole, setFilteredEmployeesForRole] = useState([])
  const [filteredEmployeesForPassword, setFilteredEmployeesForPassword] = useState([])
  
  // États pour la gestion des opérations
  
  // États pour la liste des employés
  const [employeeList, setEmployeeList] = useState([])
  const [employeeLoading, setEmployeeLoading] = useState(true)
  
  // Références pour les dropdowns
  const roleSearchRef = useRef(null)
  const passwordSearchRef = useRef(null)

  // Récupérer les données du profil depuis l'API et la liste des employés
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setLoading(true);
        const response = await userAPI.getProfile();
        
        if (response && response.data && response.data.user) {
          const userData = response.data.user;
          
          setFormData({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: userData.email || "",
            role: userData.role || "",
            phone: userData.phone || "",
            department: userData.department || "",
          });
        }
      } catch (error) {
        toast.error("Impossible de charger votre profil");
      } finally {
        setLoading(false);
      }
    };
    
    // Charger la liste des employés
    const fetchEmployees = async () => {
      try {
        setEmployeeLoading(true);
        const response = await userAPI.getAllUsers();
        setEmployeeList(response.data);
      } catch (error) {
        toast.error("Erreur lors du chargement des employés");
      } finally {
        setEmployeeLoading(false);
      }
    };
    
    fetchUserProfile();
    fetchEmployees();
  }, [currentUser]);
  
  // Fermer les résultats de recherche quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleSearchRef.current && !roleSearchRef.current.contains(event.target)) {
        setShowRoleResults(false);
      }
      if (passwordSearchRef.current && !passwordSearchRef.current.contains(event.target)) {
        setShowPasswordResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Mettre à jour le rôle de l'employé sélectionné lorsqu'il change
  useEffect(() => {
    if (selectedEmployee) {
      const employee = employeeList.find(emp => emp._id === selectedEmployee);
      if (employee) {
        setSelectedEmployeeRole(employee.role);
      }
    } else {
      setSelectedEmployeeRole("");
    }
  }, [selectedEmployee, employeeList]);

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e = null) => {
    if (e) e.preventDefault()
    setLoading(true)
    try {
      await userAPI.updateCurrentUser(formData)
      toast.success("Profil mis à jour avec succès")
      setIsEditing(false)
    } catch (error) {
      console.error("Erreur lors de la mise à jour du profil:", error)
      toast.error("Erreur lors de la mise à jour du profil")
    } finally {
      setLoading(false)
    }
  }
  
  // Fonctions pour l'attribution de rôle
  const handleRoleSearchFocus = () => {
    // Afficher immédiatement les résultats lors du focus
    setShowRoleResults(true)
    // Si aucun utilisateur n'est sélectionné, afficher tous les utilisateurs
    if (!selectedEmployee && searchRole.trim() === "") {
      // Déjà géré par getFilteredEmployeesForRole()
    }
  }
  
  const handleSelectEmployeeForRole = (employee) => {
    setSelectedEmployee(employee._id)
    const displayName = `${employee.firstName} ${employee.lastName}`
    setSelectedEmployeeName(displayName)
    setSearchRole(displayName)
  }
  
  const clearRoleSearch = () => {
    setSearchRole("")
    setSelectedEmployee("")
    setSelectedEmployeeName("")
    setFilteredEmployeesForRole([])
    if (document.getElementById("searchEmployee")) {
      document.getElementById("searchEmployee").focus()
    }
  }
  
  const handleAssignRole = async () => {
    if (!selectedEmployee || !selectedRole) {
      toast.error("Veuillez sélectionner un employé et un rôle")
      return
    }
    
    setLoading(true)
    
    try {
      await userAPI.assignRole(selectedEmployee, { role: selectedRole })
      
      // Réinitialiser les champs après succès
      setSelectedRole("")
      clearRoleSearch()
      
      // Fermer le modal
      setShowRoleModal(false)
      
      toast.success("Rôle attribué avec succès")
    } catch (error) {
      console.error("Erreur lors de l'attribution du rôle:", error)
      const errorMessage = error.response?.data?.message || "Une erreur est survenue lors de l'attribution du rôle"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }
  
  // Fonctions pour le changement de mot de passe d'un utilisateur
  const handlePasswordSearchFocus = () => {
    // Afficher immédiatement les résultats lors du focus
    setShowPasswordResults(true)
    // Si aucun utilisateur n'est sélectionné, afficher tous les utilisateurs
    if (!selectedEmployeeForPassword && searchPassword.trim() === "") {
      // Déjà géré par getFilteredEmployeesForPassword()
    }
  }
  
  const handleSelectEmployeeForPassword = (employee) => {
    setSelectedEmployeeForPassword(employee._id)
    const displayName = `${employee.firstName} ${employee.lastName}`
    setSelectedEmployeePasswordName(displayName)
    setSearchPassword(displayName)
  }
  
  const clearPasswordSearch = () => {
    setSearchPassword("")
    setSelectedEmployeeForPassword("")
    setSelectedEmployeePasswordName("")
    setFilteredEmployeesForPassword([])
    if (document.getElementById("searchEmployeePassword")) {
      document.getElementById("searchEmployeePassword").focus()
    }
  }
  
  const handleChangePassword = async () => {
    if (!selectedEmployeeForPassword || !newAdminPassword) {
      toast.error("Veuillez sélectionner un employé et saisir un nouveau mot de passe")
      return
    }
    
    setLoading(true)
    
    try {
      await userAPI.adminChangeUserPassword(selectedEmployeeForPassword, { newPassword: newAdminPassword })
      
      // Réinitialiser les champs après succès
      setNewAdminPassword("")
      clearPasswordSearch()
      
      // Fermer la modale
      setShowAdminPasswordModal(false)
      
      toast.success("Mot de passe modifié avec succès")
    } catch (error) {
      console.error("Erreur lors de la modification du mot de passe:", error)
      const errorMessage = error.response?.data?.message || "Une erreur est survenue lors de la modification du mot de passe"
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    // Vérifier que les mots de passe correspondent
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    
    // Vérifier que le mot de passe est suffisamment fort
    if (passwordData.newPassword.length < 6) {
      toast.error("Le nouveau mot de passe doit contenir au moins 6 caractères");
      return;
    }
    
    try {
      // Appel à l'API pour changer le mot de passe
      const response = await userAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      // Réinitialiser le formulaire
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      
      toast.success("Mot de passe modifié avec succès");
      
      // Fermer le modal
      setShowPasswordModal(false);
      
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Une erreur est survenue lors du changement de mot de passe");
      }
    }
  }

  // Compétences pour la démo
  const skills = ["Mécanique", "Électricité", "Automatisme"]
  
  // Fonction pour gérer l'attribution de rôle
  const handleAttributeRole = async () => {
    if (!selectedEmployee || !selectedRole) {
      toast.error("Veuillez sélectionner un employé et un rôle");
      return;
    }
    
    setLoading(true);
    
    try {
      // Vérifier si le rôle sélectionné est valide
      const validRoles = ['admin', 'team_leader', 'technicien', 'opérateur'];
      if (!validRoles.includes(selectedRole)) {
        throw new Error("Rôle invalide");
      }
      
      const response = await userAPI.assignRole(selectedEmployee, { role: selectedRole });
      
      // Ne pas vérifier response.success car certaines API ne le renvoient pas
      // Réinitialiser les champs après succès
      setSelectedRole("");
      setSearchRole("");
      setSelectedEmployee("");
      setSelectedEmployeeName("");
      
      // Mettre à jour la liste des employés
      const updatedEmployees = employeeList.map(emp => 
        emp._id === selectedEmployee ? { ...emp, role: selectedRole } : emp
      );
      setEmployeeList(updatedEmployees);
      
      // Mettre à jour le rôle affiché dans le formulaire si l'utilisateur modifie son propre rôle
      if (selectedEmployee === currentUser._id) {
        setFormData(prev => ({
          ...prev,
          role: selectedRole
        }));
      }
      
      // Fermer la modale
      setShowRoleModal(false);
      
      // Afficher le message de succès
      toast.success("Rôle attribué avec succès");
      
    } catch (error) {
      console.error("Erreur lors de l'attribution du rôle:", error);
      let errorMessage = "Une erreur est survenue lors de l'attribution du rôle";
      
      if (error.message === "Rôle invalide") {
        errorMessage = "Le rôle sélectionné n'est pas valide";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour obtenir les rôles disponibles en fonction du rôle actuel
  const getAvailableRoles = (currentRole) => {
    // Liste des rôles valides et leurs libellés
    const roleTranslations = {
      'admin': 'Administrateur',
      'team_leader': 'Team Leader',
      'technicien': 'Technicien',
      'opérateur': 'Opérateur'
    };
    
    // Si currentRole n'est pas défini, retourner tous les rôles
    if (!currentRole) {
      return Object.entries(roleTranslations).map(([value, label]) => ({
        value,
        label
      }));
    }
    
    // Filtrer le rôle actuel et retourner les rôles disponibles avec leur traduction
    return Object.entries(roleTranslations)
      .filter(([role]) => role !== currentRole)
      .map(([value, label]) => ({
        value,
        label
      }));
  };
  
  // Fonctions de filtrage des employés pour exclure l'utilisateur courant
  const getFilteredEmployeesForRole = () => {
    if (!employeeList.length) return [];
    
    // Filtrer d'abord les employés pour exclure l'utilisateur courant
    const filteredEmployees = employeeList.filter(emp => {
      // Exclure l'utilisateur courant en utilisant son email comme identifiant unique
      return emp.email !== formData.email;
    });

    if (!searchRole.trim()) return filteredEmployees;
    
    const searchQuery = searchRole.toLowerCase();
    return filteredEmployees.filter(emp => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      const reverseName = `${emp.lastName} ${emp.firstName}`.toLowerCase();
      return fullName.includes(searchQuery) || 
             reverseName.includes(searchQuery) ||
             emp.firstName.toLowerCase().includes(searchQuery) || 
             emp.lastName.toLowerCase().includes(searchQuery);
    });
  };

  const getFilteredEmployeesForPassword = () => {
    if (!employeeList.length) return [];
    
    // Filtrer d'abord les employés pour exclure l'utilisateur courant
    const filteredEmployees = employeeList.filter(emp => {
      // Exclure l'utilisateur courant en utilisant son email comme identifiant unique
      return emp.email !== formData.email;
    });

    if (!searchPassword.trim()) return filteredEmployees;
    
    const searchQuery = searchPassword.toLowerCase();
    return filteredEmployees.filter(emp => {
      const fullName = `${emp.firstName} ${emp.lastName}`.toLowerCase();
      const reverseName = `${emp.lastName} ${emp.firstName}`.toLowerCase();
      return fullName.includes(searchQuery) || 
             reverseName.includes(searchQuery) ||
             emp.firstName.toLowerCase().includes(searchQuery) || 
             emp.lastName.toLowerCase().includes(searchQuery);
    });
  };

  if (loading) {
    return (
      <div className="profile-container">
        <Sidebar isOpen={sidebarOpen} />
        <div className="profile-content">
          <Header title="Profil utilisateur" onToggleSidebar={toggleSidebar} />
          <main className="profile-main">
            <div className="profile-loading-indicator">Chargement du profil...</div>
          </main>
        </div>
      </div>
    );
  }



  return (
    <div className="profile-container">
      <Sidebar isOpen={sidebarOpen} />

      <div className="profile-content">
        <Header title="Profil utilisateur" onToggleSidebar={toggleSidebar} />

        <main className="profile-main">
          <div className="profile-layout">
            {/* Informations personnelles */}
            <div className="profile-card">
              <h3>Informations personnelles</h3>
              
              <div className="profile-form">
                <div className="profile-form-row">
                  <div className="profile-form-group">
                    <label>Prénom</label>
                    <input 
                      type="text" 
                      name="firstName" 
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing} 
                    />
                  </div>
                  
                  <div className="profile-form-group">
                    <label>Nom</label>
                    <input 
                      type="text" 
                      name="lastName" 
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!isEditing} 
                    />
                  </div>
                </div>
                
                <div className="profile-form-row">
                  <div className="profile-form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing} 
                    />
                  </div>
                  
                  <div className="profile-form-group">
                    <label>Téléphone</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing} 
                      placeholder="Non défini" 
                    />
                  </div>
                </div>
                
                <div className="profile-form-row">
                  <div className="profile-form-group">
                    <label>Service</label>
                    <input 
                      type="text" 
                      name="department" 
                      value={formData.department}
                      onChange={handleChange}
                      disabled={!isEditing} 
                      placeholder="Non défini" 
                    />
                  </div>
                  
                  <div className="profile-form-group">
                    <label>Poste</label>
                    <input 
                      type="text" 
                      name="role" 
                      value={formData.role === "admin" ? "Administrateur" : 
                             formData.role === "team_leader" ? "Chef d'équipe" : 
                             formData.role === "technician" ? "Technicien" : formData.role}
                      onChange={handleChange}
                      disabled={true} 
                    />
                  </div>
                </div>

                <div className="profile-form-actions">
                  <button 
                    className="profile-password-button"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    <RiKey2Line className="key-icon" />
                    Modifier le mot de passe
                  </button>
                  
                  <button 
                    className="profile-edit-button"
                    onClick={() => isEditing ? handleSubmit() : setIsEditing(true)}
                  >
                    {isEditing ? (
                      <>
                        <FaSave className="profile-save-icon" />
                        Enregistrer
                      </>
                    ) : (
                      <>
                        <FaEdit className="profile-edit-icon" />
                        Modifier le profil
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Cartes d'administration des utilisateurs */}
          {formData.role === "admin" && (
            <div className="profile-admin-section">
              {/* Carte d'attribution de rôle */}
              <div className="profile-admin-card">
                <h3 className="profile-admin-card-title">Attribution de rôle</h3>
                <div className="profile-admin-form-row">
                  <div className="profile-admin-form-group" ref={roleSearchRef}>
                    <label className="profile-admin-form-label" htmlFor="searchEmployee">Employé</label>
                    <div className="profile-admin-search-container">
                      <input
                        id="searchEmployee"
                        type="text"
                        className={`profile-admin-form-input ${selectedEmployee ? 'profile-admin-search-item-selected' : ''}`}
                        value={searchRole}
                        onChange={(e) => {
                          setSearchRole(e.target.value);
                          setShowRoleResults(true);
                          if (e.target.value.trim() === "" || 
                              !selectedEmployeeName.toLowerCase().includes(e.target.value.toLowerCase())) {
                            setSelectedEmployee("");
                            setSelectedEmployeeRole("");
                          }
                        }}
                        onFocus={handleRoleSearchFocus}
                        placeholder="Sélectionner un employé"
                        disabled={loading || employeeLoading}
                      />
                      <FaChevronDown className="profile-admin-select-icon" />
                      {searchRole && (
                        <button 
                          type="button" 
                          className="profile-admin-search-clear" 
                          onClick={clearRoleSearch}
                          aria-label="Effacer la recherche"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                    
                    {showRoleResults && (
                      <ul className="profile-admin-search-results">
                        {employeeLoading ? (
                          <li className="profile-admin-search-message">Chargement des employés...</li>
                        ) : getFilteredEmployeesForRole().length > 0 ? (
                          getFilteredEmployeesForRole().map(emp => (
                            <li 
                              key={emp._id} 
                              className={`profile-admin-search-item ${selectedEmployee === emp._id ? 'profile-admin-search-item-selected' : ''}`}
                              onClick={() => handleSelectEmployeeForRole(emp)}
                            >
                              {emp.firstName} {emp.lastName}
                            </li>
                          ))
                        ) : (
                          <li className="profile-admin-search-message">Aucun employé trouvé</li>
                        )}
                      </ul>
                    )}
                  </div>
                  
                  <div className="profile-admin-form-group">
                    <label className="profile-admin-form-label" htmlFor="role">Rôle</label>
                    <div className="profile-admin-select-wrapper">
                      <select
                        id="role"
                        className="profile-admin-form-select"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        disabled={loading || !selectedEmployee}
                      >
                        <option value="">Sélectionner un rôle</option>
                        {selectedEmployeeRole && 
                          getAvailableRoles(selectedEmployeeRole).map(({value, label}) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))
                        }
                      </select>
                      <FaChevronDown className="profile-admin-select-icon" />
                    </div>
                  </div>
                  
                  <div className="profile-admin-button-container">
                    <button 
                      className="profile-admin-btn-primary" 
                      onClick={handleAttributeRole}
                      disabled={loading || !selectedEmployee || !selectedRole}
                    >
                      {loading ? "Traitement..." : "Attribuer"}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Carte de modification du mot de passe */}
              <div className="profile-admin-card">
                <h3 className="profile-admin-card-title">Modification du mot de passe</h3>
                <div className="profile-admin-form-row">
                  <div className="profile-admin-form-group" ref={passwordSearchRef}>
                    <label className="profile-admin-form-label" htmlFor="searchEmployeePassword">Employé</label>
                    <div className="profile-admin-search-container">
                      <input
                        id="searchEmployeePassword"
                        type="text"
                        className={`profile-admin-form-input ${selectedEmployeeForPassword ? 'profile-admin-search-item-selected' : ''}`}
                        value={searchPassword}
                        onChange={(e) => {
                          setSearchPassword(e.target.value);
                          setShowPasswordResults(true);
                          if (e.target.value.trim() === "" ||
                              !selectedEmployeePasswordName.toLowerCase().includes(e.target.value.toLowerCase())) {
                            setSelectedEmployeeForPassword("");
                          }
                        }}
                        onFocus={handlePasswordSearchFocus}
                        placeholder="Sélectionner un employé"
                        disabled={loading || employeeLoading}
                      />
                      <FaChevronDown className="profile-admin-select-icon" />
                      {searchPassword && (
                        <button 
                          type="button" 
                          className="profile-admin-search-clear" 
                          onClick={clearPasswordSearch}
                          aria-label="Effacer la recherche"
                        >
                          <FaTimes />
                        </button>
                      )}
                    </div>
                    
                    {showPasswordResults && (
                      <ul className="profile-admin-search-results">
                        {employeeLoading ? (
                          <li className="profile-admin-search-message">Chargement des employés...</li>
                        ) : getFilteredEmployeesForPassword().length > 0 ? (
                          getFilteredEmployeesForPassword().map(emp => (
                            <li 
                              key={emp._id} 
                              className={`profile-admin-search-item ${selectedEmployeeForPassword === emp._id ? 'profile-admin-search-item-selected' : ''}`}
                              onClick={() => handleSelectEmployeeForPassword(emp)}
                            >
                              {emp.firstName} {emp.lastName}
                            </li>
                          ))
                        ) : (
                          <li className="profile-admin-search-message">Aucun employé trouvé</li>
                        )}
                      </ul>
                    )}
                  </div>
                  
                  <div className="profile-admin-form-group">
                    <label className="profile-admin-form-label" htmlFor="newAdminPassword">Nouveau mot de passe</label>
                    <div className="profile-admin-password-input-container">
                      <input
                        id="newAdminPassword"
                        type={showNewAdminPassword ? "text" : "password"}
                        className="profile-admin-form-input"
                        value={newAdminPassword}
                        onChange={(e) => setNewAdminPassword(e.target.value)}
                        placeholder="Entrer le nouveau mot de passe"
                        disabled={!selectedEmployeeForPassword}
                        required
                      />
                      <button
                        type="button"
                        className="profile-admin-password-toggle-button"
                        onClick={() => setShowNewAdminPassword(!showNewAdminPassword)}
                        disabled={loading}
                      >
                        {showNewAdminPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  
                  <div className="profile-admin-button-container">
                    <button 
                      className="profile-admin-btn-primary" 
                      onClick={handleChangePassword}
                      disabled={loading || !selectedEmployeeForPassword || !newAdminPassword}
                    >
                      {loading ? "Traitement..." : "Changer"}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Messages de succès ou d'erreur */}
              
            </div>
          )}

          
        </main>
      </div>

      {/* Modal de modification du mot de passe */}
      <Modal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)}
        title="Modifier le mot de passe"
        size="medium"
      >
        <form onSubmit={handlePasswordSubmit} className="password-form">
          <div className="profile-form-group">
            <label htmlFor="currentPassword">Mot de passe actuel</label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
              placeholder="Entrez votre mot de passe actuel"
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor="newPassword">Nouveau mot de passe</label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              placeholder="Entrez votre nouveau mot de passe"
            />
          </div>

          <div className="profile-form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              placeholder="Confirmez votre nouveau mot de passe"
            />
          </div>

          {/* Les messages d'erreur et de succès sont maintenant affichés avec des toasts */}

          <div className="profile-form-actions profile-modal-buttons">
            <button type="button" className="profile-btn-cancel" onClick={() => setShowPasswordModal(false)}>
              Annuler
            </button>
            <button type="submit" className="profile-btn-primary">
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ProfilePage

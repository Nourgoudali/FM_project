import { useState, useEffect } from "react"
import Sidebar from "../../components/Sidebar/Sidebar"
import Header from "../../components/Header/Header"
import { useAuth } from "../../contexts/AuthContext"
import "./ProfilePage.css"
import { useSidebar } from "../../contexts/SidebarContext"
import { userAPI } from "../../services/api"
import Modal from "../../components/Modal/Modal"
import { RiKey2Line } from "react-icons/ri"

function ProfilePage() {
  const { sidebarOpen, toggleSidebar } = useSidebar()
  const { currentUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
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
  const [passwordError, setPasswordError] = useState("")
  const [passwordSuccess, setPasswordSuccess] = useState("")
  const [avatarImage, setAvatarImage] = useState(null)

  // Récupérer les données du profil depuis l'API
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
        console.error("Erreur lors du chargement du profil:", error);
        setError("Impossible de charger votre profil");
        
        // Utiliser les données actuelles comme fallback
        if (currentUser) {
          setFormData({
            firstName: currentUser.firstName || "Thomas",
            lastName: currentUser.lastName || "Martin",
            email: currentUser.email || "thomas.martin@company.com",
            role: currentUser.role || "Technicien Senior",
            phone: currentUser.phone || "",
            department: currentUser.department || "",
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [currentUser]);

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

  const handleSubmit = (e) => {
    e.preventDefault()
    // Mise à jour du profil - à implémenter quand nécessaire
    console.log("Données du profil mises à jour:", formData)
    setIsEditing(false)
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError("")
    setPasswordSuccess("")
    
    // Vérifier que les mots de passe correspondent
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      return;
    }
    
    // Vérifier que le mot de passe est suffisamment fort
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 6 caractères");
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
      
      setPasswordSuccess("Mot de passe modifié avec succès");
      
      // Fermer le modal après 2 secondes
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess("");
      }, 2000);
      
    } catch (error) {
      console.error("Erreur lors du changement de mot de passe:", error);
      if (error.response && error.response.data && error.response.data.message) {
        setPasswordError(error.response.data.message);
      } else {
        setPasswordError("Une erreur est survenue lors du changement de mot de passe");
      }
    }
  }

  const handleAvatarChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        // Afficher localement l'image avant de l'envoyer au serveur
        setAvatarImage(event.target.result);
        
        try {
          // Envoyer l'image au serveur
          await userAPI.updateAvatar({ file });
          // Afficher un message de succès si nécessaire
        } catch (error) {
          console.error("Erreur lors du téléchargement de l'avatar:", error);
          // L'image est déjà affichée localement, pas besoin de la retirer
          // mais vous pourriez ajouter un message d'erreur si besoin
        }
      };
      
      reader.readAsDataURL(file);
    }
  };

  // Compétences pour la démo
  const skills = ["Mécanique", "Électricité", "Automatisme"]

  if (loading) {
    return (
      <div className="profile-container">
        <Sidebar isOpen={sidebarOpen} />
        <div className="profile-content">
          <Header title="Profil utilisateur" onToggleSidebar={toggleSidebar} />
          <main className="profile-main">
            <div className="loading-indicator">Chargement du profil...</div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-container">
        <Sidebar isOpen={sidebarOpen} />
        <div className="profile-content">
          <Header title="Profil utilisateur" onToggleSidebar={toggleSidebar} />
          <main className="profile-main">
            <div className="error-message">{error}</div>
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
                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom</label>
                    <input 
                      type="text" 
                      name="firstName" 
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!isEditing} 
                    />
                  </div>
                  
                  <div className="form-group">
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
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Email</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing} 
                    />
                  </div>
                  
                  <div className="form-group">
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
                
                <div className="form-row">
                  <div className="form-group">
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
                  
                  <div className="form-group">
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

                <div className="form-action">
                  <button 
                    className="password-button"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    <RiKey2Line className="key-icon" />
                    Modifier le mot de passe
                  </button>
                </div>
              </div>
            </div>

            {/* Profil utilisateur et compétences */}
            <div className="profile-sidebar">
              <div className="profile-card user-info-card">
                <div className="profile-avatar">
                  {avatarImage ? (
                    <img src={avatarImage} alt="Avatar" className="avatar-image" />
                  ) : (
                    <span className="avatar-text">{formData.firstName.charAt(0).toUpperCase()}</span>
                  )}
                  <label htmlFor="avatar-upload" className="avatar-edit-button">
                    <span className="camera-icon"></span>
                    <input 
                      type="file" 
                      id="avatar-upload" 
                      accept="image/*" 
                      onChange={handleAvatarChange} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
                
                <h2 className="profile-name">{`${formData.firstName} ${formData.lastName}`}</h2>
                <p className="profile-role">
                  {formData.role === "admin" ? "Administrateur" : 
                   formData.role === "team_leader" ? "Chef d'équipe" : 
                   formData.role === "technician" ? "Technicien" : formData.role}
                </p>
                <p className="profile-email">{formData.email}</p>
              </div>
              
              <div className="profile-card">
                <h3>Compétences</h3>
                
                <div className="skills-list">
                  {skills.map((skill, index) => (
                    <div key={`skill-${skill.toLowerCase().replace(/\s+/g, '-')}-${index}`} className="skill-badge">
                      {skill}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          
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
          <div className="form-group">
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

          <div className="form-group">
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

          <div className="form-group">
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

          {passwordError && <div className="error-message">{passwordError}</div>}
          {passwordSuccess && <div className="success-message">{passwordSuccess}</div>}

          <div className="form-actions modal-buttons">
            <button type="button" className="btn-cancel" onClick={() => setShowPasswordModal(false)}>
              Annuler
            </button>
            <button type="submit" className="btn-primary">
              Enregistrer
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default ProfilePage

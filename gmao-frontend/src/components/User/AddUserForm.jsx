import { useState, useEffect } from "react"
import "./AddUserForm.css"
import { userAPI } from "../../services/api"
import toast from "react-hot-toast"

function AddUserForm({ onClose, onSubmit, user, isEdit = false, hidePasswordFields = false }) {
  const [formData, setFormData] = useState(
    user
      ? { ...user, confirmPassword: "********" }
      : {
          firstName: "",
          lastName: "",
          email: "",
          role: "", 
          department: "",
          phone: "",
          password: "",
          confirmPassword: "",
        }
  )

  const [roles, setRoles] = useState([])
  const [departments, setDepartments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRolesAndDepartments = async () => {
      try {
        setIsLoading(true)
        // Récupérer les rôles depuis le backend
        const rolesResponse = await userAPI.getRoles()
        // Vérifier si les données sont dans le format attendu
        setRoles(rolesResponse.data?.data || [])

        // Récupérer les départements depuis le backend
        const departmentsResponse = await userAPI.getDepartments()
        // Vérifier si les données sont dans le format attendu
        setDepartments(departmentsResponse.data?.data || [])
      } catch (error) {
        toast.error("Erreur lors de la récupération des données")
      } finally {
        setIsLoading(false)
      }
    }

    fetchRolesAndDepartments()
  }, [])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (type === "checkbox") {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const validateForm = () => {
    if (!formData.firstName.trim()) {
      toast.error("Le prénom est requis")
      return false
    }

    if (!formData.lastName.trim()) {
      toast.error("Le nom est requis")
      return false
    }

    if (!formData.email.trim()) {
      toast.error("L'email est requis")
      return false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      toast.error("L'email n'est pas valide")
      return false
    }

    // Ne valider les mots de passe que si hidePasswordFields est false
    if (!hidePasswordFields) {
      if (!isEdit) {
        if (!formData.password) {
          toast.error("Le mot de passe est requis")
          return false
        } else if (formData.password.length < 6) {
          toast.error("Le mot de passe doit contenir au moins 6 caractères")
          return false
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error("Les mots de passe ne correspondent pas")
          return false
        }
      } else if (formData.password && formData.password !== "********") {
        // Si c'est une modification et que le mot de passe a été changé
        if (formData.password.length < 6) {
          toast.error("Le mot de passe doit contenir au moins 6 caractères")
          return false
        }

        if (formData.password !== formData.confirmPassword) {
          toast.error("Les mots de passe ne correspondent pas")
          return false
        }
      }
    }
    
    return true
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      // Préparer les données à soumettre
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        department: formData.department,
        phone: formData.phone,
      }

      // Ajouter le mot de passe pour les nouveaux utilisateurs ou si modifié
      // Ne pas inclure le mot de passe si hidePasswordFields est true
      if (!hidePasswordFields && (!isEdit || (isEdit && formData.password && formData.password !== "********"))) {
        userData.password = formData.password
      }

      // Appeler la fonction de callback
      if (onSubmit) {
        onSubmit(userData)
      }


      // Fermer le formulaire
      if (onClose) {
        onClose()
      }
    }
  }

  return (
    <div className="user-form-container">
      {isLoading ? (
        <div className="loading-spinner">Chargement...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="user-form-content">
            <div className="user-form-column">

              <div className="user-form-row">
                <div className="user-form-group">
                  <label htmlFor="firstName">Prénom*</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Prénom"
                  />
                </div>

              <div className="user-form-group">
                  <label htmlFor="lastName">Nom*</label>
                <input
                  type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                  onChange={handleChange}
                    placeholder="Nom"
                />
                </div>
              </div>

              <div className="user-form-group">
                <label htmlFor="email">Email*</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@exemple.com"
                />
              </div>

              <div className="user-form-row">
                <div className="user-form-group">
                  <label htmlFor="role">Rôle*</label>
                  <select id="role" name="role" value={formData.role} onChange={handleChange}>
                    <option value="">Sélectionner un rôle</option>
                    {Array.isArray(roles) && roles.map((role) => (
                      <option key={`role-${role}`} value={role}>
                        {role === "admin" ? "Admin" : 
                         role === "team_leader" ? "Team Leader" : 
                         role === "technicien" ? "Technicien" : 
                         role === "opérateur" ? "Opérateur" : 
                         role}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="user-form-group">
                  <label htmlFor="department">Département</label>
                  <select id="department" name="department" value={formData.department} onChange={handleChange}>
                    <option value="">Sélectionner un département</option>
                    {Array.isArray(departments) && departments.map((dept) => (
                      <option key={`dept-${dept}`} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="user-form-group">
                <label htmlFor="phone">Téléphone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone || ""}
                  onChange={handleChange}
                  placeholder="+33 6 12 34 56 78"
                />
              </div>

              {!hidePasswordFields && (
                <>
                  <div className="user-form-group">
                    <label htmlFor="password">{isEdit ? "Nouveau mot de passe" : "Mot de passe*"}</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder={isEdit ? "Laisser vide pour ne pas changer" : "Mot de passe"}
                    />
                  </div>

                  <div className="user-form-group">
                    <label htmlFor="confirmPassword">Confirmer le mot de passe*</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirmer le mot de passe"
                    />
                  </div>
                </>
              )}

            </div>
          </div>

          <div className="user-form-actions">
            <button type="button" className="user-form-cancel-btn" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="user-form-submit-btn">
              {isEdit ? "Enregistrer les modifications" : "Ajouter l'utilisateur"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default AddUserForm

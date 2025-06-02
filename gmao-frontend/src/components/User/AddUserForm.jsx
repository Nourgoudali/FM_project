"use client"

import { useState, useEffect } from "react"
import "./AddUserForm.css"
import { userAPI } from "../../services/api"
import toast from "react-hot-toast"

function AddUserForm({ user, onClose, onSubmit, isEdit }) {
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

  const [errors, setErrors] = useState({})
  const [roles, setRoles] = useState([])
  const [departments, setDepartments] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchRolesAndDepartments = async () => {
      try {
        setIsLoading(true)
        // Récupérer les rôles depuis le backend
        const rolesResponse = await userAPI.getRoles()
        setRoles(rolesResponse.data)

        // Récupérer les départements depuis le backend
        const departmentsResponse = await userAPI.getDepartments()
        setDepartments(departmentsResponse.data)
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
    const formErrors = {}
    let isValid = true

    if (!formData.firstName.trim()) {
      formErrors.firstName = "Le prénom est requis"
      isValid = false
    }

    if (!formData.lastName.trim()) {
      formErrors.lastName = "Le nom est requis"
      isValid = false
    }

    if (!formData.email.trim()) {
      formErrors.email = "L'email est requis"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      formErrors.email = "L'email n'est pas valide"
      isValid = false
    }

    if (!isEdit) {
    if (!formData.password) {
      formErrors.password = "Le mot de passe est requis"
      isValid = false
    } else if (formData.password.length < 6) {
      formErrors.password = "Le mot de passe doit contenir au moins 6 caractères"
      isValid = false
    }

    if (formData.password !== formData.confirmPassword) {
      formErrors.confirmPassword = "Les mots de passe ne correspondent pas"
      isValid = false
      }
    } else if (formData.password && formData.password !== "********") {
      // Si c'est une modification et que le mot de passe a été changé
      if (formData.password.length < 6) {
        formErrors.password = "Le mot de passe doit contenir au moins 6 caractères"
        isValid = false
      }

      if (formData.password !== formData.confirmPassword) {
        formErrors.confirmPassword = "Les mots de passe ne correspondent pas"
        isValid = false
      }
    }

    setErrors(formErrors)
    return isValid
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
        status: formData.status || "Actif"
      }

      // Ajouter le mot de passe pour les nouveaux utilisateurs ou si modifié
      if (!isEdit || (isEdit && formData.password && formData.password !== "********")) {
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
                  {errors.firstName && <span className="user-form-error-message">{errors.firstName}</span>}
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
                  {errors.lastName && <span className="user-form-error-message">{errors.lastName}</span>}
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
                {errors.email && <span className="user-form-error-message">{errors.email}</span>}
              </div>

              <div className="user-form-row">
                <div className="user-form-group">
                  <label htmlFor="role">Rôle*</label>
                  <select id="role" name="role" value={formData.role} onChange={handleChange}>
                    <option value="">Sélectionner un rôle</option>
                    {roles.map((role) => (
                      <option key={`role-${role._id || role.id || role.name.toLowerCase().replace(/\s+/g, '-')}`} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="user-form-group">
                  <label htmlFor="department">Département</label>
                  <select id="department" name="department" value={formData.department} onChange={handleChange}>
                    <option value="">Sélectionner un département</option>
                    {departments.map((dept) => (
                      <option key={`dept-${dept._id || dept.id || dept.name.toLowerCase().replace(/\s+/g, '-')}`} value={dept.id}>
                        {dept.name}
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

              <div className="user-form-group">
                <label htmlFor="status">Statut</label>
                <select id="status" name="status" value={formData.status || "Actif"} onChange={handleChange}>
                  <option value="Actif">Actif</option>
                  <option value="Inactif">Inactif</option>
                </select>
              </div>

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
                {errors.password && <span className="user-form-error-message">{errors.password}</span>}
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
                {errors.confirmPassword && (
                  <span className="user-form-error-message">{errors.confirmPassword}</span>
                )}
              </div>

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

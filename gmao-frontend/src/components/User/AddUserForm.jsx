"use client"

import { useState } from "react"
import "./AddUserForm.css"

function AddUserForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "Technicien",
    department: "",
    phone: "",
    password: "",
    confirmPassword: "",
    isActive: true,
    permissions: {
      dashboard: true,
      equipments: true,
      interventions: true,
      stock: false,
      users: false,
      settings: false,
    },
    profileImage: null,
  })

  const [errors, setErrors] = useState({})

  const roles = [
    { id: "admin", name: "Administrateur" },
    { id: "manager", name: "Gestionnaire" },
    { id: "technician", name: "Technicien" },
    { id: "storekeeper", name: "Magasinier" },
    { id: "user", name: "Utilisateur" },
  ]

  const departments = ["Maintenance", "Production", "Logistique", "Qualité", "Administration", "Informatique"]

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name.startsWith("permission-")) {
      const permission = name.replace("permission-", "")
      setFormData((prev) => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permission]: checked,
        },
      }))
    } else if (type === "checkbox") {
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

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        profileImage: file,
      }))
    }
  }

  const validateForm = () => {
    const formErrors = {}
    let isValid = true

    if (!formData.name.trim()) {
      formErrors.name = "Le nom est requis"
      isValid = false
    }

    if (!formData.email.trim()) {
      formErrors.email = "L'email est requis"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      formErrors.email = "L'email n'est pas valide"
      isValid = false
    }

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

    setErrors(formErrors)
    return isValid
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      // Dans un environnement réel, envoyer les données à l'API
      console.log("Données de l'utilisateur:", formData)

      // Appeler la fonction de callback
      if (onSubmit) {
        onSubmit(formData)
      }

      // Fermer le formulaire
      if (onClose) {
        onClose()
      }
    }
  }

  return (
    <div className="add-user-form">
      <div className="form-header">
        <h2>Nouvel utilisateur</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-content">
          <div className="form-column">
            <h3>Informations personnelles</h3>

            <div className="form-group">
              <label htmlFor="name">Nom complet*</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Prénom Nom"
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email*</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@exemple.com"
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="role">Rôle*</label>
                <select id="role" name="role" value={formData.role} onChange={handleChange}>
                  {roles.map((role) => (
                    <option key={role.id} value={role.name}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="department">Département</label>
                <select id="department" name="department" value={formData.department} onChange={handleChange}>
                  <option value="">Sélectionner un département</option>
                  {departments.map((dept, index) => (
                    <option key={index} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Téléphone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            <div className="form-group">
              <label htmlFor="profileImage">Photo de profil</label>
              <input type="file" id="profileImage" accept="image/*" onChange={handleImageChange} />
              {formData.profileImage && (
                <div className="image-preview">
                  <img src={URL.createObjectURL(formData.profileImage) || "/placeholder.svg"} alt="Aperçu du profil" />
                </div>
              )}
            </div>
          </div>

          <div className="form-column">
            <h3>Compte et permissions</h3>

            <div className="form-group">
              <label htmlFor="password">Mot de passe*</label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} />
              {errors.password && <span className="error-message">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe*</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
              />
              {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
            </div>

            <div className="form-group checkbox-group">
              <label className="checkbox-container">
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                <span className="checkbox-label">Compte actif</span>
              </label>
            </div>

            <div className="form-group">
              <label>Permissions</label>
              <div className="permissions-grid">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="permission-dashboard"
                    checked={formData.permissions.dashboard}
                    onChange={handleChange}
                  />
                  <span className="checkbox-label">Tableau de bord</span>
                </label>

                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="permission-equipments"
                    checked={formData.permissions.equipments}
                    onChange={handleChange}
                  />
                  <span className="checkbox-label">Équipements</span>
                </label>

                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="permission-interventions"
                    checked={formData.permissions.interventions}
                    onChange={handleChange}
                  />
                  <span className="checkbox-label">Interventions</span>
                </label>

                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="permission-stock"
                    checked={formData.permissions.stock}
                    onChange={handleChange}
                  />
                  <span className="checkbox-label">Stock</span>
                </label>

                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="permission-users"
                    checked={formData.permissions.users}
                    onChange={handleChange}
                  />
                  <span className="checkbox-label">Utilisateurs</span>
                </label>

                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    name="permission-settings"
                    checked={formData.permissions.settings}
                    onChange={handleChange}
                  />
                  <span className="checkbox-label">Paramètres</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="submit-btn">
            Créer l'utilisateur
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddUserForm

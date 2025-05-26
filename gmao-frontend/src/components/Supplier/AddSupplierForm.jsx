"use client"

import { useState, useEffect } from "react"
import "./AddSupplierForm.css"

function AddSupplierForm({ supplier, onClose, onSubmit, isEdit }) {
  const [formData, setFormData] = useState(
    supplier
      ? { ...supplier }
      : {
          nomEntreprise: "",
          nom: "",
          prenom: "",
          email: "",
          telephone: "",
          adresse: "",
        }
  )

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (supplier && isEdit) {
      setFormData({
        nomEntreprise: supplier.nomEntreprise || "",
        nom: supplier.nom || "",
        prenom: supplier.prenom || "",
        email: supplier.email || "",
        telephone: supplier.telephone || "",
        adresse: supplier.adresse || "",
      })
    }
  }, [supplier, isEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const validateForm = () => {
    const formErrors = {}
    let isValid = true

    if (!formData.nomEntreprise.trim()) {
      formErrors.nomEntreprise = "Le nom d'entreprise est requis"
      isValid = false
    }

    if (!formData.nom.trim()) {
      formErrors.nom = "Le nom est requis"
      isValid = false
    }

    if (!formData.prenom.trim()) {
      formErrors.prenom = "Le prénom est requis"
      isValid = false
    }

    if (!formData.email.trim()) {
      formErrors.email = "L'email est requis"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      formErrors.email = "L'email n'est pas valide"
      isValid = false
    }

    if (!formData.telephone.trim()) {
      formErrors.telephone = "Le numéro de téléphone est requis"
      isValid = false
    }

    if (!formData.adresse.trim()) {
      formErrors.adresse = "L'adresse est requise"
      isValid = false
    }

    setErrors(formErrors)
    return isValid
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      setIsLoading(true)
      
      // Préparer les données à soumettre
      const supplierData = {
        nomEntreprise: formData.nomEntreprise,
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        telephone: formData.telephone,
        adresse: formData.adresse
      }

      // Appeler la fonction de callback
      if (onSubmit) {
        onSubmit(supplierData)
      }

      // Fermer le formulaire
      if (onClose) {
        onClose()
      }
      
      setIsLoading(false)
    }
  }

  return (
    <div className="supplier-form-container">
      {isLoading ? (
        <div className="loading-spinner">Chargement...</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="supplier-form-content">
            <div className="supplier-form-column">
              <div className="supplier-form-group">
                <label htmlFor="nomEntreprise">Nom d'entreprise*</label>
                <input
                  type="text"
                  id="nomEntreprise"
                  name="nomEntreprise"
                  value={formData.nomEntreprise}
                  onChange={handleChange}
                  placeholder="Nom de l'entreprise"
                />
                {errors.nomEntreprise && <span className="supplier-form-error-message">{errors.nomEntreprise}</span>}
              </div>

              <div className="supplier-form-row">
                <div className="supplier-form-group">
                  <label htmlFor="nom">Nom*</label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    placeholder="Nom"
                  />
                  {errors.nom && <span className="supplier-form-error-message">{errors.nom}</span>}
                </div>

                <div className="supplier-form-group">
                  <label htmlFor="prenom">Prénom*</label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    placeholder="Prénom"
                  />
                  {errors.prenom && <span className="supplier-form-error-message">{errors.prenom}</span>}
                </div>
              </div>

              <div className="supplier-form-group">
                <label htmlFor="email">Email*</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@exemple.com"
                />
                {errors.email && <span className="supplier-form-error-message">{errors.email}</span>}
              </div>

              <div className="supplier-form-group">
                <label htmlFor="telephone">Téléphone*</label>
                <input
                  type="tel"
                  id="telephone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                  placeholder="+212 6 12 34 56 78"
                />
                {errors.telephone && <span className="supplier-form-error-message">{errors.telephone}</span>}
              </div>

              <div className="supplier-form-group">
                <label htmlFor="adresse">Adresse*</label>
                <textarea
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  placeholder="Adresse complète"
                  rows="3"
                />
                {errors.adresse && <span className="supplier-form-error-message">{errors.adresse}</span>}
              </div>
            </div>
          </div>

          <div className="supplier-form-actions">
            <button type="button" className="supplier-form-cancel-btn" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="supplier-form-submit-btn">
              {isEdit ? "Enregistrer les modifications" : "Ajouter le fournisseur"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default AddSupplierForm

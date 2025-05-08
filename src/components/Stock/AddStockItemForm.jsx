"use client"

import { useState } from "react"
import "./AddStockItemForm.css"

function AddStockItemForm({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    reference: "",
    name: "",
    category: "",
    manufacturer: "",
    model: "",
    description: "",
    location: "",
    quantity: 1,
    minQuantity: 0,
    unitPrice: "",
    supplier: "",
    orderReference: "",
    receivedDate: "",
    expiryDate: "",
    image: null,
    attachments: [],
    notes: "",
  })

  const [errors, setErrors] = useState({})

  const categories = [
    "Pièces mécaniques",
    "Pièces électriques",
    "Pièces hydrauliques",
    "Pièces pneumatiques",
    "Outils",
    "Consommables",
    "Équipements de sécurité",
    "Autres",
  ]

  const locations = [
    "Magasin principal",
    "Atelier A",
    "Atelier B",
    "Entrepôt C",
    "Armoire 1",
    "Armoire 2",
    "Étagère E1",
    "Étagère E2",
  ]

  const suppliers = ["Fournisseur A", "Fournisseur B", "Fournisseur C", "Fournisseur D"]

  const handleChange = (e) => {
    const { name, value, type } = e.target

    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : Number(value),
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
        image: file,
      }))
    }
  }

  const handleAttachmentsChange = (e) => {
    const files = Array.from(e.target.files)
    setFormData((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files],
    }))
  }

  const removeAttachment = (index) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }))
  }

  const validateForm = () => {
    const formErrors = {}
    let isValid = true

    if (!formData.reference.trim()) {
      formErrors.reference = "La référence est requise"
      isValid = false
    }

    if (!formData.name.trim()) {
      formErrors.name = "Le nom est requis"
      isValid = false
    }

    if (!formData.category) {
      formErrors.category = "La catégorie est requise"
      isValid = false
    }

    if (formData.quantity < 0) {
      formErrors.quantity = "La quantité ne peut pas être négative"
      isValid = false
    }

    if (formData.unitPrice && formData.unitPrice < 0) {
      formErrors.unitPrice = "Le prix unitaire ne peut pas être négatif"
      isValid = false
    }

    setErrors(formErrors)
    return isValid
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (validateForm()) {
      // Dans un environnement réel, envoyer les données à l'API
      console.log("Données de la pièce:", formData)

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
    <div className="add-stock-item-form">
      <div className="form-header">
        <h2>Nouvelle pièce de stock</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-content">
          <div className="form-column">
            <h3>Informations générales</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="reference">Référence*</label>
                <input
                  type="text"
                  id="reference"
                  name="reference"
                  value={formData.reference}
                  onChange={handleChange}
                  placeholder="Ex: P001"
                />
                {errors.reference && <span className="error-message">{errors.reference}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="name">Nom*</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Ex: Filtre hydraulique"
                />
                {errors.name && <span className="error-message">{errors.name}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category">Catégorie*</label>
              <select id="category" name="category" value={formData.category} onChange={handleChange}>
                <option value="">Sélectionner une catégorie</option>
                {categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="manufacturer">Fabricant</label>
                <input
                  type="text"
                  id="manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="model">Modèle</label>
                <input type="text" id="model" name="model" value={formData.model} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Description détaillée de la pièce..."
              ></textarea>
            </div>

            <div className="form-group">
              <label htmlFor="location">Emplacement</label>
              <select id="location" name="location" value={formData.location} onChange={handleChange}>
                <option value="">Sélectionner un emplacement</option>
                {locations.map((location, index) => (
                  <option key={index} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-column">
            <h3>Stock et approvisionnement</h3>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="quantity">Quantité*</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                />
                {errors.quantity && <span className="error-message">{errors.quantity}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="minQuantity">Quantité minimale</label>
                <input
                  type="number"
                  id="minQuantity"
                  name="minQuantity"
                  value={formData.minQuantity}
                  onChange={handleChange}
                  min="0"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="unitPrice">Prix unitaire (€)</label>
              <input
                type="number"
                id="unitPrice"
                name="unitPrice"
                value={formData.unitPrice}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
              {errors.unitPrice && <span className="error-message">{errors.unitPrice}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="supplier">Fournisseur</label>
              <select id="supplier" name="supplier" value={formData.supplier} onChange={handleChange}>
                <option value="">Sélectionner un fournisseur</option>
                {suppliers.map((supplier, index) => (
                  <option key={index} value={supplier}>
                    {supplier}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="orderReference">Référence de commande</label>
              <input
                type="text"
                id="orderReference"
                name="orderReference"
                value={formData.orderReference}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="receivedDate">Date de réception</label>
                <input
                  type="date"
                  id="receivedDate"
                  name="receivedDate"
                  value={formData.receivedDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="expiryDate">Date d'expiration</label>
                <input
                  type="date"
                  id="expiryDate"
                  name="expiryDate"
                  value={formData.expiryDate}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Médias et documents</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="image">Image de la pièce</label>
              <input type="file" id="image" accept="image/*" onChange={handleImageChange} />
              {formData.image && (
                <div className="image-preview">
                  <img src={URL.createObjectURL(formData.image) || "/placeholder.svg"} alt="Aperçu de la pièce" />
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="attachments">Documents annexes</label>
              <input type="file" id="attachments" multiple onChange={handleAttachmentsChange} />
              {formData.attachments.length > 0 && (
                <div className="attachments-list">
                  <h4>Fichiers ajoutés</h4>
                  <ul>
                    {formData.attachments.map((file, index) => (
                      <li key={index}>
                        {file.name}
                        <button type="button" className="remove-file-btn" onClick={() => removeAttachment(index)}>
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="3"
              placeholder="Notes ou commentaires additionnels..."
            ></textarea>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={onClose}>
            Annuler
          </button>
          <button type="submit" className="submit-btn">
            Ajouter la pièce
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddStockItemForm

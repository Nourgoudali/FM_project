"use client"

import { useState, useEffect } from "react"
import "./AddStockItemForm.css"

function AddStockItemForm({ item = null, onSubmit, onCancel, isEdit = false }) {
  const [formData, setFormData] = useState({
    name: "",
    reference: "",
    category: "",
    quantity: 0,
    minQuantity: 0,
    location: "",
    unitPrice: 0,
    supplier: "",
    lastRestockDate: "",
    status: "En stock",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Pré-remplir le formulaire si on est en mode édition
  useEffect(() => {
    if (item && isEdit) {
      setFormData({
        name: item.name || "",
        reference: item.reference || "",
        category: item.category || "",
        quantity: item.quantity || 0,
        minQuantity: item.minQuantity || 0,
        location: item.location || "",
        unitPrice: item.unitPrice || 0,
        supplier: item.supplier || "",
        lastRestockDate: item.lastRestockDate || "",
        status: item.status || "En stock",
      })
    }
  }, [item, isEdit])

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData({
      ...formData,
      [name]: type === "number" ? Number(value) : value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Préparer l'objet à retourner, avec l'ID si on est en mode édition
      const itemToSubmit = {
        ...(isEdit && item ? { id: item.id } : {}),
        ...formData,
      }
      
      onSubmit(itemToSubmit)
    } catch (err) {
      setError("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="stock-form">
      {error && <div className="form-error">{error}</div>}

      <div className="form-section">
        <h3 className="form-section-title">Informations générales</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="reference">Référence *</label>
            <input
              type="text"
              id="reference"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="name">Nom *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Catégorie *</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez une catégorie</option>
              <option value="Mécanique">Mécanique</option>
              <option value="Électrique">Électrique</option>
              <option value="Fluides">Fluides</option>
              <option value="Transmission">Transmission</option>
              <option value="Filtration">Filtration</option>
              <option value="Autre">Autre</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="supplier">Fournisseur</label>
            <input
              type="text"
              id="supplier"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Information de stock</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="quantity">Quantité *</label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="0"
              required
            />
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

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="location">Emplacement *</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="status">Statut</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="En stock">En stock</option>
              <option value="Stock faible">Stock faible</option>
              <option value="Rupture de stock">Rupture de stock</option>
            </select>
          </div>
        </div>
      </div>

      <div className="form-section">
        <h3 className="form-section-title">Prix et dates</h3>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="unitPrice">Prix unitaire (€) *</label>
            <input
              type="number"
              id="unitPrice"
              name="unitPrice"
              value={formData.unitPrice}
              onChange={handleChange}
              min="0"
              step="0.01"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="lastRestockDate">Dernière date de réapprovisionnement</label>
            <input
              type="date"
              id="lastRestockDate"
              name="lastRestockDate"
              value={formData.lastRestockDate}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Enregistrement..." : isEdit ? "Enregistrer les modifications" : "Ajouter l'article"}
        </button>
      </div>
    </form>
  )
}

export default AddStockItemForm

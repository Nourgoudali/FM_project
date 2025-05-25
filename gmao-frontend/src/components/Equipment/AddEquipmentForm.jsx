"use client"

import { useState, useEffect } from "react"
import "./AddEquipmentForm.css"
import { equipmentAPI } from "../../services/api"

export function AddEquipmentForm({ onClose, onEquipmentAdded, initialData = null, isEdit = false }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || "",
    category: initialData?.category || "",
    location: initialData?.location || "",
    brand: initialData?.brand || "",
    model: initialData?.model || "",
    serialNumber: initialData?.serialNumber || "",
    purchaseDate: initialData?.purchaseDate || "",
    warrantyEnd: initialData?.warrantyEnd || "",
    status: initialData?.status || "En service",
    description: initialData?.description || "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(initialData?.image || null)

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        category: initialData.category || "",
        location: initialData.location || "",
        brand: initialData.brand || "",
        model: initialData.model || "",
        serialNumber: initialData.serialNumber || "",
        purchaseDate: initialData.purchaseDate || "",
        warrantyEnd: initialData.warrantyEnd || "",
        status: initialData.status || "En service",
        description: initialData.description || "",
      })
      setImagePreview(initialData.image || null)
    }
  }, [initialData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Préparer les données du formulaire
      // Map status from French to English
      const statusMap = {
        'En service': 'operational',
        'En maintenance': 'maintenance',
        'Hors service': 'out_of_service'
      };

      // Prepare data for submission
      const data = {
        name: formData.name,
        category: formData.category,
        location: formData.location,
        status: statusMap[formData.status] || 'operational',
        brand: formData.brand,
        model: formData.model,
        serialNumber: formData.serialNumber,
        purchaseDate: formData.purchaseDate,
        warrantyEnd: formData.warrantyEnd,
        description: formData.description,
        image: imageFile ? imageFile : undefined
      }

      try {
        // Envoyer les données à l'API
        let response;
        if (isEdit && initialData) {
          // Pour la mise à jour, on utilise l'ID de l'équipement existant
          response = await equipmentAPI.updateEquipment(initialData.id, data);
        } else {
          // Pour la création, on utilise l'endpoint de création
          response = await equipmentAPI.createEquipment(data);
        }

        const equipmentToReturn = {
          ...(isEdit && initialData ? { id: initialData.id } : { id: response.data._id }),
          ...formData,
          image: response.data.image || "/placeholder.svg?height=100&width=100",
          availability: initialData?.availability || 100,
        }

        onEquipmentAdded(equipmentToReturn)
        onClose()
      } catch (err) {
        console.error("Erreur lors de l'enregistrement de l'équipement:", err)
        setError("Une erreur est survenue lors de l'enregistrement de l'équipement. Veuillez réessayer.")
      }
    } catch (err) {
      console.error("Erreur lors de l'enregistrement de l'équipement:", err)
      setError("Une erreur est survenue lors de l'enregistrement de l'équipement. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="aef-equipment-form">
      {error && <div className="aef-form-error">{error}</div>}

      <div className="aef-form-section">
        <h3 className="aef-form-section-title">Informations générales</h3>

        <div className="aef-form-row">
          {/* Le champ de référence a été supprimé car il est généré automatiquement */}

          <div className="aef-form-group">
            <label htmlFor="name" className="aef-form-label">
              Nom *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="aef-form-control"
              required
            />
          </div>
        </div>

        <div className="aef-form-row">
          <div className="aef-form-group">
            <label htmlFor="category" className="aef-form-label">
              Catégorie *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="aef-form-control"
              required
            >
              <option value="">Sélectionner une catégorie</option>
              <option value="Pompe">Pompe</option>
              <option value="Compresseur">Compresseur</option>
              <option value="Moteur">Moteur</option>
              <option value="Convoyeur">Convoyeur</option>
              <option value="Chaudière">Chaudière</option>
              <option value="Robot">Robot</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div className="aef-form-group">
            <label htmlFor="location" className="aef-form-label">
              Localisation *
            </label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="aef-form-control"
              required
            >
              <option value="">Sélectionner une localisation</option>
              <option value="Atelier A">Atelier A</option>
              <option value="Atelier B">Atelier B</option>
              <option value="Atelier C">Atelier C</option>
              <option value="Atelier D">Atelier D</option>
              <option value="Entrepôt">Entrepôt</option>
            </select>
          </div>
        </div>
      </div>

      <div className="aef-form-section">
        <h3 className="aef-form-section-title">Caractéristiques techniques</h3>

        <div className="aef-form-row">
          <div className="aef-form-group">
            <label htmlFor="brand" className="aef-form-label">
              Marque
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="aef-form-control"
            />
          </div>

          <div className="aef-form-group">
            <label htmlFor="model" className="aef-form-label">
              Modèle
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="aef-form-control"
            />
          </div>
        </div>

        <div className="aef-form-row">
          <div className="aef-form-group">
            <label htmlFor="serialNumber" className="aef-form-label">
              Numéro de série
            </label>
            <input
              type="text"
              id="serialNumber"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              className="aef-form-control"
            />
          </div>

          <div className="aef-form-group">
            <label htmlFor="status" className="aef-form-label">
              État *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="aef-form-control"
              required
            >
              <option value="En service">En service</option>
              <option value="En maintenance">En maintenance</option>
              <option value="Hors service">Hors service</option>
              <option value="En stock">En stock</option>
            </select>
          </div>
        </div>
      </div>

      <div className="aef-form-section">
        <h3 className="aef-form-section-title">Informations complémentaires</h3>

        <div className="aef-form-row">
          <div className="aef-form-group">
            <label htmlFor="purchaseDate" className="aef-form-label">
              Date d'achat
            </label>
            <input
              type="date"
              id="purchaseDate"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="aef-form-control"
            />
          </div>

          <div className="aef-form-group">
            <label htmlFor="warrantyEnd" className="aef-form-label">
              Fin de garantie
            </label>
            <input
              type="date"
              id="warrantyEnd"
              name="warrantyEnd"
              value={formData.warrantyEnd}
              onChange={handleChange}
              className="aef-form-control"
            />
          </div>
        </div>

        <div className="aef-form-group">
          <label htmlFor="description" className="aef-form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="aef-form-control"
            rows="3"
          ></textarea>
        </div>

        <div className="aef-form-group">
          <label htmlFor="image" className="aef-form-label">
            Image de l'équipement
          </label>
          <div className="aef-image-upload-container">
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              className="aef-image-input"
            />
            <div className="aef-image-preview-container">
              {imagePreview ? (
                <img src={imagePreview || "/placeholder.svg"} alt="Aperçu" className="aef-image-preview" />
              ) : (
                <div className="aef-image-placeholder">
                  <span className="aef-image-placeholder-text">Ajouter une image</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="aef-form-actions">
        <button type="button" className="aef-btn aef-btn-outline" onClick={onClose}>
          Annuler
        </button>
        <button type="submit" className="aef-btn aef-btn-primary" disabled={loading}>
          {loading ? "Enregistrement..." : "Ajouter l'équipement"}
        </button>
      </div>
    </form>
  )
}

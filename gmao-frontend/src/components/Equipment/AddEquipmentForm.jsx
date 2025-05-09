"use client"

import { useState } from "react"
import "./AddEquipmentForm.css"

function AddEquipmentForm({ onClose, onEquipmentAdded }) {
  const [formData, setFormData] = useState({
    reference: "",
    name: "",
    category: "",
    location: "",
    brand: "",
    model: "",
    serialNumber: "",
    purchaseDate: "",
    warrantyEnd: "",
    status: "En service",
    description: "",
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

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
      // Créer un FormData pour envoyer l'image
      const data = new FormData()

      // Ajouter toutes les données du formulaire
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key])
      })

      // Ajouter l'image si elle existe
      if (imageFile) {
        data.append("image", imageFile)
      }

      // Dans un environnement réel, vous appelleriez l'API
      // const response = await equipmentService.create(data)

      // Pour la démo, simulons une réponse réussie
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Notifier le parent que l'équipement a été ajouté
      onEquipmentAdded({
        id: Date.now(), // Simuler un ID
        ...formData,
        image: imagePreview || "/placeholder.svg?height=100&width=100",
        availability: 100, // Valeur par défaut pour un nouvel équipement
      })

      onClose()
    } catch (err) {
      console.error("Erreur lors de l'ajout de l'équipement:", err)
      setError("Une erreur est survenue lors de l'ajout de l'équipement. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="equipment-form">
      {error && <div className="form-error">{error}</div>}

      <div className="form-section">
        <h3 className="form-section-title">Informations générales</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="reference" className="form-label">
              Référence *
            </label>
            <input
              type="text"
              id="reference"
              name="reference"
              value={formData.reference}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Nom *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="form-control"
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Catégorie *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="form-control"
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

          <div className="form-group">
            <label htmlFor="location" className="form-label">
              Localisation *
            </label>
            <select
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="form-control"
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

      <div className="form-section">
        <h3 className="form-section-title">Caractéristiques techniques</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="brand" className="form-label">
              Marque
            </label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="model" className="form-label">
              Modèle
            </label>
            <input
              type="text"
              id="model"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="serialNumber" className="form-label">
              Numéro de série
            </label>
            <input
              type="text"
              id="serialNumber"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="status" className="form-label">
              État *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="form-control"
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

      <div className="form-section">
        <h3 className="form-section-title">Informations complémentaires</h3>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="purchaseDate" className="form-label">
              Date d'achat
            </label>
            <input
              type="date"
              id="purchaseDate"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              className="form-control"
            />
          </div>

          <div className="form-group">
            <label htmlFor="warrantyEnd" className="form-label">
              Fin de garantie
            </label>
            <input
              type="date"
              id="warrantyEnd"
              name="warrantyEnd"
              value={formData.warrantyEnd}
              onChange={handleChange}
              className="form-control"
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="form-control"
            rows="3"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="image" className="form-label">
            Image de l'équipement
          </label>
          <div className="image-upload-container">
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
              className="image-input"
            />
            <div className="image-preview-container">
              {imagePreview ? (
                <img src={imagePreview || "/placeholder.svg"} alt="Aperçu" className="image-preview" />
              ) : (
                <div className="image-placeholder">
                  <span className="image-placeholder-text">Ajouter une image</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onClose}>
          Annuler
        </button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? "Enregistrement..." : "Ajouter l'équipement"}
        </button>
      </div>
    </form>
  )
}

export default AddEquipmentForm

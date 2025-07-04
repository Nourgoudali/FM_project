import { useState, useEffect } from "react"
import "./AddEquipmentForm.css"
import { equipmentAPI } from "../../services/api"
import toast from "react-hot-toast"

const equipmentCategories = [
  'Systèmes d\'air comprimé',
  'Systèmes de pompages',
  'Installations CVC',
  'Systèmes solaire thermique',
  'Équipements énergétiques',
  'Équipements de production'
];

const equipmentLocations = [
  'ZONE TGBT',
  'ZONE GROUPE ELECTROGENE',
  'LOCAL ONDULEURS',
  'LOCALE COMPRESSEURS',
  'LOCAL SPRINKLER',
  'RESTAURANT',
  'DIRECTION',
  'ATELIER 1',
  'ATELIER 2'
];



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
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(initialData?.image && typeof initialData.image === 'string' ? 
    `http://localhost:5000${initialData.image}` : null)

  // Fonction pour formater les dates au format YYYY-MM-DD pour les champs input type="date"
  const formatDateForInput = (dateString) => {
    if (!dateString) return ""
    
    // Si la date est déjà au format YYYY-MM-DD, on la retourne telle quelle
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString
    
    // Sinon, on essaie de la convertir
    try {
      const date = new Date(dateString)
      if (isNaN(date.getTime())) return "" // Date invalide
      
      // Format YYYY-MM-DD
      return date.toISOString().split('T')[0]
    } catch (error) {
      console.error("Erreur lors du formatage de la date:", error)
      return ""
    }
  }

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        category: initialData?.category || "",
        location: initialData?.location || "",

        brand: initialData.brand || "",
        model: initialData.model || "",
        serialNumber: initialData.serialNumber || "",
        purchaseDate: formatDateForInput(initialData.purchaseDate),
        warrantyEnd: formatDateForInput(initialData.warrantyEnd),
        status: initialData.status || "En service",
        description: initialData.description || "",
      })
      setImagePreview(initialData.image && typeof initialData.image === 'string' ? 
        `http://localhost:5000${initialData.image}` : null)
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
          toast.success("L'équipement a été mis à jour avec succès");
        } else {
          // Pour la création, on utilise l'endpoint de création
          response = await equipmentAPI.createEquipment(data);
          toast.success("L'équipement a été créé avec succès");
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
        toast.error("Une erreur est survenue lors de l'enregistrement de l'équipement. Veuillez réessayer.")
      }
    } catch (err) {
      toast.error("Une erreur est survenue lors de l'enregistrement de l'équipement. Veuillez réessayer.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="aef-equipment-form">
      {/* Les messages d'erreur sont maintenant affichés avec des toasts */}

      <div className="aef-form-section">
        <h3 className="aef-form-section-title">Informations générales</h3>

        <div className="aef-form-row">
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

        <div className="aef-form-row">
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
              {equipmentLocations.map(location => (
                <option key={location} value={location}>{location}</option>
              ))}
            </select>
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
              {equipmentCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

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
        </div>
      </div>

      <div className="aef-form-section">
        <h3 className="aef-form-section-title">Caractéristiques techniques</h3>

        <div className="aef-form-row">
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
        </div>

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

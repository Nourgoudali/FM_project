"use client"

import { useState, useEffect } from "react"
import "./AddStockItemForm.css"
import { equipmentAPI } from "../../services/api"

function AddStockItemForm({ item = null, onSubmit, onCancel, isEdit = false }) {
  // Initialize form data with empty values
  const emptyFormData = {
    name: "",
    equipment: "",
    quantity: 0,
    minThreshold: 0,
    supplier: "",
    leadTime: 0,
  };

  // Ensure form data is always initialized with empty values
  useEffect(() => {
    if (!isEdit) {
      setFormData(emptyFormData);
    }
  }, [isEdit])

  // Initialize form data based on mode
  const initialData = item && isEdit 
    ? {
        name: item.name || "",
        equipment: item.equipment ? item.equipment._id : "",
        quantity: item.quantity || 0,
        minThreshold: item.minThreshold || 0,
        supplier: item.supplier || "",
        leadTime: item.leadTime || 0,
      }
    : emptyFormData

  const [formData, setFormData] = useState(initialData)

  // Update form data when item changes
  useEffect(() => {
    if (item && isEdit) {
      const newData = {
        name: item.name || "",
        equipment: item.equipment ? item.equipment._id : "",
        quantity: item.quantity || 0,
        minThreshold: item.minThreshold || 0,
        supplier: item.supplier || "",
        leadTime: item.leadTime || 0,
      }
      setFormData(newData)
    }
  }, [item, isEdit])
  const [equipmentList, setEquipmentList] = useState([])

  // Fetch equipment list for dropdown
  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const response = await equipmentAPI.getAllEquipments();
        if (response.data) {
          setEquipmentList(response.data);
        }
      } catch (error) {
        console.error("Error fetching equipment list:", error);
      }
    };
    fetchEquipment();
  }, []);

  const [apiLoading, setApiLoading] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Pré-remplir le formulaire si on est en mode édition
  useEffect(() => {
    if (item && isEdit) {
      setFormData({
        name: item.name || "",
        equipment: item.equipment ? item.equipment._id : "",
        quantity: item.quantity || 0,
        minThreshold: item.minThreshold || 0,
        supplier: item.supplier || "",
        leadTime: item.leadTime || 0,
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
    setApiLoading(true);
    setApiError(null);

    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Préparer l'objet à retourner, avec l'ID si on est en mode édition
      const itemToSubmit = {
        ...(isEdit && item ? { _id: item._id } : {}),
        ...formData,
      }
      
      onSubmit(itemToSubmit)
    } catch (err) {
      setApiError("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.")
    } finally {
      setApiLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="stock-form">
      {apiError && <div className="form-error">{apiError}</div>}

      <div className="form-section">
        <h3 className="form-section-title">Informations générales</h3>
        
        <div className="form-row">
          <div className="form-group full-width">
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
            <label htmlFor="equipment">Équipement *</label>
            <select
              id="equipment"
              name="equipment"
              value={formData.equipment || ''}
              onChange={handleChange}
              required
              disabled={apiLoading}
            >
              <option value="">Sélectionnez un équipement</option>
              {equipmentList.map((equipment) => (
                <option key={equipment._id} value={equipment._id}>
                  {equipment.reference} - {equipment.name}
                </option>
              ))}
            </select>
            {apiError && <div className="form-error">{apiError}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="minThreshold">Seuil minimum *</label>
            <input
              type="number"
              id="minThreshold"
              name="minThreshold"
              value={formData.minThreshold}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="leadTime">Délai de livraison (en jours) *</label>
            <input
              type="number"
              id="leadTime"
              name="leadTime"
              value={formData.leadTime}
              onChange={handleChange}
              required
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
              required
              min="0"
            />
          </div>
        </div>

        <div className="form-row">
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

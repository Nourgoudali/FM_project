import { useState, useEffect } from "react"
import "./AddStockItemForm.css"
import { equipmentAPI, fournisseurAPI, stockAPI } from "../../services/api"
import { toast } from 'react-hot-toast';

function AddStockItemForm({ item = null, onSubmit, onCancel, isEdit = false }) {
  // Les catégories PDR par défaut
  const pdrCategories = ['Fluidique', 'Électrotechnique', 'Maintenance générale'];
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Initialiser les catégories dès le début
  useEffect(() => {
    setLoadingCategories(false);
  }, []);

  const emptyFormData = {
    name: "",
    reference: "", // Ajout du champ reference même s'il sera généré automatiquement côté serveur
    prixUnitaire: "",
    stockActuel: "",
    stockMin: "",
    stockMax: "",
    stockSecurite: "",
    lieuStockage: "", // Champ requis pour le lieu de stockage
    prixEuro: 0, // Ajout du champ pour le prix en euros
    pdrCategory: "" // Champ requis pour la catégorie PDR
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
        reference: item.reference || "", // Ajout du champ reference
        prixUnitaire: item.prixUnitaire || "",
        stockActuel: item.stockActuel || "",
        stockMin: item.stockMin || "",
        stockMax: item.stockMax || "",
        stockSecurite: item.stockSecurite || "",
        fournisseur: item.fournisseur ? item.fournisseur._id : "",
        lieuStockage: item.lieuStockage || "", // Ajout du champ lieuStockage
        prixEuro: item.prixEuro || 0, // Ajout du champ pour le prix en euros
        pdrCategory: item.pdrCategory || ""
      }
    : {
        name: "",
        reference: "", 
        prixUnitaire: "",
        stockActuel: "",
        stockMin: "",
        stockMax: "",
        stockSecurite: "",
        lieuStockage: "", 
        prixEuro: 0,
        pdrCategory: ""
      }

  const [formData, setFormData] = useState(initialData)

  // Update form data when item changes
  useEffect(() => {
    if (item && isEdit) {
      const newData = {
        name: item.name || "",
        prixUnitaire: item.prixUnitaire || "",
        stockActuel: item.stockActuel || "",
        stockMin: item.stockMin || "",
        stockMax: item.stockMax || "",
        stockSecurite: item.stockSecurite || "",
        fournisseur: item.fournisseur ? item.fournisseur._id : "",
        lieuStockage: item.lieuStockage || "", // Ajout du champ lieuStockage
        pdrCategory: item.pdrCategory || ""
      }
      setFormData(newData)
    }
  }, [item, isEdit])

  const [apiLoading, setApiLoading] = useState(false)
  const [loading, setLoading] = useState(false)

  // Pré-remplir le formulaire si on est en mode édition
  useEffect(() => {
    if (item && isEdit) {
      setFormData({
        name: item.name || "",
        reference: item.reference || "", // Ajout du champ reference
        pdrCategory: item.pdrCategory || "",
        prixUnitaire: item.prixUnitaire || "",
        stockActuel: item.stockActuel || "",
        stockMin: item.stockMin || "",
        stockMax: item.stockMax || "",
        stockSecurite: item.stockSecurite || "",
        lieuStockage: item.lieuStockage || "", // Ajout du champ lieuStockage
        prixEuro: item.prixEuro || 0 // Ajout du champ pour le prix en euros
      })
    }
  }, [item, isEdit])

  const handleChange = (e) => {
    const { name, value } = e.target
    
    // Vérifier si le champ est un champ numérique
    const numericFields = ['prixUnitaire', 'stockActuel', 'stockMin', 'stockMax', 'stockSecurite', 'prixEuro']
    
    if (numericFields.includes(name)) {
      // Pour les champs numériques, n'accepter que les chiffres
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value === '' ? 0 : Number(value),
        })
      }
    } else {
      // Pour les autres champs, accepter toutes les valeurs
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setApiLoading(true);
    try {
      // Vérifier si la catégorie PDR est valide
      if (!pdrCategories.includes(formData.pdrCategory)) {
        throw new Error("Catégorie PDR invalide");
      }

      // Préparer les données à envoyer
      const dataToSend = {
        name: formData.name,
        pdrCategory: formData.pdrCategory,
        prixUnitaire: parseFloat(formData.prixUnitaire),
        stockActuel: parseInt(formData.stockActuel),
        stockMin: parseInt(formData.stockMin),
        stockMax: parseInt(formData.stockMax),
        stockSecurite: parseInt(formData.stockSecurite),
        lieuStockage: formData.lieuStockage,
        prixEuro: parseFloat(formData.prixEuro)
      };

      await onSubmit(dataToSend);
      if (!isEdit) {
        setFormData(emptyFormData);
      }
    } catch (err) {
      toast.error(err.message || "Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.")
    } finally {
      setApiLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="stock-form">

      <div className="stock-form__section">        
        <div className="stock-form__row">
          <div className="stock-form__group">
            <label htmlFor="name">Nom du produit *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Nom du produit"
            />
          </div>
          <div className="stock-form__group">
            <label htmlFor="lieuStockage">Lieu de stockage *</label>
            <input
              type="text"
              id="lieuStockage"
              name="lieuStockage"
              value={formData.lieuStockage}
              onChange={handleChange}
              required
              placeholder="Ex: Magasin principal, Étagère A3, etc."
            />
          </div>
        </div>
        <div className="stock-form__row">
          <div className="stock-form__group">
            <label htmlFor="pdrCategory">Catégorie PDR *</label>
            <select
              id="pdrCategory"
              name="pdrCategory"
              value={formData.pdrCategory || ''}
              onChange={handleChange}
              disabled={apiLoading}
              required
            >
              <option value="">Sélectionnez une catégorie PDR</option>
              {pdrCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="stock-form__group">
            <label htmlFor="prixUnitaire">Prix unitaire (DH) *</label>
            <input
              type="text"
              id="prixUnitaire"
              name="prixUnitaire"
              value={formData.prixUnitaire}
              onChange={handleChange}
              pattern="^\d*\.?\d*$"
              title="Veuillez entrer un nombre valide"
              required
              placeholder="0"
            />
          </div>
        </div>
        <div className="stock-form__row">
          <div className="stock-form__group">
            <label htmlFor="stockActuel">Stock actuel *</label>
            <input
              type="text"
              id="stockActuel"
              name="stockActuel"
              value={formData.stockActuel}
              onChange={handleChange}
              pattern="^\d*$"
              title="Veuillez entrer un nombre entier valide"
              required
              placeholder="0"
            />
          </div>
          
          <div className="stock-form__group">
            <label htmlFor="stockMin">Stock minimum *</label>
            <input
              type="text"
              id="stockMin"
              name="stockMin"
              value={formData.stockMin}
              onChange={handleChange}
              pattern="^\d*$"
              title="Veuillez entrer un nombre entier valide"
              required
              placeholder="0"
            />
          </div>
        
        <div className="stock-form__row">
          <div className="stock-form__group">
            <label htmlFor="stockMax">Stock maximum *</label>
            <input
              type="text"
              id="stockMax"
              name="stockMax"
              value={formData.stockMax}
              onChange={handleChange}
              pattern="^\d*$"
              title="Veuillez entrer un nombre entier valide"
              required
              placeholder="0"
            />
          </div>
          <div className="stock-form__group">
            <label htmlFor="stockSecurite">Stock sécuritaire *</label>
            <input
              type="text"
              id="stockSecurite"
              name="stockSecurite"
              value={formData.stockSecurite}
              onChange={handleChange}
              pattern="^\d*$"
              title="Veuillez entrer un nombre entier valide"
              required
              placeholder="0"
            />
          </div>
        </div>
        <div className="stock-form__row">
          <div className="stock-form__group">
            <label htmlFor="lieuStockage">Lieu de stockage *</label>
            <input
              type="text"
              id="lieuStockage"
              name="lieuStockage"
              value={formData.lieuStockage}
              onChange={handleChange}
              required
              placeholder="Ex: Magasin principal, Étagère A3, etc."
            />
          </div>
        </div>
      </div>
      <div className="stock-form__actions stock-form__actions--main">
        <button type="button" className="stock-form__btn stock-form__btn--outline" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="stock-form__btn" disabled={apiLoading}>
          {isEdit ? 'Modifier' : 'Ajouter'}
        </button>
      </div>
    </div>
  </form>
  )
}

export default AddStockItemForm

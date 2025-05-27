import { useState, useEffect } from "react"
import "./AddStockItemForm.css"
import { equipmentAPI, fournisseurAPI } from "../../services/api"

function AddStockItemForm({ item = null, onSubmit, onCancel, isEdit = false }) {
  // Initialize form data with empty values
  const emptyFormData = {
    name: "",
    reference: "", // Ajout du champ reference même s'il sera généré automatiquement côté serveur
    catégorie: "",
    prixUnitaire: 0,
    stockActuel: 0,
    stockMin: 0,
    stockMax: 0,
    stockSecurite: 0,
    fournisseur: "",
    prixEuro: 0 // Ajout du champ pour le prix en euros
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
        catégorie: item.catégorie || "",
        prixUnitaire: item.prixUnitaire || 0,
        stockActuel: item.stockActuel || 0,
        stockMin: item.stockMin || 0,
        stockMax: item.stockMax || 0,
        stockSecurite: item.stockSecurite || 0,
        fournisseur: item.fournisseur ? item.fournisseur._id : "",
        prixEuro: item.prixEuro || 0 // Ajout du champ pour le prix en euros
      }
    : emptyFormData

  const [formData, setFormData] = useState(initialData)

  // Update form data when item changes
  useEffect(() => {
    if (item && isEdit) {
      const newData = {
        name: item.name || "",
        catégorie: item.catégorie || "",
        prixUnitaire: item.prixUnitaire || 0,
        stockActuel: item.stockActuel || 0,
        stockMin: item.stockMin || 0,
        stockMax: item.stockMax || 0,
        stockSecurite: item.stockSecurite || 0,
        fournisseur: item.fournisseur ? item.fournisseur._id : "",
      }
      setFormData(newData)
    }
  }, [item, isEdit])
  const [fournisseurList, setFournisseurList] = useState([])

  // Fetch fournisseur list for dropdown
  useEffect(() => {
    const fetchFournisseurs = async () => {
      try {
        const response = await fournisseurAPI.getAllFournisseurs();
        if (response.data) {
          setFournisseurList(response.data);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des fournisseurs:", error);
      }
    };
    fetchFournisseurs();
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
        reference: item.reference || "", // Ajout du champ reference
        catégorie: item.catégorie || "",
        prixUnitaire: item.prixUnitaire || 0,
        stockActuel: item.stockActuel || 0,
        stockMin: item.stockMin || 0,
        stockMax: item.stockMax || 0,
        stockSecurite: item.stockSecurite || 0,
        fournisseur: item.fournisseur ? item.fournisseur._id : "",
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
    setApiError(null);

    try {
      // Simuler un délai réseau
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Préparer l'objet à retourner, avec l'ID si on est en mode édition
      const itemToSubmit = {
        ...(isEdit && item ? { _id: item._id } : {}),
        ...formData,
      }
      
      // Soumettre les données
      await onSubmit(itemToSubmit)
      
      // Réinitialiser le formulaire si ce n'est pas en mode édition
      if (!isEdit) {
        setFormData(emptyFormData);
      }
    } catch (err) {
      setApiError("Une erreur est survenue lors de l'enregistrement. Veuillez réessayer.")
    } finally {
      setApiLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="stock-form">
      {apiError && <div className="stock-form__error">{apiError}</div>}

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
            />
          </div>
          <div className="stock-form__group">
            <label htmlFor="fournisseur">Fournisseur *</label>
            <select
              id="fournisseur"
              name="fournisseur"
              value={formData.fournisseur || ''}
              onChange={handleChange}
              required
              disabled={apiLoading}
            >
              <option value="">Sélectionnez un fournisseur</option>
              {fournisseurList.map((fournisseur) => (
                <option key={fournisseur._id} value={fournisseur._id}>
                  {fournisseur.nomEntreprise} - {fournisseur.nom + ' ' + fournisseur.prenom}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="stock-form__row">
          <div className="stock-form__group">
            <label htmlFor="catégorie">Catégorie *</label>
            <select
              id="catégorie"
              name="catégorie"
              value={formData.catégorie || ''}
              onChange={handleChange}
              required
              disabled={apiLoading}
            >
              <option value="">Sélectionnez une catégorie</option>
              <option value="Fournitures">Fournitures</option>
              <option value="Matériel">Matériel</option>
              <option value="Papier">Papier</option>
              <option value="Électronique">Électronique</option>
              <option value="Autre">Autre</option>
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
            />
          </div>
        </div>
      </div>  
      <div className="stock-form__actions stock-form__actions--main">
        <button type="button" className="stock-form__btn stock-form__btn--outline" onClick={onCancel}>
          Annuler
        </button>
        <button type="submit" className="stock-form__btn stock-form__btn--primary" disabled={apiLoading}>
          {loading ? "Enregistrement..." : isEdit ? "Enregistrer les modifications" : "Ajouter l'article"}
        </button>
      </div>
      </div>
    </form>
  )
}

export default AddStockItemForm

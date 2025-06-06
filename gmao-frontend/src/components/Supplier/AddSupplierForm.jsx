import { useState, useEffect } from "react"
import "./AddSupplierForm.css"
import { toast } from 'react-hot-toast';

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
          quantiteMinCommande: ""
        }
  )

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
        quantiteMinCommande: supplier.quantiteMinCommande || "",
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
        adresse: formData.adresse,
        quantiteMinCommande: Number(formData.quantiteMinCommande) || ""
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
              </div>

              <div className="supplier-form-group">
                <label>Adresse:</label>
                <textarea
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  placeholder="Adresse complète"
                  rows="3"
                />
              </div>

              <div className="supplier-form-group">
                <label>Quantité minimale à commander:</label>
                <input
                  type="text"
                  name="quantiteMinCommande"
                  value={formData.quantiteMinCommande || ''}
                  onChange={(e) => {
                    // N'autoriser que les nombres entiers positifs
                    const value = e.target.value;
                    if (value === '' || /^\d+$/.test(value)) {
                      handleChange({
                        target: {
                          name: 'quantiteMinCommande',
                          value: value === '' ? '' : parseInt(value, 10)
                        }
                      });
                    }
                  }}
                  pattern="\d*"
                  inputMode="numeric"
                  placeholder="0"
                />
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

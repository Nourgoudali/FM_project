import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { inventaireAPI, stockAPI } from '../../services/api';
import './InventaireForm.css';

const AddInventaireForm = ({ onClose, onAddSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [traitements, setTraitements] = useState([]);
  const [raisonsEcart, setRaisonsEcart] = useState([]);
  const [formData, setFormData] = useState({
    traitementId: '',
    quantite: '',
    stockTheorique: '',
    raisonEcart: '',
    selectedProduitIndex: -1
  });
  const [calculatedEcart, setCalculatedEcart] = useState(0);

  // Récupérer la liste des traitements et des raisons d'écart
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [traitementsResponse, raisonsResponse] = await Promise.all([
          stockAPI.getTraitementsPourInventaire(),
          inventaireAPI.getRaisonsEcart()
        ]);
        setTraitements(traitementsResponse.data);
        setRaisonsEcart(raisonsResponse.data);
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError("Impossible de charger les données nécessaires. Veuillez réessayer plus tard.");
      }
    };

    fetchData();
  }, []);

  // Cet effet a été remplacé par la logique dans handleProduitChange

  // Calculer l'écart automatiquement
  useEffect(() => {
    const quantite = parseFloat(formData.quantite) || 0;
    const stockTheorique = parseFloat(formData.stockTheorique) || 0;
    const ecart = quantite - stockTheorique;
    setCalculatedEcart(ecart);

    // Mettre à jour automatiquement la raison d'écart
    if (ecart === 0 && formData.raisonEcart !== 'Aucun écart') {
      setFormData(prev => ({
        ...prev,
        raisonEcart: 'Aucun écart'
      }));
    } else if (ecart !== 0 && formData.raisonEcart === 'Aucun écart') {
      setFormData(prev => ({
        ...prev,
        raisonEcart: 'Autre'
      }));
    }
  }, [formData.quantite, formData.stockTheorique]);

  const handleTraitementChange = (e) => {
    const { value } = e.target;
    setFormData(prev => ({
      ...prev,
      traitementId: value,
      selectedProduitIndex: -1, // Réinitialiser l'index du produit sélectionné
      stockTheorique: '',
      quantite: ''
    }));
  };

  const handleProduitChange = (e) => {
    const { value } = e.target;
    const index = parseInt(value);
    setFormData(prev => ({
      ...prev,
      selectedProduitIndex: index
    }));
    
    // Trouver le traitement et le produit sélectionnés
    const selectedTraitement = traitements.find(t => t._id === formData.traitementId);
    if (selectedTraitement && selectedTraitement.produits && index >= 0) {
      const produitInfo = selectedTraitement.produits.find(p => p.index === index);
      if (produitInfo) {
        // Mettre à jour le stock théorique et la quantité réelle
        setFormData(prev => ({
          ...prev,
          stockTheorique: produitInfo.quantiteCommandee.toString(),
          quantite: produitInfo.quantiteRecue.toString()
        }));
      }
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.traitementId === '' || formData.selectedProduitIndex < 0) {
      setError("Veuillez sélectionner un traitement et un produit.");
      setLoading(false);
      return;
    }

    try {
      // Récupérer l'index réel du produit dans le traitement
      const selectedTraitement = traitements.find(t => t._id === formData.traitementId);
      if (!selectedTraitement) {
        throw new Error("Traitement non trouvé");
      }
      
      const selectedProduit = selectedTraitement.produits.find(p => p.index === formData.selectedProduitIndex);
      if (!selectedProduit) {
        throw new Error("Produit non trouvé dans le traitement");
      }

      await inventaireAPI.createInventaire({
        traitementId: formData.traitementId,
        produitIndex: selectedProduit.index,
        quantite: parseFloat(formData.quantite) || 0,
        stockTheorique: parseFloat(formData.stockTheorique) || 0,
        raisonEcart: formData.raisonEcart,
      });

      setSuccess(true);
      setTimeout(() => {
        onAddSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error("Erreur lors de la création de l'inventaire:", err);
      setError(err.response?.data?.message || "Une erreur est survenue lors de la création de l'inventaire.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inventaire-modal-overlay">
      <div className="inventaire-modal">
        <div className="inventaire-modal-header">
          <h2>Ajouter un inventaire</h2>
          <button className="inventaire-modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {success ? (
          <div className="inventaire-success-message">
            Inventaire ajouté avec succès!
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && <div className="inventaire-error-message">{error}</div>}

            <div className="inventaire-form-group">
              <label htmlFor="traitementId">Bon de Livraison *</label>
              <select
                id="traitementId"
                name="traitementId"
                value={formData.traitementId}
                onChange={handleTraitementChange}
                required
                className="inventaire-form-select"
              >
                <option value="">Sélectionner un traitement</option>
                {traitements.map((traitement) => (
                  <option key={traitement._id} value={traitement._id}>
                    BL: {traitement.numeroBL} - Date: {new Date(traitement.dateReception).toLocaleDateString()} - Commande: {traitement.commande}
                  </option>
                ))}
              </select>
            </div>

            {formData.traitementId && (
              <div className="inventaire-form-group">
                <label htmlFor="selectedProduitIndex">Produit *</label>
                <select
                  id="selectedProduitIndex"
                  name="selectedProduitIndex"
                  value={formData.selectedProduitIndex}
                  onChange={handleProduitChange}
                  required
                  className="inventaire-form-select"
                  disabled={!formData.traitementId}
                >
                  <option value="-1">Sélectionner un produit</option>
                  {traitements
                    .find(t => t._id === formData.traitementId)?.produits
                    .map(produitItem => (
                      <option key={produitItem.index} value={produitItem.index}>
                        {produitItem.produit.reference} - {produitItem.produit.name || produitItem.produit.nom} ({produitItem.quantiteCommandee} commandé / {produitItem.quantiteRecue} reçu)
                      </option>
                    ))}
                </select>
              </div>
            )}


            <div className="inventaire-form-row">
              <div className="inventaire-form-group">
                <label htmlFor="stockTheorique">Stock théorique *</label>
                <input
                  type="number"
                  id="stockTheorique"
                  name="stockTheorique"
                  value={formData.stockTheorique}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  placeholder="0"
                />
              </div>

              <div className="inventaire-form-group">
                <label htmlFor="quantite">Stock réel compté *</label>
                <input
                  type="number"
                  id="quantite"
                  name="quantite"
                  value={formData.quantite}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="inventaire-form-row">
              <div className="inventaire-form-group">
                <label htmlFor="ecart">Écart inventaire</label>
                <input
                  type="text"
                  id="ecart"
                  value={calculatedEcart}
                  readOnly
                  className={`inventaire-ecart-field ${calculatedEcart < 0 ? 'negative' : calculatedEcart > 0 ? 'positive' : ''}`}
                />
              </div>

              <div className="inventaire-form-group">
                <label htmlFor="raisonEcart">Raison de l'écart</label>
                <select
                  id="raisonEcart"
                  name="raisonEcart"
                  value={formData.raisonEcart}
                  onChange={handleChange}
                  disabled={calculatedEcart === 0}
                >
                  {raisonsEcart.map(raison => (
                    <option key={raison} value={raison}>
                      {raison}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="inventaire-form-buttons">
              <button
                type="button"
                className="inventaire-form-cancel"
                onClick={onClose}
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inventaire-form-submit"
                disabled={loading}
              >
                {loading ? "Enregistrement..." : "Enregistrer l'inventaire"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddInventaireForm;

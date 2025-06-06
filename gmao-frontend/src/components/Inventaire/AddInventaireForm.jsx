import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { inventaireAPI, stockAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import './InventaireForm.css';
import toast from 'react-hot-toast';

const AddInventaireForm = ({ onClose, onAddSuccess }) => {
  const { user, isAuthenticated, userId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [produits, setProduits] = useState([]);
  const [raisonsEcart, setRaisonsEcart] = useState([]);
  const [notes, setNotes] = useState('');
  const [selectedProduits, setSelectedProduits] = useState([]);
  
  // Informations utilisateur récupérées du contexte d'authentification

  // Récupérer la liste des produits et des raisons d'écart
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [produitsResponse, raisonsResponse] = await Promise.all([
          stockAPI.getAllStocks(),
          inventaireAPI.getRaisonsEcart()
        ]);
        setProduits(produitsResponse.data);
        setRaisonsEcart(raisonsResponse.data);
      } catch (err) {
        toast.error("Impossible de charger les données nécessaires. Veuillez réessayer plus tard.");
      }
    };

    fetchData();
  }, []);

  // Ajouter un produit à l'inventaire
  const handleAddProduit = () => {
    setSelectedProduits([...selectedProduits, {
      produitId: '',
      quantiteComptee: "",
      stockTheorique: "",
      ecart: "",
      raisonEcart: 'Aucun écart'
    }]);
  };

  const getEcartClass = (stockTheorique, quantiteComptee) => {
    if(stockTheorique === quantiteComptee) {
      return "inventaire-ecart-neutral"
    }
    else if(stockTheorique < quantiteComptee) {
      return "inventaire-ecart-positive"
    }
    else {
      return "inventaire-ecart-negative"
    }
  }

  // Supprimer un produit de l'inventaire
  const handleRemoveProduit = (index) => {
    const updatedProduits = [...selectedProduits];
    updatedProduits.splice(index, 1);
    setSelectedProduits(updatedProduits);
  };

  // Mettre à jour les données d'un produit
  const handleProduitChange = (index, field, value) => {
    const updatedProduits = [...selectedProduits];
    updatedProduits[index][field] = value;

    // Si le produit change, mettre à jour le stock théorique
    if (field === 'produitId') {
      const selectedProduit = produits.find(p => p._id === value);
      if (selectedProduit) {
        updatedProduits[index].stockTheorique = selectedProduit.stockActuel;
      }
    }

    // Calculer l'écart
    if (field === 'produitId' || field === 'quantiteComptee' || field === 'stockTheorique') {
      const quantiteComptee = parseFloat(updatedProduits[index].quantiteComptee) || 0;
      const stockTheorique = parseFloat(updatedProduits[index].stockTheorique) || 0;
      updatedProduits[index].ecart = quantiteComptee - stockTheorique;

      // Mettre à jour la raison d'écart
      if (updatedProduits[index].ecart === 0) {
        updatedProduits[index].raisonEcart = 'Aucun écart';
      } else if (updatedProduits[index].raisonEcart === 'Aucun écart') {
        updatedProduits[index].raisonEcart = 'Autre';
      }
    }

    setSelectedProduits(updatedProduits);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Vérifier si au moins un produit est sélectionné
    if (selectedProduits.length === 0) {
      toast.error("Veuillez ajouter au moins un produit à l'inventaire.");
      setLoading(false);
      return;
    }
    
    // Vérifier si l'utilisateur est authentifié
    if (!isAuthenticated) {
      toast.error("Vous devez être connecté pour créer un inventaire.");
      setLoading(false);
      return;
    }

    // Vérifier que tous les produits ont un ID valide
    const invalidProduit = selectedProduits.find(p => !p.produitId);
    if (invalidProduit) {
      toast.error("Veuillez sélectionner un produit pour chaque ligne.");
      setLoading(false);
      return;
    }

    try {
      // Préparer les données pour l'API en utilisant directement l'ID utilisateur du contexte
      const inventaireData = {
        produits: selectedProduits.map(p => ({
          produitId: p.produitId,
          quantiteComptee: parseFloat(p.quantiteComptee) || 0,
          stockTheorique: parseFloat(p.stockTheorique) || 0,
          raisonEcart: p.raisonEcart
        })),
        notes,
        utilisateur: userId // Utiliser l'ID utilisateur exposé par le contexte d'authentification
      };

      await inventaireAPI.createInventaire(inventaireData);

      toast.success("Inventaire ajouté avec succès!");
      setTimeout(() => {
        onAddSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      toast.error("Une erreur est survenue lors de l'ajout de l'inventaire.");
      setLoading(false);
    }
  };

  return (
    <div className="inventaire-modal-overlay">
      <div className="inventaire-modal">
        <div className="inventaire-modal-header">
          <h2>Ajouter un inventaire</h2>
          <button className="inventaire-modal-close" onClick={onClose} title="Fermer">
            <FaTimes />
          </button>
        </div>

          <form onSubmit={handleSubmit}>

            <div className="inventaire-produits-section">
              <div className="inventaire-section-header">
                <h3>Produits à inventorier</h3>
                <button
                  type="button"
                  className="inventaire-add-btn"
                  onClick={handleAddProduit}
                >
                  <FaPlus /> Ajouter un produit
                </button>
              </div>

              {selectedProduits.length === 0 ? (
                <div className="inventaire-no-products">
                  Aucun produit sélectionné. Cliquez sur "Ajouter un produit" pour commencer.
                </div>
              ) : (
                <div className="inventaire-produits-list">
                  {selectedProduits.map((item, index) => (
                    <div key={index} className="inventaire-produit-item">
                      <div className="inventaire-produit-header">
                        <h4>Produit {index + 1}</h4>
                        <button
                          type="button"
                          className="inventaire-remove-btn"
                          onClick={() => handleRemoveProduit(index)}
                        >
                          <FaTrash />
                        </button>
                      </div>

                      <div className="inventaire-form-row">
                        <div className="inventaire-form-group">
                          <label>Produit</label>
                          <select
                            value={item.produitId}
                            onChange={(e) => handleProduitChange(index, 'produitId', e.target.value)}
                            required
                          >
                            <option value="">Sélectionnez un produit</option>
                            {produits.map((produit) => (
                              <option key={produit._id} value={produit._id}>
                                {produit.reference} - {produit.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="inventaire-form-row">
                        <div className="inventaire-form-group">
                          <label>Stock théorique</label>
                          <input
                            type="text"
                            value={item.stockTheorique}
                            readOnly
                            className="inventaire-readonly-input"
                          />
                        </div>

                        <div className="inventaire-form-group">
                          <label>Quantité comptée</label>
                          <input
                            type="text"
                            value={item.quantiteComptee}
                            onChange={(e) => {
                              // N'autoriser que les nombres décimaux positifs
                              const value = e.target.value;
                              if (value === '' || /^\d*\.?\d*$/.test(value)) {
                                handleProduitChange(index, 'quantiteComptee', value);
                              }
                            }}
                            pattern="\d*(\.\d*)?"
                            inputMode="decimal"
                            placeholder="0"
                            required
                          />
                        </div>
                      </div>

                      <div className="inventaire-form-row">
                        <div className="inventaire-form-group">
                          <label>Écart</label>
                          <input
                            type="text"
                            value={item.ecart}
                            readOnly
                            className={`inventaire-ecart ${getEcartClass(item.stockTheorique, item.quantiteComptee)}`}
                          />
                        </div>

                        <div className="inventaire-form-group">
                          <label>Raison de l'écart</label>
                          <select
                            value={item.raisonEcart}
                            onChange={(e) => handleProduitChange(index, 'raisonEcart', e.target.value)}
                            disabled={parseFloat(item.ecart) === 0}
                          >
                            {raisonsEcart.map((raison) => (
                              <option key={raison} value={raison}>
                                {raison}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="inventaire-form-group">
              <label>Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajoutez des notes ou commentaires sur cet inventaire..."
                rows="4"
              />
            </div>

            <div className="inventaire-form-actions">
              <button
                type="button"
                className="inventaire-form-cancel"
                onClick={onClose}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inventaire-form-submit"
                disabled={loading || selectedProduits.length === 0}
              >
                {loading ? "Enregistrement..." : "Enregistrer l'inventaire"}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};

export default AddInventaireForm;

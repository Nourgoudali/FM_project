import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { inventaireAPI } from '../../services/api';
import './InventaireForm.css';

const ViewInventaireDetails = ({ inventaireId, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inventaire, setInventaire] = useState(null);

  useEffect(() => {
    const fetchInventaireDetails = async () => {
      try {
        setLoading(true);
        const response = await inventaireAPI.getInventaireById(inventaireId);
        setInventaire(response.data);
        setError(null);
      } catch (err) {
        console.error("Erreur lors de la récupération des détails de l'inventaire:", err);
        setError("Impossible de charger les détails de l'inventaire. Veuillez réessayer plus tard.");
      } finally {
        setLoading(false);
      }
    };

    if (inventaireId) {
      fetchInventaireDetails();
    }
  }, [inventaireId]);

  // Formatage de la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="inventaire-modal-overlay">
      <div className="inventaire-modal inventaire-details-modal">
        <div className="inventaire-modal-header">
          <h2>Détails de l'inventaire</h2>
          <button className="inventaire-modal-close" onClick={onClose} title="Fermer">
            <FaTimes />
          </button>
        </div>

        {loading ? (
          <div className="inventaire-loading">Chargement des détails...</div>
        ) : error ? (
          <div className="inventaire-error">{error}</div>
        ) : inventaire ? (
          <div className="inventaire-details">
            <div className="inventaire-details-section">
              <h3>Informations produit</h3>
              <div className="inventaire-details-row">
                <div className="inventaire-details-label">Référence:</div>
                <div className="inventaire-details-value">{inventaire.traitement?.produits?.[inventaire.produitIndex]?.produit?.reference || 'N/A'}</div>
              </div>
              <div className="inventaire-details-row">
                <div className="inventaire-details-label">Nom du produit:</div>
                <div className="inventaire-details-value">{inventaire.traitement?.produits?.[inventaire.produitIndex]?.produit?.name || 'N/A'}</div>
              </div>
              <div className="inventaire-details-row">
                <div className="inventaire-details-label">Lieu de stockage:</div>
                <div className="inventaire-details-value">{inventaire.traitement?.produits?.[inventaire.produitIndex]?.produit?.lieuStockage || 'N/A'}</div>
              </div>
            </div>

            <div className="inventaire-details-section">
              <h3>Informations d'inventaire</h3>
              <div className="inventaire-details-row">
                <div className="inventaire-details-label">Stock théorique:</div>
                <div className="inventaire-details-value">{inventaire.stockTheorique}</div>
              </div>
              <div className="inventaire-details-row">
                <div className="inventaire-details-label">Stock réel compté:</div>
                <div className="inventaire-details-value">{inventaire.quantite}</div>
              </div>
              <div className="inventaire-details-row">
                <div className="inventaire-details-label">Écart:</div>
                <div className={`inventaire-details-value inventaire-ecart ${inventaire.ecart < 0 ? 'negative' : inventaire.ecart > 0 ? 'positive' : ''}`}>
                  {inventaire.ecart}
                </div>
              </div>
              <div className="inventaire-details-row">
                <div className="inventaire-details-label">Raison de l'écart:</div>
                <div className="inventaire-details-value">{inventaire.raisonEcart}</div>
              </div>
            </div>

            <div className="inventaire-details-section">
              <h3>Informations complémentaires</h3>
              <div className="inventaire-details-row">
                <div className="inventaire-details-label">Date d'inventaire:</div>
                <div className="inventaire-details-value">{formatDate(inventaire.dateInventaire)}</div>
              </div>
              {inventaire.createdBy && (
                <div className="inventaire-details-row">
                  <div className="inventaire-details-label">Créé par:</div>
                  <div className="inventaire-details-value">
                    {inventaire.createdBy.prenom} {inventaire.createdBy.nom}
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="inventaire-error">Inventaire non trouvé</div>
        )}

        <div className="inventaire-form-buttons">
          <button
            type="button"
            className="inventaire-form-cancel"
            onClick={onClose}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewInventaireDetails;
